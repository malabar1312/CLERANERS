# CLAUDE.md — cleaners

> Memoria del proyecto. Léeme **primero** en cada sesión. Idioma con Antonio: **español**. UI del producto: **holandés**.

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

## Skills de diseño disponibles (globales, en `~/.claude/skills/`)
`design-taste-frontend` · `impeccable` (/impeccable audit|polish|critique…) · `ui-ux-pro-max`. Usar para refinar/auditar diseño.

## Deploy
- **Web:** push del root a GitHub → Vercel deploya estático. (Hoy NO hay remoto git configurado — ver README.)
- **Backend:** `supabase functions deploy` + `supabase secrets set` (ver `backend/SETUP-STRIPE.md`). `.env` real NUNCA en git.

## Docs
`docs/LEEME-MAÑANA.md` (último briefing), `docs/PREMIUM-v3-CHANGELOG.md` (historial de diseño), `docs/legacy/` (estado/roadmap/stripe-plan originales).
