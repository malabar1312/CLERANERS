/* ============================================================
 * cleaners · pago.js — puente frontend ↔ Edge Function create-checkout
 * Drop-in: <script src="/pago.js"></script> DESPUÉS de config.js.
 * Requiere window.supabaseClient (ya lo crea config.js) y SUPABASE_URL.
 * ============================================================ */
(function () {
  const FN_BASE = (window.SUPABASE_URL || '').replace(/\/$/, '') + '/functions/v1';

  async function checkout({ cleaner_id, service_type, hours, scheduled_at, address, access_notes }) {
    const sb = window.supabaseClient;
    if (!sb) throw new Error('Supabase niet geconfigureerd');
    const { data: { session } } = await sb.auth.getSession();
    if (!session) { window.openLogin && window.openLogin(); throw new Error('Log eerst in'); }

    const res = await fetch(FN_BASE + '/create-checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + session.access_token,
        'Idempotency-Key': (crypto.randomUUID ? crypto.randomUUID() : String(Date.now())),
      },
      body: JSON.stringify({ cleaner_id, service_type, hours, scheduled_at, address, access_notes }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || json.error || 'checkout_failed');
    // Stripe Checkout (hosted) → redirige al pago real
    window.location.href = json.url;
  }

  // Carga las aanvragen/boekingen REALES del cleaner logueado (para el dashboard)
  async function loadCleanerBookings() {
    const sb = window.supabaseClient;
    const { data: { session } } = await sb.auth.getSession();
    if (!session) return [];
    const { data } = await sb.from('bookings')
      .select('*').eq('cleaner_id', session.user.id).order('created_at', { ascending: false });
    return data || [];
  }

  window.cleanersPago = { checkout, loadCleanerBookings };
})();
