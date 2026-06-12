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

## ✅ 2026-06-11 (tarde) — Schema aplicado por Antonio + Sprint #5 SHIPPED
- `node scripts/verify-supabase.mjs` → TODO VERDE (7/7 tablas, service key OK).
- Sprint #5 en producción (commit `3ddc451`): vista "Mijn boekingen" + `cancelBooking` (>24h). E2E real verificada (usuario QA + 3 bookings, cancelación confirmada en DB, datos de prueba limpiados).
- Smoke prod: `/dashboard?view=bookings` → 307 a login sin sesión (gate correcto).

## ✅ 2026-06-12 — Sprint #6 SHIPPED (Resend booking-confirmed)
- Email client (best-effort try/catch), template (NL hardcoded hoy), webhook integration.
- Testing local: `stripe listen --forward-to localhost:3000/api/webhook/stripe` + test card.
- Docs: `docs/RESEND_EMAIL_SETUP.md` (setup, local testing, prod steps, troubleshooting).
- Commit `fc8c2d8`.

## ▶️ SIGUIENTE ACCIÓN (Sprint #7 — Cleaner onboarding e2e)
**Necesita de Antonio:** validar e2e la ruta de alta de cleaners:
1. Signup → `/onboarding/schoonmaker` wizard (ya wired en `/signup` → redirect).
2. 7 pasos (nombre, foto, bio, especialidades, tarifa, KYC, terms) → `cleaner_profiles` con `visible=false` (importante: no cambia el catálogo público aún).
3. Verificar que el cleaner aparece en DB pero NO en el listado `/schoonmakers` (porque `visible=false` activará el auto-switch mock→real solo si cambia a `visible=true` — decisión manual de Antonio).
4. Confirmar KYC (hoy es mock — sube archivo a Supabase Storage, sin validación real).
5. El perfil del cleaner debe ser editable desde su dashboard una vez logueado.

## Después (en orden)
- Sprint #7: e2e wizard cleaner — ⚠️ insertar SIEMPRE con `visible=false` en pruebas: 1 fila visible en `cleaner_profiles` cambia el catálogo público de getcleaners.nl de mock a real (auto-switch). Activar visible solo con decisión de Antonio.
- Sprint #8: aanvragen del cleaner (aceptar/rechazar → estado booking).
- Sprint #9: hardening + security-review del diff acumulado del sprint.
- Sprint #10: SEO (sitemap, metadata por barrio, OG).
- Confirmar `STRIPE_WEBHOOK_SECRET` en Vercel production (sigue sin verificar).

## Recordatorios duros
- Idioma con Antonio: **español**. UI: **holandés**. Wordmark `cleaners` siempre `translate="no"`.
- NO activar KvK (cuesta dinero). Stripe SIEMPRE test mode hasta decisión.
- NO volver a auditar lo marcado ✅ en ROADMAP_STATUS.md.
- Deploy: `vercel --prod` desde `apps/web/` (no desde root).
- `overflow-x` en html/body: SIEMPRE `clip`, jamás `hidden`.
