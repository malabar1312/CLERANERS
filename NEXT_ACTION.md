# NEXT_ACTION.md

> Si la sesión se corta, continúa EXACTAMENTE aquí. Actualizado: **2026-06-11**.

## Estado al cierre de la última sesión
- ✅ Hero Experience **cerrada y en producción** (search integrada en el hero, sheet continuity, sticky fix `overflow-x: clip`, a11y del SearchBar, CLS=0). Commits `92f573a` + `7a3cf30`, deploy verificado en getcleaners.nl.
- ✅ Roadmap repriorizado → ver `ROADMAP_STATUS.md`.
- ✅ Sprint "Real Data v1" definido → ver `CURRENT_SPRINT.md`.

## ✅ Sprint tarea #1 — HECHA (2026-06-11)
Search del hero cableada a `/schoonmakers?hood=&date=&time=` (commit `8049d6b`).
Verificado en prod: `getcleaners.nl/schoonmakers?hood=De+Pijp` → filtro aplicado SSR.

## ▶️ SIGUIENTE ACCIÓN (Sprint tarea #2)
**Supabase schema v1 + RLS + types.**

1. Confirmar estado del proyecto Supabase: `supabase/` existe en el repo y `apps/web/.env.local` existe (verificado 2026-06-11). Revisar si `supabase link` está hecho y si hay migraciones previas en `supabase/migrations/`.
2. Migración SQL: `profiles` (extiende auth.users, role customer|cleaner), `cleaner_profiles` (hood, price, specialties, bio, languages, since), `bookings` (user_id, cleaner_id, date, time_slot, m2, hours, amount_cents, fee_cents, status, stripe_session_id UNIQUE), `reviews`.
3. RLS: owner-read/write en bookings; cleaner lee sus asignadas; perfiles cleaner públicos read-only.
4. `supabase gen types` → `packages/db`.
5. NO tocar el switch mock→real todavía (eso es 1 PR por superficie, después del webhook).

## Después (en orden)
- Sprint #3: webhook Stripe `checkout.session.completed` → upsert `bookings` (idempotente por `stripe_session_id`).
- Sprint #4: auth en booking action.

## Recordatorios duros
- Idioma con Antonio: **español**. UI: **holandés**. Wordmark `cleaners` siempre `translate="no"`.
- NO activar KvK (cuesta dinero). Stripe SIEMPRE test mode hasta decisión.
- NO volver a auditar lo marcado ✅ en ROADMAP_STATUS.md.
- Deploy: `vercel --prod` desde `apps/web/` (no desde root).
- `overflow-x` en html/body: SIEMPRE `clip`, jamás `hidden`.
