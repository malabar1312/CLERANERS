// ============================================================
// Edge Function: stripe-webhook
// Verifica la FIRMA del webhook (raw body), aplica anti-replay (idempotencia)
// y actualiza booking/escrow + registra el pago. Solo Stripe puede invocarlo válidamente.
// IMPORTANTE deploy: supabase functions deploy stripe-webhook --no-verify-jwt
//   (Stripe no manda JWT de Supabase; la seguridad es la FIRMA del webhook.)
// ============================================================
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
  apiVersion: "2024-06-20",
  httpClient: Stripe.createFetchHttpClient(),
});
const WEBHOOK_SECRET = Deno.env.get("STRIPE_WEBHOOK_SECRET")!;
const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

Deno.serve(async (req) => {
  const sig = req.headers.get("stripe-signature");
  if (!sig) return new Response("missing signature", { status: 400 });

  // RAW body obligatorio: nunca req.json() antes de verificar la firma.
  const raw = await req.text();
  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(raw, sig, WEBHOOK_SECRET);
  } catch (e) {
    return new Response(`signature verification failed: ${String(e?.message ?? e)}`, { status: 400 });
  }

  // Anti-replay / idempotencia: si el evento ya fue procesado, 200 y salir.
  const { error: dupErr } = await supabase.from("webhook_events")
    .insert({ id: event.id, type: event.type });
  if (dupErr) {
    // PK conflict => ya procesado. Cualquier otro error tampoco debe reintentar infinito.
    return new Response("ok (already processed)", { status: 200 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const s = event.data.object as Stripe.Checkout.Session;
        const bookingId = s.metadata?.booking_id;
        const pi = typeof s.payment_intent === "string" ? s.payment_intent : s.payment_intent?.id;
        if (bookingId) {
          await supabase.from("bookings").update({
            status: "paid", escrow_status: "held", stripe_payment_intent_id: pi ?? null,
          }).eq("id", bookingId);
          await supabase.from("payments").insert({
            booking_id: bookingId, stripe_payment_intent_id: pi ?? null,
            amount_cents: s.amount_total ?? 0, currency: s.currency ?? "eur", status: "succeeded",
          });
          // TODO (Resend): notificar al cleaner que tiene una nueva aanvraag pagada.
        }
        break;
      }
      case "charge.refunded": {
        const ch = event.data.object as Stripe.Charge;
        const pi = typeof ch.payment_intent === "string" ? ch.payment_intent : ch.payment_intent?.id;
        if (pi) {
          await supabase.from("bookings").update({ status: "refunded", escrow_status: "refunded" })
            .eq("stripe_payment_intent_id", pi);
          await supabase.from("payments").update({ status: "refunded" })
            .eq("stripe_payment_intent_id", pi);
        }
        break;
      }
      case "account.updated": {
        // Connect onboarding: sincroniza si el cleaner ya puede cobrar.
        const acct = event.data.object as Stripe.Account;
        await supabase.from("cleaners").update({
          stripe_charges_enabled: acct.charges_enabled ?? false,
          stripe_payouts_enabled: acct.payouts_enabled ?? false,
        }).eq("stripe_account_id", acct.id);
        break;
      }
      default:
        // Otros eventos: registrados en webhook_events, sin acción.
        break;
    }
    return new Response("ok", { status: 200 });
  } catch (e) {
    // Error procesando: devolvemos 500 para que Stripe reintente (el evento NO se marcó dup correctamente).
    await supabase.from("webhook_events").delete().eq("id", event.id);
    return new Response(`handler error: ${String(e?.message ?? e)}`, { status: 500 });
  }
});
