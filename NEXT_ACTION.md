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

## ✅ 2026-06-12 — Sprints #6 + #7 SHIPPED + webhook prod CERRADO
- **#6 Resend:** key probada en vivo (email enviado, id `b9e637b0`). Sender = sandbox `onboarding@resend.dev` (solo entrega a mrsalgado94@gmail.com hasta verificar dominio). `EMAIL_FROM` configurable por env. `RESEND_API_KEY` en Vercel prod.
- **#7 Onboarding cleaner e2e:** wizard verificado con usuario QA real. Se arregló un crash pre-existente ("use server" exportaba constantes — el wizard NUNCA había funcionado), alta ahora con `visible=false`, redirects correctos, catálogo sigue mock, sin fuga del borrador. Script: `scripts/qa-cleaner-seed.mjs`.
- **Webhook Stripe prod:** endpoint creado vía API (`we_1ThXOPDuW0ZKWM5b14W9M30e` → getcleaners.nl) + `STRIPE_WEBHOOK_SECRET` en Vercel. Smoke: 400 missing_signature ✓ (antes 503). **El loop checkout→webhook→booking→email está VIVO en prod (test mode).**

## ▶️ ACCIONES MANUALES DE ANTONIO (5 min total)
1. **Re-ejecutar `supabase/schema.sql`** en SQL Editor (idempotente) — añade la policy `cleaner_profiles_own_select` (el cleaner ve su propio borrador). Verificar: `node scripts/verify-supabase.mjs`.
2. **Opcional (emails a clientes reales):** verificar `getcleaners.nl` en resend.com → Domains (añadir los DNS records que indica) y luego en Vercel setear `EMAIL_FROM=cleaners <noreply@getcleaners.nl>`. Hasta entonces los emails solo llegan a tu propio gmail (sandbox).

## ✅ 2026-06-12 (tarde) — Schema re-aplicado por Antonio + Sprint #8 SHIPPED
- Policy `cleaner_profiles_own_select` viva (verify-supabase TODO VERDE).
- Sprint #8 en prod: `AanvragenView` + `respondToBooking` (paid → accepted/rejected). E2E real con QA cleaner: aceptar ✓, rechazar (2 pasos) ✓, estados confirmados en DB, datos limpiados.
- El marketplace tiene el loop completo: cliente boekt → paga → cleaner acepta/rechaza → cliente lo ve en su dashboard.

## ▶️ SIGUIENTE SPRINT (#9 — Hardening + security review)
1. SQL batch único para Antonio (UNA sola ejecución): policy SELECT de bookings para cleaners (`cleaner_id` = slug propio vía join a cleaner_profiles) — hoy se suple con admin client server-side.
2. `security-review` del diff acumulado del sprint (actions nuevas: cancelBooking, respondToBooking, createCleanerProfileAction; email; webhook).
3. Rate-limit audit en todas las actions públicas.
4. Después: #10 SEO (sitemap, metadata por barrio, OG image).

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
