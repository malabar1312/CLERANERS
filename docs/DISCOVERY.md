# DISCOVERY — cleaners remake (Fase 0)

> Síntesis del estado actual del producto + plan accionable de Fase 1 (Foundation). Generado en `docs/DISCOVERY.md` el 2026-05-30. **El que arranque Fase 1 lee esto + `REMAKE-BRIEF.md` + `CLAUDE.md` y dispara `/autoplan` sin pedir permiso.**

## 1. Auditoría producción (getcleaners.nl)

`WebFetch` sobre la home confirma:

- ✅ Sitio **vivo**, branding correcto. Title: `"cleaners — Jij kiest wie jouw ruimte binnenkomt"`. Hero: `"Jij kiest wie jouw huis binnenkomt"`.
- ✅ Estructura presente: auth modal, hero, profile carousel (Sofia/Maria/Carmen), search, trust pillars, how-it-works (5 steps), verification card, reviews (3), FAQ, final CTA, waitlist iOS+Android, footer.
- ✅ Copy holandés correcto, "Geen schoonmaakbedrijf. Een marktplaats van geverifieerde schoonmakers."
- ⚠️ **Bug visible**: `title` dice "ruimte", hero dice "huis" → meta tag inconsistente con el hero. Mantener "huis" (locked en tagline) y corregir el title.
- ⚠️ KvK en footer: **`12345678` placeholder** — debe ser el KvK real de Antonio.
- ⚠️ Apps mobile marcadas "Binnenkort" (no live) — esperado, mantener.
- ⚠️ Sin variante EN. Solo `nl`. (En el remake: `next-intl` con `nl` default, `en` listo para activar.)
- ⚠️ Google Maps no integrado en la página de resultados (cae al SVG mock que hicimos).

## 2. Inventario del repo (main · commit 7c9d5a4+)

| Categoría | Conteo | Detalle |
|---|---|---|
| Code | 10 files | 6 HTML grandes (index 205K, dashboards, signup, admin, reset-password) + `pago.js` + 3 Edge Functions (TS) |
| Docs | 23 files | `CLAUDE.md`, `README.md`, `REMAKE-BRIEF.md`, briefing, changelog, 8 docs legacy, backend READMEs |
| Images | 3 SVG | `favicon`, `apple-touch-icon`, `og-image` (sin imagen generada por AI todavía) |
| SQL | 3 files | `supabase-setup.sql`, `admin-setup.sql`, `backend/supabase/migrations/0001_payments.sql` |

Branches relevantes:
- `main` — sitio actual desplegado (estable).
- `feat/real-booking` — wiring de booking real + `pago.js` + cleaner-dashboard que lee de Supabase. **Esto YA está hecho y es portable verbatim al remake.**

Knowledge graph parcial generado en `graphify-out/` (31 AST nodes + 7 nodes semánticos de imágenes; 30 edges; 8 comunidades). Los chunks 01/02 de docs+code no completaron por límite de sesión — irrelevante: el conocimiento ya está en mi contexto. `/graphify update` después si hace falta.

## 3. Lo que se porta VERBATIM al remake

### UX rules ya validadas (no re-inventar)

1. **Pill avatar (logueado) → click directo al dashboard** (cleaner vs cliente según perfil). Cero modal intermedio.
2. **Drawer móvil logueado**: cabecera user (avatar + nombre + email) + `Naar mijn dashboard →` primario + `Uitloggen` ghost.
3. **Navbar móvil = desktop**: `Inloggen` + `Aanmelden` + burger, compactos. Funciona hasta 360px sin overflow.
4. **Checkout con desglose**: Subtotaal + Servicekosten (18%) + Totaal escrow. **m² → horas**: ≤50→2u, 50-80→3u, 80-120→4u, 120+→5u.
5. **Fecha mínima checkout = mañana** (no permitir hoy).
6. **Reviews verificadas**: solo `booking.status='completed'` puede review.
7. **Mapa SVG con pins de precio** como fallback cuando no hay Google Maps key.
8. **Trust bar estática** (sin marquee). 8 ítems centrados, wrap-friendly.
9. **Premium-v3 design language**: navy/blue/blueh + acentos indigo/violet, sombras 1-capa, gradient text en `<em>`, mesh radial en zonas dark.
10. **`translate="no"`** en wordmark "cleaners" en TODA aparición (nav, footer, modal, hero).

### Backend ya escrito (deploy pendiente, código portable)

- `supabase/migrations/0001_payments.sql` — columnas Stripe + RLS.
- Edge Functions: `create-checkout`, `stripe-webhook`, `refund` (Deno + Stripe SDK + supabase-js).
- `frontend-integration/pago.js` — puente cliente → create-checkout (lo migramos a TS module en `apps/web/lib/payments.ts`).

### Decisiones de producto (LOCKED, no negociar)

- Comisión 15% / fee 18% / Stripe Connect Express / escrow / payout lunes.
- Tagline "Jij kiest wie jouw huis binnenkomt".
- Brand: navy/blue + Plus Jakarta + Instrument Serif + estrella 4 puntas.

## 4. Lo que se DESCARTA

1. **Array demo `DB`** con 8 cleaners hardcoded (Sofia, Maria, Laura, Elena, Anna, Carmen, Rosa, Isabel). Reemplazo: query a `cleaners` table con `is_visible=true` y `stripe_charges_enabled=true`.
2. **Array `REQUESTS`** en cleaner-dashboard (Marta, Joris, Carmen demo). Reemplazo: query a `bookings` con `cleaner_id=session.user.id` y `status IN ('paid','accepted')`.
3. **`localStorage cl_bookings`** y `saveBookingNow()`. Reemplazo: INSERT a `bookings` via Server Action que llama a `create-checkout`.
4. **Fotos hero stock genéricas de Unsplash** (las que daban mismatch de género). Reemplazo: cada cleaner sube su propia foto en KYC a Storage `cleaner-photos`.
5. **SVG map mock**: si Antonio configura Mapbox/Google, lo sustituimos; si no, sigue como fallback.
6. **Bloques `<style id="premium-v3...">`**. En el remake esos overrides ya no existen: el design system vive en Tailwind config + CSS vars + componentes. La paleta y la dirección visual SÍ se preservan.
7. **`config.js` con `window.supabaseClient` y `IS_REAL_MODE`**. Reemplazo: `@supabase/ssr` con clients server/browser/middleware separados.
8. **5 archivos HTML autocontenidos** (200K+ cada uno). Reemplazo: tree de componentes React reutilizables + páginas App Router.
9. **Reveal observer manual con `.rv` + `.d1/.d2/.d3`**. Reemplazo: Motion (Framer) con `whileInView` y stagger.
10. **`renderMockMap()`, `renderRequests()`, `coGo()`, `doPayment()` y demás funciones imperativas**. Reemplazo: componentes con state local + Server Actions para mutaciones.

## 5. Lo que se RENOMBRA / restructura

| Actual | Nuevo |
|---|---|
| `index.html` | `apps/web/app/[locale]/(marketing)/page.tsx` |
| `cleaner-signup.html` (1 file, 7 panes) | `apps/web/app/[locale]/(cleaner)/signup/[step]/page.tsx` (paralelo o stepper) |
| `cleaner-dashboard.html` (8 sections) | `apps/web/app/[locale]/(cleaner)/dashboard/[section]/page.tsx` |
| `client-dashboard.html` (8 sections) | `apps/web/app/[locale]/(client)/dashboard/[section]/page.tsx` |
| `admin.html` | `apps/web/app/[locale]/admin/page.tsx` (con server-side gate) |
| `reset-password.html` | `apps/web/app/[locale]/(auth)/reset-password/page.tsx` |
| `pago.js` | `apps/web/lib/payments/checkout.ts` (Server Action) |
| `config.js` | `apps/web/lib/supabase/{server,browser,middleware}.ts` + `apps/web/lib/stripe/server.ts` |
| `email-template-confirm.html` / `reset.html` | `apps/web/lib/emails/{confirm,reset}.tsx` (React Email templates) |

Estructura completa: ver `REMAKE-BRIEF.md` §9.

## 6. Plan de Fase 1 — Foundation (1 sesión)

**Objetivo**: app vacía deployada en Vercel preview con branding visible. CI verde. Sin features de producto todavía — solo el esqueleto sólido.

**Pasos en orden** (auto-ruteo de skills en cursivas):

1. **Bootstrap monorepo** (~10 min): `pnpm init` + `turbo` + `apps/web` + `packages/db`.
   _Skill: ninguna especial. Bash directo._

2. **Next.js 15 + TS strict + Tailwind 4** (~15 min): `pnpm create next-app@latest apps/web --typescript --tailwind --eslint --app --src-dir false --import-alias "@/*"`. Verifico `tsconfig` strict.

3. **shadcn/ui init** (~5 min): `pnpm dlx shadcn@latest init` con tokens replicando paleta navy/blue/indigo/violet. _Skill: `magic` (/ui) para los primeros 6 primitives — Button, Sheet, Dialog, Card, Input, Skeleton._

4. **next-intl con `nl` default** (~10 min): config en `apps/web/i18n.ts`, middleware, `messages/nl.json` con keys mínimas para Fase 1 (`nav.login`, `nav.signup`, `hero.title`).

5. **Fuentes via `next/font/google`** (~5 min): Plus Jakarta Sans (300-800) + Instrument Serif (regular+italic) en `app/layout.tsx`. Vars CSS `--font-sans`, `--font-display`. Tailwind `fontFamily` apuntando a las vars.

6. **Design tokens** (~10 min): `app/globals.css` con CSS vars de la paleta (navy/blue/blueh + indigo/violet + grays). Tailwind `theme.extend.colors` apuntando a `var(--color-...)`. Modo oscuro deshabilitado por ahora (el sitio actual es light + zonas navy puntuales).

7. **Primitives de marca** (~20 min, `impeccable craft` + `emil-design-eng`):
   - `<Star />` SVG component (4 puntas con gradient azul, `id="STAR"` symbol reutilizable).
   - `<Wordmark />` lowercase bold con `translate="no"` y aria-label.
   - `<Logo />` que compone los dos.
   - `<Nav />` desktop + mobile con burger toggle, `Inloggen`/`Aanmelden` siempre visibles.
   - `<Drawer />` mobile (estado logueado y deslogueado).
   - `<UserPill />` (avatar + nombre, click → dashboard via `goToMyDashboard()`).
   - `<Container />` (max-w + padding consistente).

8. **`@supabase/ssr` setup** (~15 min): tres clients en `lib/supabase/`:
   - `server.ts` (cookies via `next/headers`)
   - `browser.ts` (createBrowserClient)
   - `middleware.ts` (refresh session + auth gate)
   - Tipos: `pnpm dlx supabase gen types typescript --linked > packages/db/types.ts` (requiere `supabase login` + `link` — bloqueante si Antonio aún no compartió access).

9. **Page placeholder** (~5 min): `app/[locale]/page.tsx` con hero mínimo (Wordmark + tagline + un CTA mock). Suficiente para validar fonts/colores/i18n end-to-end en Vercel.

10. **Vercel preview** (~5 min): commit + push branch `v2-nextjs` → Vercel detecta y crea preview deployment. Verifico que branding y tipografía rendericen igual que mockup local.

11. **CI mínima** (~10 min): `.github/workflows/ci.yml` con `pnpm tsc --noEmit` + `pnpm lint` + Playwright smoke (la home carga, no hay errores de consola, screenshot 1440 + 390).

**Quality gate Fase 1** (auto, sin pedir):
- `pnpm tsc --noEmit` cero errores.
- `pnpm lint` cero warnings.
- `impeccable polish` sobre los primitives (Nav, Drawer, UserPill, Wordmark).
- Lighthouse perf ≥95 / a11y ≥95 / SEO ≥100 sobre la home placeholder.
- Screenshot Playwright 1440 + 390 — branding correcto.
- Cero errores de consola.

**Output**: PR a `main` con commit message `feat: foundation monorepo Next.js + design tokens + brand primitives`. Antonio mergea cuando confirma branding en preview Vercel.

**Estimación realista**: ~2h de trabajo si los bloqueos están resueltos (ver §7).

## 7. Decisiones BLOQUEANTES (Antonio)

Antes de arrancar Fase 1, hay 4 decisiones que solo Antonio puede tomar. Las pregunto vía `AskUserQuestion` al final de este documento (en chat, no en el `.md`).

1. **Repo strategy** — branch `v2-nextjs` sobre `CLERANERS` (rápido, preserva historia) vs repo nuevo `cleaners-v2` (más limpio para investors/auditores).
2. **Mapas en producción** — Mapbox (mejor estilo custom + free tier 50k loads/mo), Google Maps (más datos pero más caro), o seguir con SVG mock hasta validar negocio.
3. **Emails transaccionales** — Resend (developer-friendly, React Email native, gratis 3k/mo), Postmark (más maduro, $15/mo), o Loops (no-code visual flows). El remake los necesita en Fase 5.
4. **KYC del cleaner** — Stripe Identity (US$1.50 por verificación, KYC en 60s vía Stripe), o upload manual + revisión admin (gratis, más fricción operativa).

Decisiones que **YO tomo** (no bloqueantes):
- Sentry para errors + Vercel Analytics para CWV (estándar, gratis los dos en tiers iniciales).
- Realtime de Supabase para chat (ya está en el stack, no agregar pusher).
- React Email para templates (compose con TSX, render server-side).
- Zod para validación end-to-end (estándar con react-hook-form + Server Actions).
- pnpm + turbo + Biome (lint+format) — sin discusión.

## 8. Riesgos identificados + mitigación

| Riesgo | Mitigación |
|---|---|
| Acceso a Supabase del proyecto (gen types, deploy functions, secrets) | Antonio hace `supabase login` + `link` en Fase 1 paso 8. Si no lo tiene, generamos types desde el SQL local de las migrations. |
| Stripe Connect en TEST mode requiere completar el "platform setup" en Dashboard | Antonio: 5 minutos en `dashboard.stripe.com` → Connect → activar Express. Hasta entonces todo va en mock con feature flag. |
| Vercel + dominio getcleaners.nl downtime durante el cutover v1 → v2 | Branch `v2-nextjs` deploya a preview URL `cleraners-v2.vercel.app` mientras `main` sigue prod. Cutover de DNS solo cuando v2 pasa todos los gates. **Cero downtime.** |
| Si el v2 no convence en Fase 2 (landing) | El branch queda y `main` (v1) sigue vivo. Antonio decide si mata v2 o sigue. |
| Performance budget < 200KB First Load JS por ruta | Server Components por defecto + `next/dynamic` para modales. Validado por ruta en CI. |
| KYC docs en Storage con RLS mal configurada | Solo signed URLs server-side; bucket privado; `service_role` exclusivo para admin. Audit con `/cso` antes de merge a main. |

---

**Siguiente acción**: pregunto las 4 decisiones bloqueantes a Antonio (en chat) y arranco Fase 1 apenas responda.
