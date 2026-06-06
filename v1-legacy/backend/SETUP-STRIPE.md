# SETUP · Stripe Connect + Supabase Edge Functions

Pasos que **solo vos** podés hacer (requieren tus cuentas). ~30-45 min. Todo en TEST primero.

## 0. Prerrequisitos
- Node ≥ 18 y la CLI de Supabase: `npm i -g supabase`
- Login: `supabase login` y `supabase link --project-ref TU_REF`

## 1. Cuenta Stripe + Connect
1. Crear cuenta en https://dashboard.stripe.com (modo **Test** activado).
2. Activar **Connect** → Settings → Connect → habilitar **Express accounts**.
3. Copiar `STRIPE_SECRET_KEY` (`sk_test_…`) de Developers → API keys.

## 2. Base de datos
Ejecutar `backend/supabase/migrations/0001_payments.sql` en Supabase → SQL Editor
(o `supabase db push`). Crea columnas de pago en `bookings`, tablas `payments`,
`idempotency_keys`, `webhook_events`, y las políticas RLS.

## 3. Secrets de las Edge Functions
1. Copiar `backend/.env.example` → `backend/.env` y rellenar:
   - `STRIPE_SECRET_KEY` (sk_test_…)
   - `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` (Project Settings → API)
   - `SITE_URL` (https://getcleaners.nl o tu URL de Vercel)
   - `STRIPE_WEBHOOK_SECRET` → lo obtenés en el paso 5.
2. `supabase secrets set --env-file ./backend/.env`

## 4. Desplegar funciones
```bash
supabase functions deploy create-checkout
supabase functions deploy refund
supabase functions deploy stripe-webhook --no-verify-jwt   # Stripe NO manda JWT de Supabase
```

## 5. Webhook de Stripe
1. Stripe Dashboard → Developers → Webhooks → **Add endpoint**.
2. URL: `https://TU_REF.supabase.co/functions/v1/stripe-webhook`
3. Eventos: `checkout.session.completed`, `charge.refunded`, `account.updated`.
4. Copiar el **Signing secret** (`whsec_…`) → ponerlo en `.env` y re-correr
   `supabase secrets set --env-file ./backend/.env`.

## 6. Onboarding del cleaner (Connect Express)
Cada cleaner necesita su cuenta conectada para cobrar. (Pendiente función `connect-onboard`
en Fase 2; mientras, podés crear cuentas Express manualmente en el Dashboard y guardar
`stripe_account_id` en la tabla `cleaners`. El webhook `account.updated` ya sincroniza
`stripe_charges_enabled`.)

## 7. Frontend
Seguir `backend/frontend-integration/README.md` (incluir `pago.js` + patch de `doPayment`).

## 8. Probar (test)
- Tarjeta de prueba: `4242 4242 4242 4242`, cualquier fecha futura, CVC 123.
- `stripe listen --forward-to https://TU_REF.supabase.co/functions/v1/stripe-webhook`
  para ver eventos, o mandá un pago de prueba desde el sitio.
- Verificá: booking pasa a `paid`, fila en `payments`, evento en `webhook_events`.

## ✅ Checklist a producción (flip a LIVE)
- [ ] Reemplazar `sk_test_` por `sk_live_` y `whsec_` del endpoint LIVE (otro webhook).
- [ ] `supabase secrets set` con las claves LIVE.
- [ ] `.env` real NUNCA en git (verificá `.gitignore`).
- [ ] KvK + BTW + cuenta bancaria de la plataforma en Stripe (settlement).
- [ ] Cada cleaner con Connect Express completado (`charges_enabled = true`).
- [ ] Política de reembolsos + términos publicados.
- [ ] Probar 1 pago LIVE real de bajo monto y un refund.
- [ ] Seguro de responsabilidad civil contratado (promesa "verzekerd").
