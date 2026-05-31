import "server-only";
import { NextResponse, type NextRequest } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe/server";
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
 *  3. Procesa el evento de forma idempotente (dedupe por `event.id`).
 *
 * Persistencia en Supabase `bookings` + tabla de idempotencia: se enchufa en
 * el seam marcado `TODO(supabase)` cuando exista el proyecto. Mientras tanto,
 * el handler verifica el pago y deja todo listo (no rompe sin Supabase).
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

  // TODO(supabase): dedupe idempotente — INSERT event.id en `webhook_events`;
  // si ya existe → return 200 sin reprocesar.

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const s = event.data.object;
        // El pago está confirmado por Stripe (no por el cliente).
        // TODO(supabase): upsert en `bookings` { stripe_session_id: s.id,
        //   payment_intent: s.payment_intent, status: 'paid', ...s.metadata }.
        logBooking("paid", s.id, s.amount_total, s.metadata);
        break;
      }
      case "payment_intent.succeeded": {
        const pi = event.data.object;
        // TODO(supabase): marcar booking `status='paid'` si aún no estaba.
        logBooking("payment_intent.succeeded", pi.id, pi.amount, pi.metadata);
        break;
      }
      case "charge.refunded": {
        const c = event.data.object;
        // TODO(supabase): marcar booking `status='refunded'`.
        logBooking("refunded", c.payment_intent as string | null, c.amount_refunded, c.metadata);
        break;
      }
      case "account.updated": {
        // TODO(fase-4): cuenta Connect del cleaner → actualizar
        // `stripe_charges_enabled` cuando el onboarding se complete.
        break;
      }
      default:
        // Eventos no manejados: 200 para que Stripe no reintente.
        break;
    }
  } catch (err) {
    // Error al procesar → 500 para que Stripe reintente (con dedupe ya seremos
    // idempotentes una vez Supabase esté).
    const msg = err instanceof Error ? err.message : "handler_error";
    if (process.env.NODE_ENV !== "production") console.warn("[webhook] handler error:", msg);
    return NextResponse.json({ error: "handler_error" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
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
