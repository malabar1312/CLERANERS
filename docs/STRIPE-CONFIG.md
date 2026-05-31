# Stripe — Configuración (cleaners)

> Estado al cierre de esta sesión. Cuenta **TEST**. Las keys viven en
> `apps/web/.env.local` (gitignored, NUNCA en el repo). Rotables cuando quieras.

## Cuenta
| | |
|---|---|
| Account ID | `acct_1Td8M7DuW0ZKWM5b` |
| País / Moneda | **NL / EUR** ✅ (correcto para el mercado) |
| Email | mrsalgado94@gmail.com |
| Estado | **Virgin** — `details_submitted=false`, `charges_enabled=false`, `payouts_enabled=false` (normal; falta activación en Dashboard) |

## ✅ Configurado por API (hecho automático)
- **Métodos de pago** (`pmc_1Td8MdDuW0ZKWM5bQGPh2oOe`, default): activado **iDEAL** (clave en NL) + `card`, `bancontact`, `apple_pay`, `link`, `klarna`, `sepa_debit`, `eps`. Apagado el ruido no-europeo (amazon_pay, blik, kakao_pay, mb_way, naver_pay, payco, pix, samsung_pay, satispay).
- **Connect**: validado el flujo de alta de cleaner (Express + `transfers` + AccountLink de onboarding). Funciona para nuestro modelo de destination charges.
- **Keys** guardadas en `.env.local`: `sk_test_`, `pk_test_`, `rk_test_`. Tipadas en `lib/env.ts` + `env.d.ts`; documentadas en `.env.example`.

## ⚙️ Modelo (nivel código — ya escrito en `backend/supabase/functions/`)
- Destination charges, `application_fee_amount` = **15%**.
- Fee al cliente **18%** (15% plataforma + ~3% Stripe), transparente en checkout.
- Captura **manual** (escrow), liberada al confirmar servicio.
- Refund admin-only (revierte cargo + transfer + comisión).

## 📋 Checklist de Dashboard (esto SÍ o SÍ lo hacés vos — Stripe no lo permite por API)
1. **Activar la cuenta** — Settings → Business details: KvK, BTW, dirección, IBAN. *(Necesario para payouts en live.)*
2. **Connect platform profile** — Settings → Connect: completar perfil + aceptar términos. *(Para live; en test ya funciona.)*
3. **Branding** — Settings → Branding: logo "cleaners", color de marca **`#0066FF`**, icono.
4. **Public details / statement descriptor** — Settings → Public details: descriptor ≤22 chars, ej. `CLEANERS AMSTERDAM`. *(Requiere activación.)*
5. **Payout schedule** — Settings → Payouts: **semanal, lunes**, automático. *(O se setea por cuenta conectada al onboarding via API.)*
6. **Customer emails** — Settings → Customer emails: activar recibos de pago (opcional).
7. **BTW / Tax** — cuando la cuenta esté activada.

## 🔜 Webhook (cuando deployemos el endpoint — Fase 3)
- Developers → Webhooks → Add endpoint:
  - URL: `https://getcleaners.nl/api/webhook/stripe` (o la Edge Function de Supabase).
  - Eventos: `checkout.session.completed`, `payment_intent.succeeded`, `charge.refunded`, `account.updated`, `payout.paid`.
  - Copiar el `whsec_…` → `STRIPE_WEBHOOK_SECRET` en `.env.local` + secrets.
- Dev local: `stripe listen --forward-to localhost:3000/api/webhook/stripe`.

## 🔜 Siguiente (Fase 3 · Booking)
Cablear `create-checkout` + webhook en la app Next, y smoke test de una reserva en test mode (cae en `bookings.status='paid'`). Pago real (live) solo tras ese smoke test.
