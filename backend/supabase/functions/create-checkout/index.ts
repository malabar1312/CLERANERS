// ============================================================
// Edge Function: create-checkout
// Crea una Stripe Checkout Session (marketplace / Connect) y un booking 'pending'.
// Modelo: el cliente paga cleaner_amount + 18% servicekosten.
//         La plataforma retiene application_fee (15% del cleaner_amount).
//         El resto se transfiere a la cuenta Connect del cleaner (escrow vía Stripe).
// Seguridad: requiere JWT del cliente · idempotencia · claves solo en env.
// Deploy: supabase functions deploy create-checkout --no-verify-jwt=false
// ============================================================
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
  apiVersion: "2024-06-20",
  httpClient: Stripe.createFetchHttpClient(),
});
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const SITE_URL = Deno.env.get("SITE_URL") ?? "https://getcleaners.nl";

const PLATFORM_FEE_PCT = 0.15;   // comisión plataforma sobre el monto del cleaner
const SERVICE_FEE_PCT  = 0.18;   // recargo al cliente sobre el monto del cleaner

const cors = {
  "Access-Control-Allow-Origin": SITE_URL,
  "Access-Control-Allow-Headers": "authorization, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (b: unknown, s = 200) =>
  new Response(JSON.stringify(b), { status: s, headers: { ...cors, "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "method" }, 405);

  try {
    // --- Auth: identificar al cliente por su JWT ---
    const authHeader = req.headers.get("Authorization") ?? "";
    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE);
    const { data: { user }, error: uErr } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));
    if (uErr || !user) return json({ error: "unauthorized" }, 401);

    const body = await req.json();
    const { cleaner_id, service_type, hours = 3, scheduled_at, address, access_notes } = body ?? {};
    const idemKey = req.headers.get("Idempotency-Key") ?? crypto.randomUUID();
    if (!cleaner_id) return json({ error: "cleaner_id required" }, 400);

    // --- Idempotencia: si ya procesamos esta key, devolvemos lo mismo ---
    const { data: existing } = await supabase
      .from("idempotency_keys").select("response").eq("key", idemKey).maybeSingle();
    if (existing?.response) return json(existing.response);

    // --- Cleaner + Connect account ---
    const { data: cleaner, error: cErr } = await supabase
      .from("cleaners")
      .select("id, hourly_rate, stripe_account_id, stripe_charges_enabled, full_name")
      .eq("id", cleaner_id).maybeSingle();
    if (cErr || !cleaner) return json({ error: "cleaner not found" }, 404);
    if (!cleaner.stripe_account_id || !cleaner.stripe_charges_enabled)
      return json({ error: "cleaner_not_payable", message: "Deze schoonmaker kan nog geen betalingen ontvangen." }, 409);

    // --- Cálculo de montos (en centavos) ---
    const rate = Number(cleaner.hourly_rate ?? 0);
    const h = Math.max(1, Number(hours));
    const cleanerAmount = Math.round(rate * h * 100);
    const serviceFee = Math.round(cleanerAmount * SERVICE_FEE_PCT);  // lo paga el cliente
    const platformFee = Math.round(cleanerAmount * PLATFORM_FEE_PCT); // lo retiene la plataforma
    const total = cleanerAmount + serviceFee;

    // --- Crear booking 'pending' (service role bypassa RLS) ---
    const reference = "BK-" + crypto.randomUUID().slice(0, 6).toUpperCase();
    const { data: booking, error: bErr } = await supabase.from("bookings").insert({
      client_id: user.id,
      cleaner_id,
      service_type: service_type ?? "Schoonmaak",
      scheduled_at: scheduled_at ?? null,
      hours: h,
      cleaner_amount_cents: cleanerAmount,
      service_fee_cents: serviceFee,
      platform_fee_cents: platformFee,
      total_cents: total,
      currency: "eur",
      status: "pending",
      escrow_status: "held",
      reference,
    }).select("id").single();
    if (bErr) return json({ error: "booking_insert_failed", detail: bErr.message }, 500);

    // --- Stripe Checkout Session (destination charge + application fee) ---
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      success_url: `${SITE_URL}/client-dashboard.html?booking=${booking.id}&status=success`,
      cancel_url: `${SITE_URL}/?booking=${booking.id}&status=cancelled`,
      customer_email: user.email ?? undefined,
      line_items: [{
        quantity: 1,
        price_data: {
          currency: "eur",
          unit_amount: total,
          product_data: {
            name: `${service_type ?? "Schoonmaak"} · ${cleaner.full_name ?? "cleaner"}`,
            description: `${h} uur · incl. servicekosten`,
          },
        },
      }],
      payment_intent_data: {
        application_fee_amount: platformFee,
        on_behalf_of: cleaner.stripe_account_id,
        transfer_data: { destination: cleaner.stripe_account_id },
        metadata: { booking_id: booking.id, reference, cleaner_id },
      },
      metadata: { booking_id: booking.id, reference },
    }, { idempotencyKey: idemKey });

    await supabase.from("bookings")
      .update({ stripe_checkout_session_id: session.id }).eq("id", booking.id);

    const response = { url: session.url, booking_id: booking.id, reference,
      breakdown: { cleaner_amount: cleanerAmount, service_fee: serviceFee, total } };
    await supabase.from("idempotency_keys")
      .insert({ key: idemKey, scope: "create-checkout", response });

    return json(response);
  } catch (e) {
    return json({ error: "server_error", detail: String(e?.message ?? e) }, 500);
  }
});
