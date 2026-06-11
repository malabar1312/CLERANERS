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
1. **Supabase schema v1 + RLS + types** (`profiles`, `cleaner_profiles`, `bookings`, `reviews`) — TODO lo demás depende de esto. ~1 sesión.
2. **Webhook Stripe → persistencia bookings** (fuente de verdad del pago; hoy el checkout es fire-and-forget). Depende de 1. ~0.5 sesión.
3. **Search del hero cableada** a `/schoonmakers?hood=&date=&time=` — el hero ahora PROMETE búsqueda; el botón Zoeken no navega. Sin dependencias. ~0.25 sesión. (Bajo esfuerzo, impacto directo en la promesa del hero → va primero en sprint.)

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
- **Webhook sin implementar**: si un pago test se completa, no queda registro en DB (P0-2 lo mata).
- **KvK**: Connect real bloqueado por coste; mantener TODO en Stripe test mode hasta decisión.
- **Mocks vs real**: `lib/mock/cleaners.ts` alimenta landing/listado/perfil — el switch a Supabase debe ser 1 PR por superficie (interfaz `CleanerPreview` ya lo permite).
- **`next lint` deprecado** (Next 16 lo elimina): migrar a ESLint CLI cuando toque, no urgente.
