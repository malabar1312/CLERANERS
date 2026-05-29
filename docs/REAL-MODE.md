# Activar el booking real (Stripe + Supabase)

Esta rama (`feat/real-booking`) cabea el flujo de pago a la Edge Function `create-checkout`
sin tocar el comportamiento actual: **si el backend no está desplegado o el cleaner no
tiene UUID de Supabase, sigue el flujo demo** (localStorage). Vercel deploya **preview**
de la rama; `main` sigue intacto.

## Para activarlo en producción
1. **Backend desplegado** según [`backend/SETUP-STRIPE.md`](../backend/SETUP-STRIPE.md):
   - SQL `0001_payments.sql` corrido en Supabase
   - Edge Functions `create-checkout`, `stripe-webhook`, `refund` desplegadas
   - Stripe webhook configurado + `STRIPE_WEBHOOK_SECRET` en secrets
2. **`config.js`** del sitio expone:
   - `window.SUPABASE_URL` (ya existe)
   - `window.IS_REAL_MODE = true` ← **flag para activar el modo real**
3. **Cleaners reales en Supabase** con `stripe_account_id` (Connect Express) y
   `stripe_charges_enabled = true`. El front debe traer cada cleaner con su `supabase_id`
   (UUID) — los del DB demo (id 1..8) NO se cobran, caen al fallback demo.
4. **Mergear** esta rama a `main` → Vercel redeploya → listo.

## Qué hace la rama
- Copia `pago.js` a la raíz y lo incluye después de `config.js` (línea ~1031 del index).
- `doPayment()` ahora es `async`: si hay backend + cleaner real → llama a
  `cleanersPago.checkout()` → crea booking pending + redirige a Stripe Checkout
  (cobro real, application_fee 15%, escrow). Si algo falla → toast + sigue demo.
- Nada del flujo demo cambia para los cleaners del array `DB`.

## Test rápido (cuando backend esté arriba)
- Tarjeta: `4242 4242 4242 4242` · cualquier fecha futura · CVC 123.
- Verificá: `bookings.status='paid'`, fila en `payments`, evento en `webhook_events`.
