# KNOWN-GAPS.md — cleaners (BETA)

> Inconsistencias intencionales del estado BETA. Cada item es una decisión, no un bug.
> Cuando un item se resuelva, mover a un CHANGELOG y eliminarlo de aquí.

---

## A. Marketplace mock-vs-real

| Gap | Estado actual | Plan |
|---|---|---|
| Catálogo de cleaners | `lib/mock/cleaners.ts` (12 perfiles) — fuente de verdad | Migrar a `cleaner_profiles` (cycle futuro). Capa `lib/data/cleaners.ts` ya prevista. |
| Reviews | `lib/mock/reviews.ts` — fuente de verdad | Migrar a tabla `reviews` (cycle futuro) |
| Servicios del cleaner dashboard | `lib/data/cleaner-services.ts::getMockServicesForCleaner()` — BETA fallback | Cuando `cleaner_profiles` + linking exista, `dashboard/page.tsx` fetcheará bookings reales del cleaner. |
| Customer overview "Quick access" | Mock estático | OK BETA |
| Cleaner overview KPI cards (€1.240, 4,9, etc.) | Hardcoded | OK BETA — pendiente cleaner_profiles |
| Inbox messages en dashboard | Hardcoded "Voorzichtig met de..." | Implementar tabla `messages` (cycle futuro) |

---

## B. Trust claims que aún NO tienen sustento real

| Claim | Ubicación | Estado | Acción cuando se exponga públicamente |
|---|---|---|---|
| "Geverifieerd" pill | Landing + perfil + booking modal | Sin verificación KvK/VOG real | Lock visual hasta `cleaner_verifications` populated (cycle futuro). |
| "Verzekerd €300.000" | Hero trust bar + perfil | Sin póliza vigente | Soften copy O contratar seguro real antes de exponer públicamente |
| "Escrow" | Booking trust strip | Es cobro inmediato + transfer futuro (no retención real) | Implementar Stripe Connect destination charge (cycle futuro) |
| Reviews "verifiedBooking" badge | Perfil cleaner | Mock | Conditionally render solo cuando `reviews.booking_id` no es null |
| Waitlist count | Footer | Real (lee de Supabase) | OK |
| Rating numérico (4.9 etc.) | Mock cleaners array | Estático | OK BETA |

**Decisión registrada (cycle 1+):** Beta badge se activará solo en `/aanmelden/schoonmaker` cuando exista, NO en landing pública.

---

## C. Flujos parcialmente implementados

| Flujo | Implementado | Pendiente |
|---|---|---|
| Booking checkout | ✅ Server Action + Stripe TEST + webhook + persistencia pending → paid | Stripe Connect (15% comisión al cleaner), email confirmation (Resend), cleaner accept/reject |
| Auth signup | ✅ Customer + cleaner role + trigger profile | OAuth (Google/Apple), email verification UI, MFA |
| Auth login | ✅ Password | MFA, magic link |
| Forgot password | ✅ Server Action + email Supabase | Custom email template via Resend |
| Customer dashboard | ✅ Overview + calendar + payments (3 views) + real latest booking | Bookings list completa, messages, profile editor |
| Cleaner dashboard | ✅ Overview + calendar + earnings + settings (4 views, mock) | Real services fetch, accept/reject buttons, withdraw via Stripe Connect |
| Favorites | ✅ Toggle + RLS | UI list dedicada |
| Cookie banner | ✅ NL/EN + persist | Granular preferences (analytics opt-out) |

---

## D. Security gaps no críticos en BETA

| Gap | Severidad BETA | Mitigación actual | Plan prod |
|---|---|---|---|
| Rate-limit in-memory (no cross-instance) | LOW | Hash de UA en la key encarece bypass | Upstash Redis (`@upstash/ratelimit`) — tier free 10k/día |
| Sin CAPTCHA en formularios públicos | LOW | Honeypot field en signup + waitlist; rate-limit IP+UA | Cloudflare Turnstile o hCaptcha invisible si abuse crece |
| Login min 6 chars (legacy) | LOW | Solo afecta usuarios pre-cycle-4; signup nuevo exige 10 | Reset prompt cuando usuarios pre-cycle-4 hagan login |
| Sin MFA | LOW | Email + password único factor | TOTP via Supabase Auth (Pro plan) |
| No HIBP password check | LOW | Blocklist patterns triviales aplicado | Integración con `Pwned Passwords` API (cycle futuro) |
| Logs en console.warn dev-only | OK | Stripe webhook errors fallan al log default | Sentry / Axiom en producción |
| Sin audit trail | OK BETA | — | Tabla `audit_log` cuando haya admin panel |

---

## E. Performance pendientes

| Item | Estado | Plan |
|---|---|---|
| Dashboard sin code-splitting por view | Bundle único | Lazy import por view cuando bundle > 200kb |
| Customer overview es 100% client | OK por interactividad | OK |
| ISR landing (revalidate=60) | ✅ | OK |
| Webhook node runtime | ✅ (no edge — necesita raw body) | OK |
| Imágenes Supabase storage | Config en next.config.ts pero sin uso real | Cuando haya fotos cleaner reales |

---

## F. UX / Copy debt

| Item | Estado | Plan |
|---|---|---|
| Booking modal sin draft saving | Cierre = pérdida total | localStorage por step (cycle futuro) |
| `/aanmelden/schoonmaker` landing dedicada | No existe — usa `/signup?role=cleaner` | Crear landing específica con Indeed funnel copy |
| Sticky CTA mobile | Solo en landing | Considerar en dashboard mobile (tab bar inferior) |
| Settings dashboard buttons no wire | "Save changes" no actualiza profile | Wire a Server Action `updateProfile` (cycle futuro) |
| Mensajes hardcoded "Voorzichtig met de..." en inbox | OK BETA | Empty state cuando exista `messages` table |

---

## G. Decisiones de Antonio pendientes (no bloquean BETA)

- ¿Activar KvK (€75/anual) cuando se publique a Indeed?
- ¿Cuándo contratar póliza de seguro real?
- ¿Wedge inicial: Airbnb hosts (verhuurders) o cleaners generales?
- ¿Si BETA badge se activa en `/aanmelden/schoonmaker`, también softening de claims en esa landing?

---

## H. Cómo se actualiza este archivo

- Cuando un item se resuelve completamente: borrar de aquí + mencionar en commit.
- Cuando se descubre un gap nuevo durante un AUTO-CYCLE: agregar a la sección correspondiente.
- Si un item es ambiguo entre "gap" e "issue", default a "gap" (BETA convention).
