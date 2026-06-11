# NEXT_ACTION.md

> Si la sesión se corta, continúa EXACTAMENTE aquí. Actualizado: **2026-06-11**.

## Estado al cierre de la última sesión
- ✅ Hero Experience **cerrada y en producción** (search integrada en el hero, sheet continuity, sticky fix `overflow-x: clip`, a11y del SearchBar, CLS=0). Commits `92f573a` + `7a3cf30`, deploy verificado en getcleaners.nl.
- ✅ Roadmap repriorizado → ver `ROADMAP_STATUS.md`.
- ✅ Sprint "Real Data v1" definido → ver `CURRENT_SPRINT.md`.

## ✅ Sprint tarea #1 — HECHA (2026-06-11)
Search del hero cableada a `/schoonmakers?hood=&date=&time=` (commit `8049d6b`).
Verificado en prod: `getcleaners.nl/schoonmakers?hood=De+Pijp` → filtro aplicado SSR.

## 🔍 Auditoría de infraestructura 2026-06-11 (Sprint #2) — RESULTADO
La plataforma está MÁS construida de lo que decía CLAUDE.md. Verificado contra el Supabase live:
- ✅ Tablas vivas: `waitlist`, `bookings`, `webhook_events`, `contact_messages`
- ❌ Tablas FALTANTES: `profiles`, `cleaner_profiles`, `favorites` (el schema.sql del repo las define; el remoto tiene una versión vieja)
- ✅ `SUPABASE_SERVICE_ROLE_KEY` local VÁLIDA (formato nuevo `sb_secret_`; usar header `apikey` solo, sin `Bearer`)
- ✅ Webhook Stripe completo en código (`app/api/webhook/stripe/route.ts`)
- ✅ Booking action con auth opcional (`client_user_id`)
- ✅ Dashboard lee profile + última booking con fallback beta
- ✅ Wizard onboarding cleaner + action listos (esperan la tabla)

## ▶️ SIGUIENTE ACCIÓN — 1 paso manual de Antonio (2 minutos)
**Aplicar el schema completo:** Supabase Dashboard → SQL Editor → New query → pegar TODO `supabase/schema.sql` → Run. Es **idempotente** (re-ejecutable sin riesgo; solo añade lo que falta).
- Opcional: ejecutar también `supabase/seed-cleaners.sql` si se quiere catálogo real en vez de mock (el mock es deliberado en beta — decisión de Antonio).
- Confirmar `STRIPE_WEBHOOK_SECRET` configurado en Vercel (production) para que el webhook persista pagos.

**Verificación (1 comando):** `node scripts/verify-supabase.mjs` → debe salir TODO VERDE.

## Después (en orden, ya desbloqueado)
- Sprint #5: vista completa "mijn boekingen" en dashboard cliente + cancelación >24h.
- Sprint #6: envío Resend desde el webhook (templates ya existen en `lib/email/templates.ts`).
- Sprint #7: validar e2e el wizard cleaner (signup → cleaner_profiles → aparece en catálogo).
- Sprint #8: aanvragen del cleaner (aceptar/rechazar).

## Recordatorios duros
- Idioma con Antonio: **español**. UI: **holandés**. Wordmark `cleaners` siempre `translate="no"`.
- NO activar KvK (cuesta dinero). Stripe SIEMPRE test mode hasta decisión.
- NO volver a auditar lo marcado ✅ en ROADMAP_STATUS.md.
- Deploy: `vercel --prod` desde `apps/web/` (no desde root).
- `overflow-x` en html/body: SIEMPRE `clip`, jamás `hidden`.
