# CURRENT_SPRINT.md — Sprint "Real Data v1"

> Generado 2026-06-11 tras cerrar Hero Experience. **10 tareas, orden = prioridad real (ROI).**
> Regla: una tarea no se empieza hasta que la anterior con la que choca esté mergeada.

## Las 10 tareas (ordenadas)

| # | Tarea | Team | Depende de | Entregable |
|---|---|---|---|---|
| 1 | **Cablear search del hero** → `Zoeken` navega a `/schoonmakers?hood=&date=&time=`; el listado lee los params e inicializa filtros | A | — | Hero cumple su promesa de búsqueda |
| 2 | **Supabase schema v1**: `profiles`, `cleaner_profiles`, `bookings`, `reviews` + RLS + `supabase gen types` → `packages/db` | C | — | Migración SQL + types tipados |
| 3 | **Webhook Stripe** `checkout.session.completed` → upsert `bookings` (firma verificada, idempotente por session id) | D | 2 | Pago = fila en DB, siempre |
| 4 | **Auth en booking**: server action exige sesión (o captura guest email); `user_id` en booking | B | 2 | Reserva atribuida a usuario |
| 5 | **Dashboard cliente real**: `/dashboard` lista bookings propias (estado, fecha, cleaner, cancelar si >24h) | A+D | 3,4 | Página servida desde DB |
| 6 | **Resend transaccional**: email booking-confirmed (cliente) + nueva-aanvraag (cleaner) | D | 3 | 2 templates + envío en webhook |
| 7 | **Cleaner signup wizard real**: pasos existentes → `cleaner_profiles` draft (sin Connect, sin KvK) | B | 2 | Alta de cleaner persistida |
| 8 | **Dashboard cleaner: aanvragen reales**: lista bookings asignadas + aceptar/rechazar → estado | A+D | 3,7 | Loop booking completo en test |
| 9 | **Hardening**: rate limit (waitlist + checkout actions), zod en todo input público, `security-review` del diff del sprint | E | 1-8 | Reporte + fixes aplicados |
| 10 | **SEO base**: `sitemap.xml`, metadata por barrio (`/schoonmakers?hood=X` → title/desc), OG image | F | 1 | Indexable + compartible |

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
- [ ] Las 10 mergeadas en `v2-nextjs`, typecheck+lint+build verdes
- [ ] e2e del loop completo verde
- [ ] Deploy a prod + smoke test en getcleaners.nl
- [ ] ROADMAP_STATUS.md y NEXT_ACTION.md actualizados
