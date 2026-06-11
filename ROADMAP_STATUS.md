# ROADMAP_STATUS.md — cleaners (getcleaners.nl)

> Fuente de verdad operativa. Actualizado: **2026-06-11** (sesión Hero Experience).
> Contexto asumido: **fase beta** — los mocks son deliberados (validan UX), la ausencia de cleaners reales NO es un problema. Objetivo actual: construir la plataforma correctamente.

## ✅ Cerrado (no re-auditar)

| Bloque | Estado | Evidencia |
|---|---|---|
| Landing pública completa (Hero, Showcase, HowItWorks, Features, Reviews, CtaBand, FAQ, Footer) | ✅ | prod `getcleaners.nl` |
| Rediseño v4 Stitch quiet-luxury (tokens, primitives, nav glass) | ✅ | `docs/design/stitch/` |
| Perfil cleaner `/schoonmakers/[id]` + listado con filtros (mock 12) | ✅ | SSG + client filters |
| Booking vertical slice Stripe TEST (pricing 18%, checkout idempotente, success) | 🟡 falta webhook+persistencia | `lib/booking/`, `lib/stripe/` |
| Auth Supabase (login/signup + confirmación email corporativa) | ✅ | commit `8e91200` |
| Audit móvil P1-P6 (overflow, carousel, auth, dashboard) | ✅ | commit `52b262b` |
| **Hero Experience definitiva** (search DENTRO del hero, sheet continuity, sticky fix, a11y, CLS=0) | ✅ **HOY** | commits `92f573a`, `7a3cf30` |
| 11 páginas stub (cero 404 en nav/footer) | ✅ | `<PlaceholderPage>` |

### Hero — decisiones técnicas que NO revertir
- `overflow-x: clip` (NUNCA `hidden`) en html/body — `hidden` rompe todo `position: sticky`.
- Breakpoint cinematográfico = `lg` (1024): debajo, hero natural-flow sin recorte de video; encima, cover + scrub por scroll.
- `aspect-video` reservado en el video móvil → CLS 0 medido.
- Nav: estado `scrolled` se sincroniza en effect (no en useState init) → sin hydration mismatch.
- SearchBar vive DENTRO de `hero.tsx`; la sección siguiente es una sheet blanca `rounded-t` con `-mt` sobre el video.

## 🔢 Prioridades recalculadas (Impacto × Riesgo × Dependencias × Tiempo)

### P0 — Bloqueantes críticos (sin esto no hay producto real)
1. 🔶 **Aplicar schema.sql al remoto** — el schema YA EXISTE en repo (idempotente) y el código ya lo consume; al remoto le faltan `profiles`, `cleaner_profiles`, `favorites` (verificado 2026-06-11 con `scripts/verify-supabase.mjs`). **Paso manual de Antonio: SQL Editor → Run.**
2. ✅ **Webhook Stripe → bookings** — YA EXISTÍA completo (`app/api/webhook/stripe/route.ts`: firma fail-closed, dedupe `webhook_events`, upsert idempotente, refunds). Solo confirmar `STRIPE_WEBHOOK_SECRET` en Vercel prod.
3. ✅ **Search del hero cableada** — HECHA 2026-06-11 (commit `8049d6b`, en prod).

### P1 — Imprescindibles para MVP real
4. Auth ↔ booking (sesión en server action; decisión: login obligatorio vs guest email).
5. Dashboard cliente con bookings reales (lista, estado, cancelar).
6. Cleaner signup wizard → perfil draft en Supabase (SIN Connect/KvK aún — decisión Antonio: KvK cuesta dinero, no activar hasta pulir).
7. Dashboard cleaner: aanvragen reales (aceptar/rechazar → estado booking).
8. Emails transaccionales Resend (booking confirmada cliente+cleaner).
9. Stripe Connect Express + destination charge 15% — **gated por decisión KvK**; mientras tanto en test mode.

### P2 — Mejoras de producto
10. Reviews reales post-booking (gated: requiere bookings completadas).
11. Filtros servidor en `/schoonmakers` cuando haya data real.
12. SEO programático (páginas por barrio), sitemap, OG images.
13. Analytics de funnel (eventos search→perfil→checkout).

### P3 — Escalabilidad futura
14. Admin panel real · KYC Stripe Identity · payouts semanales automáticos · Sentry/monitoring · rate limiting global · EN locale completo · tests e2e CI.

## ⚠️ Riesgos vivos
- **3 tablas faltantes en remoto** (`profiles`, `cleaner_profiles`, `favorites`): gatean rol en dashboard, onboarding cleaner y favoritos. Fix = re-ejecutar schema.sql (manual Antonio, idempotente).
- **`STRIPE_WEBHOOK_SECRET` en Vercel prod sin confirmar**: si falta, el webhook responde 503 y los pagos test no persisten.
- **KvK**: Connect real bloqueado por coste; mantener TODO en Stripe test mode hasta decisión.
- **Mocks vs real**: el switch ya es AUTOMÁTICO (`lib/data/cleaners.ts`: ≥1 fila visible en `cleaner_profiles` → real; si no → mock). Seed opcional en `supabase/seed-cleaners.sql`.
- **Keys Supabase formato nuevo** (`sb_secret_`/`sb_publishable_`): usar header `apikey` solo — `Authorization: Bearer` da 401 engañoso.
- **`next lint` deprecado** (Next 16 lo elimina): migrar a ESLint CLI cuando toque, no urgente.
