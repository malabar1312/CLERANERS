# NEXT_ACTION.md

> Si la sesión se corta, continúa EXACTAMENTE aquí. Actualizado: **2026-06-11**.

## Estado al cierre de la última sesión
- ✅ Hero Experience **cerrada y en producción** (search integrada en el hero, sheet continuity, sticky fix `overflow-x: clip`, a11y del SearchBar, CLS=0). Commits `92f573a` + `7a3cf30`, deploy verificado en getcleaners.nl.
- ✅ Roadmap repriorizado → ver `ROADMAP_STATUS.md`.
- ✅ Sprint "Real Data v1" definido → ver `CURRENT_SPRINT.md`.

## ▶️ SIGUIENTE ACCIÓN (Sprint tarea #1)
**Cablear la búsqueda del hero a `/schoonmakers`.**

1. `apps/web/components/ui/search-bar.tsx`: el botón `Zoeken` construye `/schoonmakers?hood=<location>&date=<iso>&time=<slot>` con `useRouter` de `@/i18n/navigation` (respeta locale).
2. `apps/web/app/[locale]/schoonmakers/page.tsx` + `<CleanersBrowser>`: leer `searchParams`, inicializar filtro `hood` (mapear location→hood si coincide), mostrar chip de fecha/hora seleccionada (aunque el filtro real de fecha llegue con data real).
3. Enter en el input de location = submit.
4. QA: desktop+móvil, typecheck, lint → commit → deploy.

## Después (en orden)
- Sprint #2: Supabase schema v1 + RLS + gen types (la migración vive en `supabase/migrations/`; revisar `docs/STRIPE-CONFIG.md` y `backend/` legacy como referencia de campos).
- Sprint #3: webhook Stripe → bookings.

## Recordatorios duros
- Idioma con Antonio: **español**. UI: **holandés**. Wordmark `cleaners` siempre `translate="no"`.
- NO activar KvK (cuesta dinero). Stripe SIEMPRE test mode hasta decisión.
- NO volver a auditar lo marcado ✅ en ROADMAP_STATUS.md.
- Deploy: `vercel --prod` desde `apps/web/` (no desde root).
- `overflow-x` en html/body: SIEMPRE `clip`, jamás `hidden`.
