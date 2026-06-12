# Email Integration (Resend) — Sprint #6

## Setup

1. **API Key:** agregada a `apps/web/.env.local` (gitignored, no impresa).
   - Verificar en `lib/env.ts` que `RESEND_API_KEY` esté parseable (schema `z.string().startsWith("re_")`).

2. **Templates:** `lib/email/templates.ts` — 4 existentes (Supabase auth) + 1 nuevo:
   - `bookingConfirmedEmail()` — para cliente post-pago (fecha, cleaner, precio, CTA al dashboard).

3. **Client Resend:** `lib/email/client.ts`
   - `sendEmail(opts)` — best-effort (try/catch, nunca rompe).
   - Falla silenciosa en dev (console.warn), en prod no loguea.

4. **Webhook integration:** `app/api/webhook/stripe/route.ts`
   - `persistPaidBooking()` después de upsert → `sendBookingConfirmedEmail()` (tanto path `booking_id` como legacy).
   - Email se envía en paralelo al upsert (no bloquea respuesta del webhook).

## Local Testing (stripe CLI)

### Requisitos
```bash
brew install stripe/stripe-cli/stripe
# o desde https://stripe.com/docs/stripe-cli
```

### Pasos

1. **Start dev server:**
   ```bash
   cd apps/web
   pnpm dev
   ```
   Vercel dev server en `http://localhost:3000`. Webhook escucha `/api/webhook/stripe`.

2. **Forward Stripe events a localhost:**
   ```bash
   stripe listen --forward-to http://localhost:3000/api/webhook/stripe
   ```
   CLI imprime:
   ```
   > Ready! Your webhook signing secret is whsec_test_...
   ```
   Copiar ese `whsec_test_` → actualizar **temporalmente** `STRIPE_WEBHOOK_SECRET` en `.env.local` (para local testing; en prod ya está en Vercel).

3. **Test checkout:**
   - Navega a `/schoonmakers` → selecciona cleaner → `/book` → checkout modal.
   - Supabase debe estar vivo (schema aplicado). Si no → crear con QA seed.
   - Stripe test card: `4242 4242 4242 4242` · exp `12/26` · CVC `123` · ZIP `12345`.
   - El checkout redirect a `/success` → Supabase RLS lee la session → booking aparece en dashboard.

4. **Trigger webhook event:**
   ```bash
   stripe trigger checkout.session.completed
   # O si tienes el session ID real:
   stripe trigger checkout.session.completed --override=checkout_session_id=cs_test_...
   ```

5. **Observe email:**
   - Console del dev server: `[email] sent { id, to, subject }` si Resend está vivo.
   - Resend dashboard (`resend.com`) → Email → historial de `noreply@cleaners.nl`.
   - Inbox real: **revisar la bandeja de correo del email test** (si es un email real, ó ver el sandbox en Resend).

### Troubleshooting

| Síntoma | Causa | Fix |
|---|---|---|
| "webhook_not_configured" 503 | `STRIPE_WEBHOOK_SECRET` no está o es inválida | `stripe listen` → copiar el `whsec_test_` a `.env.local` |
| "invalid_signature" 400 | Secret mismatch o raw body corrupto | Verificar que `stripe listen` está activo en otra terminal |
| Email no aparece en Resend | `RESEND_API_KEY` inválida o no tiene permisos | Verificar que `re_KhF3p2...` es real (no expired). Si `--` aparece en logs, key es falsa. |
| Booking no aparece en BD | RLS bloquea el INSERT, o Supabase no configurada | `node scripts/verify-supabase.mjs` → debe ser TODO VERDE |
| Email se envía pero vacío | `client_name` o `cleanerName` es null → fallback a `client_name ?? "Cleaner {id}"` | Verificar metadata del checkout tiene `client_name` |

## Production (Vercel)

1. **Vercel Env:** Settings → Environment Variables
   - Agregar `RESEND_API_KEY=re_KhF3p2...`
   - Agregar `STRIPE_WEBHOOK_SECRET=whsec_live_...` (obtener de Stripe Dashboard → Webhooks)

2. **Domain:** Resend requiere que `noreply@cleaners.nl` esté **verificado** en Resend Dashboard.
   - Si no → usar `noreply@resend.dev` (temporalmente) o agregar un CNAME en DNS.

3. **Webhook URL:** Stripe Dashboard → Webhooks → Add Endpoint
   - URL: `https://getcleaners.nl/api/webhook/stripe`
   - Events: `checkout.session.completed`, `payment_intent.succeeded`, `charge.refunded`, `account.updated`

4. **Smoke test:** Crear checkout en prod (test card) → Stripe envía evento → webhook responde 200 → email en bandeja.

## Degradation

- **Sin `RESEND_API_KEY`:** email saltea silenciosamente (no logguea en prod). Booking se persiste igual.
- **Fallo de email (timeout, rate limit, etc.):** booking OK, email best-effort. Admin ve fallo en logs (dev) pero NO en prod → invertir en observabilidad futura.
- **NUNCA** romper el webhook por email: `try/catch` envuelve todo + `await sendBookingConfirmedEmail()` es async non-blocking.

## i18n

Hoy solo NL (`bookingConfirmedEmail` es NL hardcoded). Para multi-lang (Sprint 8):
- Pasar `locale` a `sendBookingConfirmedEmail()`.
- Condicionar `slotLabel` en el template → `templates_nl.ts` + `templates_en.ts`.
- Actualizar `bookingConfirmedEmail()` para aceptar `locale`.

---

**Resumen:** Email de confirmación vía Resend, best-effort, zero-impact en webhook. Listo para Prod post-smoke-test.
