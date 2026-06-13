# CURRENT_SPRINT.md — Sprint "Real Data v1"

> Generado 2026-06-11 tras cerrar Hero Experience. **10 tareas, orden = prioridad real (ROI).**
> Regla: una tarea no se empieza hasta que la anterior con la que choca esté mergeada.

## Las 10 tareas (ordenadas)

| # | Tarea | Team | Depende de | Entregable |
|---|---|---|---|---|
| 1 | ✅ **HECHA** (2026-06-11, commit `8049d6b`, en prod) — Cablear search del hero → `Zoeken` navega a `/schoonmakers?hood=&date=&time=`; el listado valida hood server-side, inicializa filtros y muestra chip fecha/hora | A | — | Hero cumple su promesa de búsqueda |
| 2 | ✅ **HECHA** (2026-06-11) — Antonio aplicó schema.sql; `node scripts/verify-supabase.mjs` = TODO VERDE (7/7 tablas + service key válida) | C | — | Infra verificada |
| 3 | ✅ **HECHA 100%** (2026-06-12) — Webhook completo + endpoint Stripe creado vía API (`we_1ThXOP…` → getcleaners.nl) + `STRIPE_WEBHOOK_SECRET` en Vercel prod. Smoke verificado: 400 missing_signature (antes 503 not_configured) | D | — | Loop de pago vivo en prod |
| 4 | ✅ **YA EXISTÍA** — `_actions/booking.ts` linkea `client_user_id` si hay sesión; checkout anónimo permitido by design (match posterior por email vía RLS) | B | — | Hecho |
| 5 | ✅ **HECHA** (2026-06-11, commit `3ddc451`, en prod) — Vista "Mijn boekingen" (lista RLS completa, badges de estado, empty state) + action `cancelBooking` (regla >24h, guard de carrera, rate-limit). E2E verificada con usuario QA real: render, regla 24h, cancelación → `canceled` en DB. Script QA reutilizable: `scripts/qa-dashboard-seed.mjs` | A+D | — | En producción |
| 6 | ✅ **HECHA** (2026-06-12, commit `fc8c2d8`) — Resend booking-confirmed: `lib/email/client.ts` (best-effort), `lib/email/booking.ts` (orchestrator), template + webhook integration. Email async non-blocking, nunca rompe webhook. E2E testing: `stripe listen` en dev, Resend dashboard en prod. Docs: `RESEND_EMAIL_SETUP.md` | D | — | Email en prod (post-smoke-test) |
| 7 | ✅ **HECHA** (2026-06-12, commit `cf85ee1`, en prod) — Wizard e2e verificado con usuario QA real. Fixes: crash "use server" con constantes (el wizard NUNCA había rendereado), alta con `visible=false` (catálogo sigue mock hasta decisión de Antonio), redirects a dashboard, checks con admin client. ⚠️ Pendiente Antonio: re-ejecutar `schema.sql` (añade policy `cleaner_profiles_own_select`) | B | — | Alta cleaner verificada e2e |
| 8 | ✅ **HECHA** (2026-06-12, en prod) — `AanvragenView` (lista real por slug) + action `respondToBooking` (paid → accepted/rejected, ownership en 2 pasos, guard de carrera). E2E real: aceptar y rechazar verificados en UI + DB. Script: `scripts/qa-aanvragen-seed.mjs`. Pendiente hardening: policy SELECT de bookings para cleaners (sprint 9) | A+D | — | Loop booking completo en test |
| 9 | ✅ **HECHA** (2026-06-12, en prod) — Security review del diff del sprint: rate-limit añadido a `createBookingCheckout` (5/5min, único action sin límite), escape HTML en template de email (client_name = input del cliente), bug email corregido (mandaba el nombre del CLIENTE como cleaner), policy `bookings_cleaner_select` añadida a schema.sql (pendiente re-run manual, no bloquea: el server usa admin client verificado). Extra UX: **sticky search** en landing (hero → carrusel) | E | — | Fixes aplicados y en prod |
| 10 | ✅ **HECHA** (2026-06-13, en prod) — `sitemap.xml` con URLs de barrio + perfiles, `robots.txt` expandido (auth-gated paths), `generateMetadata` per-hood (title/desc/canonical/alternates NL+EN), OG images existentes revisadas (raíz + per-cleaner OK) | F | 1 | Indexable + compartible |

**Transversal (Team G):** e2e Playwright del flujo búsqueda → perfil → checkout test → webhook → dashboard, corre al cerrar #8.

## Equipos

- **TEAM A · Frontend & UX** — tareas 1, 5, 8 (UI). Riesgo: estados vacíos/loading; usar skeletons del design system.
- **TEAM B · Auth & Roles** — 4, 7. Riesgo: middleware de sesión en server actions; reusar `lib/supabase/server`.
- **TEAM C · Supabase Architecture** — 2. Riesgo: RLS mal escrita bloquea todo; probar con anon+service en local.
- **TEAM D · Bookings & Marketplace** — 3, 5, 6, 8. Riesgo: idempotencia webhook (retries de Stripe) — clave única `stripe_session_id`.
- **TEAM E · Security & Compliance** — 9. Riesgo: rate limit sin estado en Vercel → usar Upstash o ventana por IP en KV.
- **TEAM F · Growth & SEO** — 10. Riesgo: contenido duplicado entre barrios → plantillas con copy único.
- **TEAM G · QA & Testing** — transversal. Entregable: suite e2e verde en CI.

## Definición de done del sprint
- [x] Las 10 mergeadas en `v2-nextjs`, typecheck+lint+build verdes
- [ ] e2e del loop completo verde (Team G — pendiente)
- [x] Deploy a prod + smoke test en getcleaners.nl
- [x] ROADMAP_STATUS.md y NEXT_ACTION.md actualizados
