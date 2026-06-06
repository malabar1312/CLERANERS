// ============================================================
// Edge Function: refund
// Reembolso (solo admin). Revierte el cargo, la transferencia al cleaner y la comisión.
// Seguridad: requiere JWT + estar en admin_users.
// Deploy: supabase functions deploy refund
// ============================================================
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
  apiVersion: "2024-06-20", httpClient: Stripe.createFetchHttpClient(),
});
const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
const SITE_URL = Deno.env.get("SITE_URL") ?? "https://getcleaners.nl";
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
    const auth = req.headers.get("Authorization") ?? "";
    const { data: { user } } = await supabase.auth.getUser(auth.replace("Bearer ", ""));
    if (!user) return json({ error: "unauthorized" }, 401);
    const { data: admin } = await supabase.from("admin_users")
      .select("user_id").eq("user_id", user.id).maybeSingle();
    if (!admin) return json({ error: "forbidden" }, 403);

    const { booking_id } = await req.json();
    const { data: b } = await supabase.from("bookings")
      .select("id, stripe_payment_intent_id, status").eq("id", booking_id).maybeSingle();
    if (!b?.stripe_payment_intent_id) return json({ error: "no_payment_intent" }, 404);
    if (b.status === "refunded") return json({ ok: true, already: true });

    const refund = await stripe.refunds.create({
      payment_intent: b.stripe_payment_intent_id,
      reverse_transfer: true,         // recupera el dinero del cleaner
      refund_application_fee: true,   // devuelve la comisión de la plataforma
    });
    await supabase.from("bookings").update({ status: "refunded", escrow_status: "refunded" }).eq("id", booking_id);
    await supabase.from("payments").update({ status: "refunded" }).eq("booking_id", booking_id);
    return json({ ok: true, refund_id: refund.id });
  } catch (e) {
    return json({ error: "server_error", detail: String(e?.message ?? e) }, 500);
  }
});
