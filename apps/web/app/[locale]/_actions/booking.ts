"use server";

import { createHash } from "node:crypto";
import { z } from "zod";
import { headers } from "next/headers";
import { getStripe } from "@/lib/stripe/server";
import { cleanerCanReceive } from "@/lib/stripe/connect";
import { getCleanerProfileById } from "@/lib/data/cleaners";
import { computePrice, type PriceBreakdown } from "@/lib/booking/pricing";
import { bookingReference } from "@/lib/booking/reference";
import { env } from "@/lib/env";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { rateLimit, getIdentifier } from "@/lib/rate-limit";

/**
 * Rechaza caracteres de control (C0 < 0x20 y DEL 0x7F) sin usar un regex con
 * bytes de control en el fuente. Anti header/template injection downstream
 * (metadata Stripe, emails Resend). Permite espacios, letras unicode, puntuación.
 */
function noControlChars(s: string): boolean {
  for (const ch of s) {
    const code = ch.codePointAt(0) ?? 0;
    if (code < 0x20 || code === 0x7f) return false;
  }
  return true;
}

/**
 * Construye un UUID v4 determinista a partir de un hash sha256 (hex). Mismo
 * payload de booking → mismo UUID → misma fila pending. No usamos `randomUUID`
 * porque queremos que el re-submit del mismo booking apunte a la misma fila
 * (defensa-en-profundidad sobre la idempotencia de Stripe).
 */
function uuidFromHash(hashHex: string): string {
  // Tomamos los primeros 32 hex chars y damos formato UUID v4 RFC 4122.
  const h = hashHex.slice(0, 32);
  const variant = ((parseInt(h[16] ?? "8", 16) & 0x3) | 0x8).toString(16);
  return [
    h.slice(0, 8),
    h.slice(8, 12),
    "4" + h.slice(13, 16), // version 4
    variant + h.slice(17, 20),
    h.slice(20, 32),
  ].join("-");
}

const safeStr = (min: number, max: number) =>
  z.string().trim().min(min).max(max).refine(noControlChars, "invalid_chars");

const schema = z.object({
  cleanerId: z.string().min(1).max(60),
  m2: z.coerce.number().int().min(10).max(500),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.enum(["morning", "afternoon", "evening"]),
  frequency: z.enum(["once", "weekly", "biweekly"]),
  street: safeStr(2, 120),
  postcode: z.string().trim().regex(/^\d{4}\s?[A-Za-z]{2}$/, "invalid_postcode"),
  city: safeStr(2, 80),
  notes: z.string().trim().max(500).optional(),
  email: z.string().trim().email().max(160),
  name: safeStr(2, 120),
});

export type BookingInput = z.infer<typeof schema>;
export type BookingCheckoutResult = { ok: true; url: string } | { ok: false; error: string };

// Metadata SIN PII (la dirección vive en `bookings`, no en Stripe).
// `booking_id` linkea la session de Stripe con la fila pending pre-creada.
function bookingMeta(
  cleanerId: string,
  d: BookingInput,
  p: PriceBreakdown,
  bookingId: string,
): Record<string, string> {
  return {
    booking_id: bookingId,
    cleaner_id: cleanerId,
    m2: String(d.m2),
    hours: String(p.hours),
    date: d.date,
    time: d.time,
    frequency: d.frequency,
    subtotal_cents: String(p.subtotalCents),
    fee_cents: String(p.feeCents),
    total_cents: String(p.totalCents),
  };
}

/**
 * Pre-Stripe: persiste la reserva como `pending` con TODA la data
 * (incluyendo address, que no entra en Stripe metadata por privacidad).
 * Degrada con gracia si Supabase no está configurado — el flow sigue.
 * Retorna el `booking_id` que se pasa a Stripe en metadata.
 */
async function persistPendingBooking(
  bookingId: string,
  data: BookingInput,
  price: PriceBreakdown,
  cleanerId: string,
  clientUserId: string | null,
): Promise<void> {
  const db = createSupabaseAdminClient();
  if (!db) return; // dev local sin Supabase — el booking no se persiste, ok.
  const { error } = await db.from("bookings").insert({
    id: bookingId,
    reference: bookingReference(bookingId),
    cleaner_id: cleanerId,
    client_email: data.email,
    client_name: data.name,
    client_user_id: clientUserId,
    scheduled_date: data.date,
    scheduled_time: data.time,
    frequency: data.frequency,
    m2: data.m2,
    hours: price.hours,
    subtotal_cents: price.subtotalCents,
    fee_cents: price.feeCents,
    total_cents: price.totalCents,
    currency: "eur",
    status: "pending",
    street: data.street,
    postcode: data.postcode,
    city: data.city,
    notes: data.notes ?? null,
  });
  if (error && process.env.NODE_ENV !== "production") {
    console.warn("[booking] pending insert failed:", error.message);
  }
}

/** Origin canónico: SIEMPRE de la config (no del header `host`, manipulable). */
async function canonicalOrigin(): Promise<string> {
  if (env.NEXT_PUBLIC_SITE_URL) return env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  // Fallback solo para dev local sin SITE_URL configurada.
  const h = await headers();
  const host = h.get("host") ?? "localhost:3000";
  const proto = host.startsWith("localhost") || host.startsWith("127.") ? "http" : "https";
  return `${proto}://${host}`;
}

/**
 * Server Action — crea una Stripe Checkout Session (TEST) para una reserva.
 *
 * Cobro inmediato (no auth holds — regla del brief). El "escrow" se implementa
 * vía Connect (transfer al cleaner al confirmar) en Fase 4 — por eso no usamos
 * manual capture (rompería iDEAL). El precio es server-authoritative (se deriva
 * del cleaner del server, nunca del cliente). Idempotente: doble-submit no
 * crea cargos duplicados. La persistencia en `bookings` (Supabase) + la
 * verificación real del pago las hace el webhook (Fase 4).
 */
export async function createBookingCheckout(raw: unknown): Promise<BookingCheckoutResult> {
  // Rate limit: la idempotencia cubre re-submits del MISMO payload, pero sin
  // límite un atacante variando payloads crea sesiones Stripe + filas pending
  // sin tope. 5 checkouts / 5 min por IP sobra para un usuario real.
  const hdrs = await headers();
  if (!rateLimit("checkout", getIdentifier(hdrs), { limit: 5, windowMs: 300_000 })) {
    return { ok: false, error: "rate_limited" };
  }

  const parsed = schema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: "invalid_input" };
  const data = parsed.data;

  const cleaner = await getCleanerProfileById(data.cleanerId);
  if (!cleaner) return { ok: false, error: "cleaner_not_found" };

  const price = computePrice(cleaner.pricePerHour, data.m2);
  const origin = await canonicalOrigin();

  // Idempotency: hash estable del payload → reintentos/doble-click no duplican.
  const idempotencyKey = createHash("sha256")
    .update(`${cleaner.id}|${data.date}|${data.time}|${data.email}|${price.totalCents}`)
    .digest("hex");

  // Derivamos el booking_id del idempotencyKey: el mismo payload → mismo UUID →
  // misma fila pending → re-submit no duplica (anti doble-insert defensa-en-profundidad).
  const bookingId = uuidFromHash(idempotencyKey);
  const meta = bookingMeta(cleaner.id, data, price, bookingId);

  // Auth opcional: si el usuario está logueado, lincamos su user.id. Si no, NULL
  // (el flujo permite checkout anónimo — el match posterior será por email).
  let clientUserId: string | null = null;
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    clientUserId = user?.id ?? null;
  } catch {
    // Supabase no configurado en dev — clientUserId queda null.
  }

  await persistPendingBooking(bookingId, data, price, cleaner.id, clientUserId);

  // Connect: si el cleaner tiene cuenta Express activa, el cargo es un
  // destination charge → `subtotal` se transfiere al cleaner y la plataforma
  // retiene `feeCents` (application_fee). Si no (cleaner sin onboarding o
  // Connect off), cae a un cargo normal — nada se rompe, la comisión se
  // concilia luego. La comisión NUNCA sale de la plataforma.
  const useConnect = cleanerCanReceive({
    stripeAccountId: cleaner.stripeAccountId,
    stripeChargesEnabled: cleaner.stripeChargesEnabled,
  });
  const connectPaymentIntentData = useConnect && cleaner.stripeAccountId
    ? {
        application_fee_amount: price.feeCents,
        transfer_data: { destination: cleaner.stripeAccountId },
      }
    : {};

  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create(
      {
        mode: "payment",
        locale: "nl",
        customer_email: data.email,
        line_items: [
          {
            quantity: 1,
            price_data: {
              currency: "eur",
              unit_amount: price.subtotalCents,
              product_data: {
                name: `Schoonmaak — ${cleaner.name}`,
                description: `${price.hours} uur · ${data.m2} m² · ${data.date}`,
              },
            },
          },
          {
            quantity: 1,
            price_data: {
              currency: "eur",
              unit_amount: price.feeCents,
              product_data: {
                name: "Servicekosten (18%)",
                description: "Verificatie · escrow · klantsupport",
              },
            },
          },
        ],
        payment_intent_data: { metadata: meta, ...connectPaymentIntentData },
        metadata: meta,
        success_url: `${origin}/booking/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/schoonmakers/${cleaner.id}?canceled=1`,
      },
      { idempotencyKey },
    );

    if (!session.url) return { ok: false, error: "no_url" };
    return { ok: true, url: session.url };
  } catch (err) {
    if (process.env.NODE_ENV !== "production") {
      const msg = err instanceof Error ? err.message : "unknown";
      console.warn("[booking] stripe error:", msg);
    }
    return { ok: false, error: "stripe_error" };
  }
}
