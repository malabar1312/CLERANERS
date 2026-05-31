# CLAUDE.md — cleaners

> Memoria del proyecto. Léeme **primero** en cada sesión. Idioma con Antonio: **español**. UI del producto: **holandés**.

> 🆕 **Branch v2-nextjs activa.** Estás en la remake Next.js. El stack vanilla "LOCKED" descrito más abajo aplica solo al branch `main` (el MVP en producción `getcleaners.nl`). En `v2-nextjs` el stack es Next.js 15 + TypeScript strict + Tailwind v4 + shadcn-style primitives + Supabase SSR + next-intl. Ver `docs/REMAKE-BRIEF.md` y `docs/DISCOVERY.md`.

## v2-nextjs · setup operativo

> 🎨 **DIRECCIÓN DE ARTE v3 = NOIR EDITORIAL** (decisión de Antonio, mayo 2026). El brand azul/Jakarta/Instrument quedó SUPERADO en `v2-nextjs` (sigue vigente solo en `main`/MVP). Paleta nueva: **noir `#0A0A0B`** (canvas) · **marfil `#F5F3EF`** (texto) · **lima ácida `#D4FF3F`** (acento, se usa CON MODERACIÓN — un golpe por pantalla) · **papel `#F2EFE9`** (secciones invertidas). Fonts: **Anton** (display condensada, MAYÚSCULAS, escala brutal) + **Inter** (body/UI). Ritmo de secciones: noir ↔ papel, con UNA banda lima ácida (`<CtaBand>`) de máximo impacto antes del footer. Estética: lujo silencioso, Off-White/SSENSE/Aesop. La estrella del logo ahora es lima ácida. Wordmark "cleaners" SIGUE con `translate="no"` obligatorio. Tokens en `app/globals.css` (@theme noir + utilities `headline`/`kicker`/`bg-grain`/`acid-rule`).

- **Monorepo**: pnpm workspaces + turbo. `apps/web` (Next.js 15) + `packages/db` (Supabase types).
- **Comandos**: `pnpm dev` · `pnpm build` · `pnpm typecheck` · `pnpm lint` (todos pasan por turbo).
- **Env**: copiar `apps/web/.env.example` → `apps/web/.env.local` y llenar Supabase URL+anon. Sin esto el dev server arranca pero `lib/supabase/*` tira al primer request.
- **Brand primitives** ya escritos: `<Star />`, `<Wordmark>` (con `translate="no"` obligatorio), `<Logo />`, `<Container />`, `<Button />` (variantes primary/secondary/ghost/ghost-on-dark/danger), `<Nav />` (paridad móvil, scroll-aware), `<Drawer />` (logueado/no-logueado), `<UserPill />`.
- **i18n**: `nl` default + `en` con next-intl 4, `localePrefix: "as-needed"` (la URL raíz sirve nl sin prefijo). Mensajes en `apps/web/messages/{nl,en}.json`.
- **Routing**: `app/[locale]/page.tsx` (landing placeholder con hero + nav), `app/layout.tsx` pass-through. Middleware en `middleware.ts` (locale negotiation; supabase auth refresh se compone en Fase 4).
- **CI**: `.github/workflows/ci.yml` corre typecheck + lint + build con env placeholders en cada push a `main` y `v2-nextjs`.
- **Vercel**: `vercel.json` actualizado a `framework: "nextjs"` + `buildCommand: pnpm turbo run build --filter=web...` + headers de seguridad preservados.

### Próximas fases (después de Foundation)
- ✅ **Fase 2 · Landing pública** — HECHA. Hero (título editorial `kiest`, search island, trust badges, social proof, dot grid + mesh), HowItWorks (3 pasos), Features (4 garantías), CleanersGrid (8 mock), Reviews (testimonios serif), FAQ (acordeón headless accesible con `inert`), Footer (wachtlijst Server Action + honeypot, KvK/BTW placeholder `····`), StickyCTA móvil. Primitives nuevos: `<Section>`, `<Card>` (barra gradient hover), `<MotionReveal>` (reveal on-scroll, respeta reduced-motion), `<AvatarInitials>`, `<HeroSearch>`. Tokens v2 (easings, sombras, gradientes, type scale clamp, dark-mode placeholder). Button extendido (asChild, loading, hero/outline/link/icon). Favicon de marca en `app/icon.svg`. Verificado typecheck/lint/build + QA visual gstack (desktop 1440 + móvil 390).
- ✅ **Página `/schoonmakers`** (listado) — HECHA. `app/[locale]/schoonmakers/page.tsx` (server) + `<CleanersBrowser>` (client, filtros barrio/especialidad/orden client-side sobre mock, count reactivo aria-live). Mata el 404 del nav/hero/CTA. Mock ampliada a 12 + helpers `cleanerHoods`/`cleanerSpecialties`/`filterCleaners`. MCP **Stitch** (Google, generador UI) registrado — tools disponibles al reiniciar sesión.
- ✅ **Rediseño v3 · Noir Editorial** — HECHO. Toda la landing re-themed: tokens noir en globals, fonts Anton+Inter, primitives (Star ácida, Logo, Button noir+acid pill MAYÚSCULAS, Section noir/paper/acid, Card hairline + barra ácida hover, AvatarInitials monocromo), Nav/Drawer/UserPill noir, Hero brutal (Anton gigante, `KIEST` ácido, frame lookbook + grano), `<CtaBand>` lima ácida nueva. Verificado typecheck/lint/build + QA gstack (hero/papel/grid/cta-ácida/FAQ/footer/móvil).
- **Fase 3 · Booking real** — calendar + servicekosten transparente (18%) + Stripe Checkout → webhook → bookings table. 2 sesiones.
- **Fase 4 · Cleaner journey** — wizard signup + Stripe Connect Express + KYC vía Stripe Identity + dashboard real. 2 sesiones.
- **Fase 5 · Cliente + admin + polish** — dashboard cliente + admin + emails Resend + polish.
- **Fase 6 · Producción** — Vercel prod + dominio + monitoring + launch checklist.

---

## ⚡ Directiva 0 (no negociable)

**Antonio NUNCA escribe el nombre de una skill, plugin o comando.** Antes de empezar CUALQUIER tarea, hacés un pre-flight de 5 segundos: clasificás la intención del mensaje, mirás el toolkit (sección "Workflow automático con skills" más abajo + lista completa de skills cargadas en la sesión) y **activás vos** las que correspondan, combinándolas si el problema lo amerita. Si tenés duda, invocá la más probable; mejor pasarse que quedarse corto. Validación al final con `code-review`/`simplify`/Playwright/`/qa`. **Cero comandos del usuario para activar skills.**

## Qué es
**cleaners** — marketplace premium de schoonmaak (limpieza) en Ámsterdam. `getcleaners.nl`.
El cliente **ELIGE** quién entra a su casa (no asignación automática).
Tagline (locked): **"Jij kiest wie jouw huis binnenkomt"**. Diferenciador: *trust platform*, no empresa de limpieza.

## Stack (LOCKED — no negociar)
- **HTML/CSS/JS vanilla**. CERO frameworks, CERO React, CERO build step.
- **Supabase** (auth + DB + RLS + Storage + Edge Functions). **Vercel** (deploy estático del root).
- Cada página es un `.html` autocontenido con su `<style>` y su `<script>`.

## Marca (LOCKED)
- Colores: `--navy:#0C1420` · `--blue:#1A56DB` · `--blueh:#1648c0`. Acentos de diseño: índigo `#4F46E5`, violeta `#8B5CF6` (gradientes).
- Fuentes: **Plus Jakarta Sans** (300-800) + **Instrument Serif** (display/italic).
- Logo: estrella 4 puntas con gradient azul (`#STAR` symbol SVG).
- Wordmark **"cleaners" SIEMPRE con `translate="no"`** (Google Translate no debe traducirlo).

## Archivos (raíz = sitio desplegable)
| Archivo | Qué es |
|---|---|
| `index.html` | Landing: hero, search, resultados+mapa, perfil (modal), checkout, reviews, FAQ, waitlist, footer, auth modal |
| `cleaner-signup.html` | Wizard 7 pasos para darse de alta como cleaner |
| `cleaner-dashboard.html` | Dashboard cleaner (8 secciones) · light theme |
| `client-dashboard.html` | Dashboard cliente (8 secciones) · light theme |
| `admin.html` | Panel interno (gate: sesión + `admin_users`) |
| `reset-password.html` | Flujo recover password |
| `config.js` | Crea `window.supabaseClient`. La anon key es pública por diseño. Define `IS_REAL_MODE` y `GMAPS_KEY`. |
| `vercel.json` | Config de deploy estático |

## Sistema de diseño "premium-v3" (cómo está implementado)
El refactor visual NO reescribió el HTML: son **bloques override** inyectados al final del `<head>`, **reversibles** borrándolos:
- `<style id="premium-v3">` — base Airbnb×Booking (radios 12-16, sombras 1 capa, search blanco, focus azul, trust bar estática, dots sin pulse)
- `<style id="premium-v3-f2">` — secciones inferiores nivel editorial (tipografía grande, **gradient text** navy→índigo→violeta, profundidad, glow)
- `<style id="premium-v3-hero">` — hero al nivel f2
- `<style id="premium-v3-mobile">` — **paridad móvil** (auth visible en top bar, drawer logueado, etc.)
- Dashboards/signup/admin: cada uno tiene su `<style id="premium-v3">`.
Dirección estética elegida por Antonio: **"máximo impacto"** (libertad creativa respetando solo la marca). Cohesión: navy→índigo→violeta, Stripe/Linear/Airbnb-grade. Evitar el "AI slop" (cyan eléctrico, aurora animada, tickers, badges neón).

## Reglas de trabajo (CRÍTICAS)
1. **CSS override-only.** Toca diseño con bloques `<style id="premium-v3...">`, no reescribas el CSS base.
2. **NUNCA** cambies `onclick`, `id`, `name`, `data-*`, ni rompas llamadas a Supabase.
3. **Preserva** los elementos `.rv` (reveal observer) y todos los `translate="no"`.
4. **NO** `!important` sobre `transform`/`opacity` de `.rv` (rompe el observer).
5. Respeta `prefers-reduced-motion`.
6. **Validá con Playwright** (Chrome real) a **1440×900** y **390×844** tras cada cambio. Patrón: server estático local (`node` sirviendo la carpeta) + `playwright-core` con `channel:'chrome'`. Para dashboards/admin sin sesión real, inyectá un **stub de Supabase** (getSession→session, from→demo) vía `addInitScript` + bloqueá config.js/supabase-js con `page.route`.

## Modelo de negocio (LOCKED)
- Comisión plataforma **15%** · fee al cliente **18%** (cubre 15% + ~3% Stripe).
- **Stripe Connect** (Express accounts, destination/Direct charges). Cobro inmediato al reservar. **Escrow** liberado al confirmar. Payout **lunes semanal** automático. Refund revierte cargo + transferencia + comisión.

## Estado (qué está hecho)
- ✅ Refactor visual completo de las 5 páginas + reset-password.
- ✅ **Paridad móvil**: auth visible (Inloggen/Aanmelden), drawer con estado logueado (pill + "Mijn account & dashboard" + Uitloggen), mapa SVG con pins (sin Google key).
- ✅ Bugs arreglados: desglose de precio (subtotal + **18%** + total, m² define horas), foto de portada coherente, fecha payout dinámica, números demo consistentes, fecha checkout mín = mañana.
- ✅ **Backend Stripe Connect escrito** (no desplegado) en `backend/`.

## Pendiente (próximo, para escalar)
1. **Desplegar el backend** (`backend/SETUP-STRIPE.md`): cuenta Stripe + keys, correr SQL, `supabase functions deploy`, webhook. → requiere credenciales de Antonio.
2. **Booking real cliente↔cleaner**: hoy el booking se guarda en `localStorage` (demo) y las aanvragen del cleaner son demo → desconectados. Cablear con Supabase (`backend/frontend-integration/`).
3. **KYC real**: uploads a Supabase Storage (hoy son mock).
4. **connect-onboard** (Stripe Express del cleaner), **Resend** (emails transaccionales), **Google Maps key** (o mantener el SVG mock).

## 🔁 Workflow automático con skills (REGLA OPERATIVA)

**Antonio NUNCA tiene que pedir una skill por nombre.** En CADA tarea de este proyecto, vos hacés un **pre-flight de 5 segundos** ANTES de empezar a desarrollar:

1. **Clasificá** el tipo de tarea (UI/CSS, integración backend, generación de assets, auditoría de código, refactor, debug, deploy…).
2. **Mirá** la lista de skills disponibles abajo y elegí las que aplican.
3. **Invocá** vía el Skill tool **sin avisar ni pedir confirmación**.
4. **Repartí el trabajo** entre varias skills si la tarea lo amerita (ej.: redesign = `design-taste-frontend` para dirección + `impeccable craft` para implementación + `emil-design-eng` para micro-interacciones + `muapi-brand-kit` para assets).
5. **Validá al final** con Playwright + `code-review` o `simplify` sobre el diff.

> Si no estás seguro qué encaja, **igual invocá la más probable** y ajustá. Mejor invocar de más que no invocar.

### Skills disponibles (globales, en `~/.claude/skills/`) — routing rápido

**🎨 Diseño / UI / UX** (combinar para resultado premium):
- `impeccable` — auditar, pulir, criticar, animar, refactor visual end-to-end. Comandos: craft, polish, audit, critique, distill, harden, animate, bolder, quieter, layout, typeset.
- `design-taste-frontend` — anti-slop para landings, portfolios y **redesigns**. Lee brief, infiere dirección, audit-first.
- `emil-design-eng` — polish, micro-interacciones, transiciones, los detalles invisibles que hacen que se sienta premium.
- `ui-ux-pro-max` — 96 paletas, 57 font pairings, 67 estilos, 25 charts, 13 stacks. Incluye MCP shadcn/ui.
- `muapi-ui-design` / `muapi-url-to-design` — mockups Atomic Design + rediseño desde URL.

**🧠 Arquitectura / código** (entender antes de tocar):
- `graphify` — **`/graphify .` mapea TODO el proyecto** en un grafo queryable. Úsala ANTES de cambios grandes para entender impacto y relaciones.
- `code-review` — bugs + reuse/efficiency sobre el diff actual. Ofrece `--fix` para aplicar.
- `simplify` — reuse + altitud + cleanups (sin cazar bugs).
- `security-review` — review pre-deploy.

**🖼️ Assets visuales (web + marketing de cleaners)**:
- `muapi-brand-kit` / `muapi-design-guide` — kit visual completo de cleaners (logo, paleta, tipos, UI).
- `muapi-logo-creator` / `muapi-logo-branding` / `muapi-3d-logo-animation` — logos en variantes + animado.
- `muapi-interior-design-visualizer` — **antes/después de limpieza** (testimonios visuales en el sitio).
- `muapi-ad-creative` / `muapi-instagram-post` / `muapi-blog-header` — campañas y social.
- `muapi-product-campaign` / `muapi-product-ad-cinematic` — multicanal + cinematic 5-10s.
- `muapi-ugc-lifestyle-try-on` / `muapi-ugc-video-factory` — UGC ads (cleaners en acción).
- `muapi-social-media-video` / `muapi-youtube-shorts` / `muapi-youtube-thumbnail` — contenido vertical.
- `muapi-cinema-director` / `muapi-seedance-2` — video alta gama.
- `nanobanana` (MCP) — generación rápida con Gemini 3 Image (necesita billing en Google AI).

**🧩 Componentes React / diseño de pantallas** (estamos en el remake Next.js — `v2-nextjs`):
- `magic` (MCP, `/ui`) — componentes shadcn/ui + Tailwind desde lenguaje natural.
- `stitch` (MCP, Google) — genera pantallas/UI completas con IA. Úsalo como **referencia de diseño** al crear pantallas nuevas (perfil de cleaner, booking, dashboards), y SIEMPRE bajá el output al sistema **Noir Editorial** (noir/marfil/lima ácida + Anton). No copies su estilo crudo — respetá nuestros tokens.

**✅ Verificación / despliegue / utilidades**:
- `verify` — confirma que un cambio funciona corriendo la app.
- `run` — launch del proyecto para ver el cambio en vivo.
- `update-config` — settings.json, hooks, permisos.
- `init` — refresh de este CLAUDE.md cuando cambien los hechos del proyecto.

### Tabla de routing automático
| Antonio dice / envía | Skills que invoco automático |
|---|---|
| "Mejorá X" / "Polish X" | `impeccable polish` + `emil-design-eng` + (`graphify` si toca varios archivos) |
| "Audita el sitio" / "Critica" | `impeccable critique/audit` + `design-taste-frontend` (audit-first) + Playwright |
| "Rediseñá / Hacé un remake" | `design-taste-frontend` (dirección) + `impeccable craft` + `ui-ux-pro-max` (paleta) + `muapi-brand-kit` |
| Cambios grandes / refactor | `graphify` (mapeo previo) → cambios → `code-review` + `simplify` sobre el diff |
| "¿Dónde se …?" / "Cómo conecta …?" | `graphify` (query del grafo) |
| "Generá logo / brand kit / OG image" | `muapi-brand-kit` o `muapi-logo-branding` (o `nanobanana` si billing) |
| "Hacé un post / ad para redes" | `muapi-instagram-post` / `muapi-ad-creative` / `muapi-rednote-cover` |
| "Video de cleaners trabajando" | `muapi-ugc-video-factory` o `muapi-product-ad-cinematic` |
| Antes/después de limpieza | `muapi-interior-design-visualizer` |
| Pre-deploy / merge a main | `/review` (gstack) → `/cso` (security) → `/qa <preview-url>` → `/ship` o `code-review` |
| QA en vivo sobre URL | `/qa` (gstack, abre browser real) o `/qa-only` (más ligero) |
| "Plan / scope antes de codear" | `/office-hours` → `/plan-ceo-review` → `/autoplan` → implementar → `/ship` |
| Investigar bug / "¿qué pasa con X?" | `/investigate` (gstack) + `graphify` |
| Web browsing (navegación, scraping) | `/browse` (gstack, NUNCA `mcp__claude-in-chrome__*`) |
| "Setea X automático cada que…" | `update-config` (hooks/settings) |

## gstack — toolkit de YC (Garry Tan)

Instalado en `~/.claude/skills/gstack/` (92 sub-skills, binario `browse` propio).

**Regla obligatoria:** para CUALQUIER web browsing (navegar, scrapear, dogfooding del sitio) usá **`/browse`** del gstack. **NUNCA** uses tools `mcp__claude-in-chrome__*` ni `mcp__Claude_in_Chrome__*` cuando gstack esté disponible — son más lentas y menos confiables que `browse`.

**Slash commands disponibles** (orientativo — el routing real lo decidís según la tarea):

`/office-hours` · `/plan-ceo-review` · `/plan-eng-review` · `/plan-design-review` · `/design-consultation` · `/design-shotgun` · `/design-html` · `/review` · `/ship` · `/land-and-deploy` · `/canary` · `/benchmark` · `/browse` · `/connect-chrome` · `/qa` · `/qa-only` · `/design-review` · `/setup-browser-cookies` · `/setup-deploy` · `/setup-gbrain` · `/retro` · `/investigate` · `/document-release` · `/document-generate` · `/codex` · `/cso` · `/autoplan` · `/plan-devex-review` · `/devex-review` · `/careful` · `/freeze` · `/guard` · `/unfreeze` · `/gstack-upgrade` · `/learn`

**Flujo recomendado para una feature**: `/office-hours` (entender) → `/autoplan` (planear) → implementar → `/review` (bugs) → `/cso` (security) → `/qa <url>` (browser real) → `/ship` (PR + deploy). Para cleaners cabe perfecto en lo que ya tenemos planeado (booking real, KYC, despliegue de Stripe).

## Deploy
- **Web:** push del root a GitHub → Vercel deploya estático. (Hoy NO hay remoto git configurado — ver README.)
- **Backend:** `supabase functions deploy` + `supabase secrets set` (ver `backend/SETUP-STRIPE.md`). `.env` real NUNCA en git.

## Docs
`docs/LEEME-MAÑANA.md` (último briefing), `docs/PREMIUM-v3-CHANGELOG.md` (historial de diseño), `docs/legacy/` (estado/roadmap/stripe-plan originales).
