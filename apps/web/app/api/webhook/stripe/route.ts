import "server-only";
import { NextResponse, type NextRequest } from "next/server";
import type Stripe from "stripe";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getStripe } from "@/lib/stripe/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { bookingReference } from "@/lib/booking/reference";
import { getCleanerProfileById } from "@/lib/data/cleaners";
import { sendBookingConfirmedEmail } from "@/lib/email/booking";
import { env } from "@/lib/env";

// Node runtime: necesitamos el raw body + crypto para verificar la firma.
// Nunca edge para webhooks de Stripe.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Webhook de Stripe — FUENTE DE VERDAD del pago (el éxito NO se infiere del
 * redirect del cliente, que es spoofeable).
 *
 * Flujo:
 *  1. Lee el raw body + el header `stripe-signature`.
 *  2. Verifica la firma con `STRIPE_WEBHOOK_SECRET` (constructEvent).
 *  3. Dedupe idempotente por `event.id` (tabla `webhook_events`).
 *  4. Persiste en `bookings` con el cliente service-role (bypassa RLS).
 *
 * Si Supabase no está configurado (dev sin keys), el handler verifica el pago y
 * loguea, pero NO persiste — nunca rompe. La idempotencia real la garantiza el
 * `upsert` por `stripe_session_id` (reintentos de Stripe no duplican filas).
 *
 * Local dev: `stripe listen --forward-to localhost:3000/api/webhook/stripe`
 * (el CLI imprime el `whsec_…` → ponelo en STRIPE_WEBHOOK_SECRET).
 */
export async function POST(req: NextRequest) {
  if (!env.STRIPE_WEBHOOK_SECRET) {
    // Sin secret no podemos verificar → no aceptamos nada (fail closed).
    return NextResponse.json({ error: "webhook_not_configured" }, { status: 503 });
  }

  const sig = req.headers.get("stripe-signature");
  if (!sig) return NextResponse.json({ error: "missing_signature" }, { status: 400 });

  const raw = await req.text();

  let event: Stripe.Event;
  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(raw, sig, env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "invalid";
    if (process.env.NODE_ENV !== "production") console.warn("[webhook] bad signature:", msg);
    return NextResponse.json({ error: "invalid_signature" }, { status: 400 });
  }

  const db = createSupabaseAdminClient(); // null si Supabase no está configurado.

  // Dedupe idempotente: si ya procesamos este event.id, salimos sin reprocesar.
  // (Marcamos como procesado DESPUÉS del handler, para que un fallo → 500 →
  // reintento de Stripe sí reprocese.)
  if (db) {
    const { data: seen } = await db
      .from("webhook_events")
      .select("id")
      .eq("id", event.id)
      .maybeSingle();
    if (seen) return NextResponse.json({ received: true, duplicate: true });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const s = event.data.object;
        await persistPaidBooking(db, s);
        break;
      }
      case "payment_intent.succeeded": {
        const pi = event.data.object;
        logBooking("payment_intent.succeeded", pi.id, pi.amount, pi.metadata);
        break;
      }
      case "charge.refunded": {
        const c = event.data.object;
        await markRefunded(db, typeof c.payment_intent === "string" ? c.payment_intent : null);
        logBooking("refunded", typeof c.payment_intent === "string" ? c.payment_intent : null, c.amount_refunded, c.metadata);
        break;
      }
      case "account.updated": {
        // Cuenta Connect del cleaner → reflejar si ya puede recibir fondos
        // (capability `transfers` activa). Fuente de verdad del estado payout.
        const acct = event.data.object;
        await markConnectStatus(db, acct.id, acct.capabilities?.transfers === "active");
        break;
      }
      default:
        // Eventos no manejados: 200 para que Stripe no reintente.
        break;
    }
  } catch (err) {
    // Error al procesar → 500 para que Stripe reintente (aún NO marcamos el
    // evento como procesado, así el reintento sí lo reprocesa).
    const msg = err instanceof Error ? err.message : "handler_error";
    if (process.env.NODE_ENV !== "production") console.warn("[webhook] handler error:", msg);
    return NextResponse.json({ error: "handler_error" }, { status: 500 });
  }

  // Marcar el evento como procesado (best-effort; el upsert ya es idempotente).
  if (db) {
    const { error } = await db.from("webhook_events").insert({ id: event.id, type: event.type });
    if (error && error.code !== "23505" && process.env.NODE_ENV !== "production") {
      console.warn("[webhook] event log error:", error.message);
    }
  }

  return NextResponse.json({ received: true });
}

/**
 * Persiste (o actualiza) la reserva pagada. Idempotente.
 *
 * Estrategia (AUTO-CYCLE 1 — data integrity):
 *  1. Si `metadata.booking_id` existe → la Server Action ya pre-creó una fila
 *     `pending` con dirección + datos completos. Solo actualizamos los campos
 *     del pago (status, payment_intent_id, stripe_session_id, total real,
 *     identidad confirmada por Stripe). NO sobreescribimos address ni input
 *     original (preserva la integridad de lo capturado).
 *  2. Si no hay `booking_id` (bookings legacy o checkouts directos) → upsert
 *     por stripe_session_id como antes (sin address — ese registro va sin ella).
 *
 * Email: después de persistir, envía booking-confirmed al cliente (best-effort).
 * Si falla el email, no rompe el webhook — la reserva queda persistida igual.
 */
async function persistPaidBooking(db: SupabaseClient | null, s: Stripe.Checkout.Session) {
  const m = s.metadata ?? {};
  const pi = typeof s.payment_intent === "string" ? s.payment_intent : null;
  const bookingId = typeof m.booking_id === "string" && m.booking_id.length > 0 ? m.booking_id : null;

  if (!db) {
    logBooking("paid (not persisted — no Supabase)", s.id, s.amount_total, m);
    return;
  }

  const num = (v: string | undefined) => (v != null && v !== "" ? Number(v) : null);
  // Reference: si hay booking_id, derivar de él → consistente con la pending
  // creada por la Server Action y con el success page. Sin booking_id (legacy),
  // fallback a PI/session.
  const reference = bookingReference(bookingId ?? pi ?? s.id);
  const totalFromMeta = num(m.total_cents);
  const total = totalFromMeta ?? (typeof s.amount_total === "number" ? s.amount_total : null);

  if (bookingId) {
    // UPSERT por `id`: self-healing si la fila pending no se creó
    // (Supabase no configurado durante Server Action, error transitorio).
    // Address fields (street, postcode, city, notes) NO van en el payload →
    // se preservan en UPDATE path; quedan NULL en INSERT path (no se podían
    // recuperar de Stripe metadata por privacidad).
    const row = {
      id: bookingId,
      reference,
      stripe_session_id: s.id,
      payment_intent_id: pi,
      cleaner_id: m.cleaner_id ?? "unknown",
      client_email: s.customer_details?.email ?? s.customer_email ?? null,
      client_name: s.customer_details?.name ?? null,
      scheduled_date: m.date ?? null,
      scheduled_time: m.time ?? null,
      frequency: m.frequency ?? null,
      m2: num(m.m2),
      hours: num(m.hours),
      subtotal_cents: num(m.subtotal_cents),
      fee_cents: num(m.fee_cents),
      total_cents: total,
      currency: s.currency ?? "eur",
      status: "paid" as const,
    };
    const { error } = await db.from("bookings").upsert(row, { onConflict: "id" });
    if (error) throw new Error(`booking upsert by id: ${error.message}`);

    // Enviar email (best-effort — nunca rompe). Nombre del CLEANER resuelto
    // del catálogo (no confundir con client_name, que es el cliente).
    const cleaner = await getCleanerProfileById(row.cleaner_id);
    await sendBookingConfirmedEmail({
      clientEmail: row.client_email,
      cleanerName: cleaner?.name ?? "je schoonmaker",
      reference: row.reference,
      scheduledDate: row.scheduled_date,
      scheduledTime: row.scheduled_time,
      hours: row.hours,
      totalCents: row.total_cents,
    });
    return;
  }

  // Fallback legacy: sin booking_id en metadata → upsert por session_id, sin address.
  const row = {
    reference,
    stripe_session_id: s.id,
    payment_intent_id: pi,
    cleaner_id: m.cleaner_id ?? "unknown",
    client_email: s.customer_details?.email ?? s.customer_email ?? null,
    client_name: s.customer_details?.name ?? null,
    scheduled_date: m.date ?? null,
    scheduled_time: m.time ?? null,
    frequency: m.frequency ?? null,
    m2: num(m.m2),
    hours: num(m.hours),
    subtotal_cents: num(m.subtotal_cents),
    fee_cents: num(m.fee_cents),
    total_cents: total,
    currency: s.currency ?? "eur",
    status: "paid" as const,
  };
  const { error } = await db.from("bookings").upsert(row, { onConflict: "stripe_session_id" });
  if (error) throw new Error(`booking upsert: ${error.message}`);

  // Enviar email (best-effort). Nombre del CLEANER, no del cliente.
  const cleaner = await getCleanerProfileById(row.cleaner_id);
  await sendBookingConfirmedEmail({
    clientEmail: row.client_email,
    cleanerName: cleaner?.name ?? "je schoonmaker",
    reference: row.reference,
    scheduledDate: row.scheduled_date,
    scheduledTime: row.scheduled_time,
    hours: row.hours,
    totalCents: row.total_cents,
  });
}

/** Refleja en `cleaner_profiles` si la cuenta Connect ya puede recibir fondos. */
async function markConnectStatus(
  db: SupabaseClient | null,
  accountId: string,
  canReceive: boolean,
) {
  if (!db || !accountId) return;
  const { error } = await db
    .from("cleaner_profiles")
    .update({ stripe_charges_enabled: canReceive })
    .eq("stripe_connect_account_id", accountId);
  if (error) throw new Error(`connect status update: ${error.message}`);
}

/** Marca una reserva como reembolsada por su payment_intent. */
async function markRefunded(db: SupabaseClient | null, paymentIntentId: string | null) {
  if (!db || !paymentIntentId) return;
  const { error } = await db
    .from("bookings")
    .update({ status: "refunded" })
    .eq("payment_intent_id", paymentIntentId);
  if (error) throw new Error(`booking refund: ${error.message}`);
}

function logBooking(
  kind: string,
  id: string | null,
  amount: number | null,
  metadata: Stripe.Metadata | null,
) {
  if (process.env.NODE_ENV === "production") return;
  console.info("[webhook]", kind, {
    id,
    amount,
    cleaner_id: metadata?.cleaner_id,
    date: metadata?.date,
    hours: metadata?.hours,
  });
}
