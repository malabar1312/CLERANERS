# 📊 ESTADO ACTUAL · cleaners

**Última actualización**: 22 mayo 2026

---

## 🎯 Concept y posicionamiento

**cleaners** = marketplace premium de schoonmaak en Amsterdam donde el dueño de la propiedad **ELIGE** quién entra a su casa (no asignación automática).

- **Tagline**: "Jij kiest wie jouw huis binnenkomt"
- **Dominio**: getcleaners.nl
- **Target inicial**: Amsterdam y suburbios
- **Diferenciador**: trust platform, no cleaning company
- **Modelo**: 15% comisión, fee al cliente 18% total

---

## 🟢 LO QUE FUNCIONA (verificado en producción)

### Auth y Signup
- ✅ Email + contraseña con Supabase Auth (modo REAL)
- ✅ Validación en vivo del password (strong/match)
- ✅ Toggle 👁 mostrar/ocultar password
- ✅ Email corporativo premium de verificación
- ✅ Cross-device verification (PC se entera cuando móvil verifica)
- ✅ Smart routing post-login: detecta cleaner vs client por DB
- ✅ Social login Google + Apple (configurable en Supabase)
- ✅ Logout funcional
- ✅ User pill en navbar con avatar + name

### Onboarding de cleaner
- ✅ 7 pasos del wizard (`cleaner-signup.html`)
- ✅ Auth-aware boot: si no hay sesión → redirige a /
- ✅ Si ya es cleaner → redirige a dashboard
- ✅ Si nuevo → salta a paso 4 con datos pre-poblados desde auth
- ✅ Datos profesionales: años, servicios, idiomas, bio, tarifa
- ✅ KYC docs simulados (animación de upload)
- ✅ Beschikbaarheid: días + horarios
- ✅ Al final inserta en tabla `cleaners` con `status='pending', is_visible=false`

### Dashboard cleaner (`/cleaner-dashboard.html`)
- ✅ 8 secciones: Home, Aanvragen, Agenda, Berichten, Profiel, Verdiensten, Verificatie, Instellingen
- ✅ Auth gate: sin sesión → redirige a /
- ✅ Lee datos REALES desde Supabase (`cleaners` table)
- ✅ Mapeo snake_case ↔ camelCase
- ✅ 3 estados visibles: 🟠 In beoordeling / 🟢 Geverifieerd · Wachten / 🟢 Live
- ✅ Banner "Maak je profiel af (X/5)" con tareas pendientes
- ✅ Edit bio + tarifa guarda a Supabase

### Dashboard cliente (`/client-dashboard.html`)
- ✅ 8 secciones: Dashboard, Mijn boekingen, Favorieten, Berichten, Profiel, Adressen, Betaalmethoden, Account
- ✅ Auth gate
- ✅ Lee desde tabla `clients`
- ✅ Auto-crea client profile si falta
- ✅ Edit profile guarda a Supabase
- ✅ Direcciones múltiples (JSONB)
- ✅ Métodos de pago mock (ready para Stripe)

### Admin panel (`/admin.html`) - solo para mí
- ✅ Auth gate triple: sesión + `admin_users` table + RLS
- ✅ 6 secciones: Dashboard, Schoonmakers (3 tabs), Klanten, Boekingen, Waitlist, Instellingen
- ✅ 6 stats cards en tiempo real
- ✅ Acciones 1-click: Approve, Reject (con razón), Toggle visibility, Suspend, Reactivate
- ✅ Render automático con datos reales

### Home (`/index.html`)
- ✅ Diseño premium linear (Booking/Airbnb-style)
- ✅ Modal de auth premium (login + signup tabs)
- ✅ Role pick (cliente / cleaner) en signup
- ✅ Cards de cleaners desde Supabase (real) o demo (fallback)
- ✅ Badge "DEMO" sutil si no hay cleaners reales
- ✅ Booking-style search box
- ✅ Trust pillars, How it works, Reviews, FAQ, Waitlist, Footer
- ✅ Mobile optimizado

### Infraestructura
- ✅ Vercel auto-deploy desde GitHub
- ✅ DNS Mijndomein configurado (A 216.198.79.1 + CNAME unique vercel-dns)
- ✅ HTTPS automático
- ✅ Cookies GDPR banner + settings modal (4 categorías toggleables)
- ✅ Cookies preferences en dashboards
- ✅ Brand consistente en todos archivos
- ✅ Logo "cleaners" con `translate="no"` (Google Translate no lo traduce)
- ✅ Email template corporativo premium en Supabase
- ✅ Supabase RLS configurado en todas las tables

### Database Supabase
- ✅ Tabla `cleaners` (profile + KYC + status)
- ✅ Tabla `clients` (profile + addresses + payment_methods JSONB)
- ✅ Tabla `bookings` (con escrow status)
- ✅ Tabla `messages` (chat)
- ✅ Tabla `favorites`
- ✅ Tabla `waitlist`
- ✅ Tabla `admin_users` (RLS)
- ✅ Triggers updated_at
- ✅ Storage buckets: `cleaner-photos` (public), `cleaner-kyc` (private) — CREADOS pero sin uso real

---

## 🟡 LO QUE EXISTE PERO ES MOCK / NO REAL

| Feature | Estado actual |
|---------|---------------|
| KYC docs upload | UI simulada, no sube archivos reales a Storage |
| Profile photo | Solo iniciales o dataURL local, no sube a Storage |
| Booking system | Tabla en DB, pero no hay UI para crear bookings |
| Pagos | Sin Stripe — modelos definidos pero código no escrito |
| Chat | Tabla en DB, UI vacía con empty state |
| Reviews | Tabla en `bookings` con rating, no se muestra agregado en cleaner |
| Maps real | Mockup grid con dots, no Google Maps |
| Email notifications | Solo email de verificación, no transaccionales |
| Push notifications | No implementado |
| Recover password | No implementado |

---

## 🔴 LO QUE FALTA POR COMPLETO

### Bloqueado por mí (Antonio):
1. **Stripe Connect** — necesito crear cuenta + API keys
2. **Resend SMTP** — email custom desde noreply@getcleaners.nl
3. **Google Maps API key** — para mapa real
4. **Push notifications API** (Firebase / Web Push)

### Bloqueado por features previas:
- **Reviews UI** → necesita bookings reales primero
- **Search/filter cleaners** → necesita >10 cleaners reales en DB

### Listo para implementar en cualquier momento (Claude):
- Recover password flow
- Profile photo upload a Storage real
- KYC docs upload a Storage real
- Booking system request-only (sin pago)
- PWA installable
- Analytics setup (Plausible)
- SEO improvements (Schema.org)
- Multi-idioma (EN, ES)

---

## 🔧 Configuración técnica clave

### Supabase
- **URL**: `https://xrbvqasfdxaoomorapcm.supabase.co`
- **Anon key**: en `config.js` (público, OK)
- **Service role key**: NO está en cliente, solo en Supabase dashboard

### Vercel
- Repo: GitHub (nombre del repo conocido por Antonio)
- Framework: `null` (static)
- Output directory: `.`
- Auto-deploy en push a `main`

### Mijndomein DNS
- A record: `getcleaners.nl` → `216.198.79.1`
- CNAME: `www` → `<unique-id>.vercel-dns-017.com.` (con punto final)

### Variables en `config.js`
```js
SUPABASE_URL: 'https://xrbvqasfdxaoomorapcm.supabase.co'
SUPABASE_ANON_KEY: 'eyJ...'  // ya tiene el real
SITE_URL: 'https://getcleaners.nl'
CONTACT_EMAIL: 'info@getcleaners.nl'
```

---

## 📐 Brand specs (LOCKED)

### Colors
```css
--navy:   #0C1420;
--blue:   #1A56DB;
--blueh:  #1648c0;
--bluel:  #EFF6FF;
--ink:    #0A0F1C;
--muted:  #64748B;
--bg:     #F8FAFC;
--green:  #10B981;
--gold:   #F59E0B;
--red:    #DC2626;
```

### Fonts
- Display/Body: **Plus Jakarta Sans** (weights 300-800)
- Serif accent: **Instrument Serif** (regular + italic)
- Both via Google Fonts

### Logo
- 4-point star ✦ con gradient azul (`#3B82F6` → `#1A56DB`)
- SVG symbol IDs: `#STAR` (con gradient) y `#STARW` (blanco para fondos oscuros)
- Wordmark "cleaners" SIEMPRE con `translate="no"`

### Voice
- Trust-first
- Premium (Apple/Stripe/Linear vibes)
- No exclamation marks excesivos
- No emoji en headers
- Dutch UI siempre

---

## 🗂️ Decisiones de modelo (LOCKED)

### Comisión y fees
- Platform fee: **15%**
- Customer total fee: **18%** (15% + ~3% Stripe)
- Cleaner ve su precio NETO sin descuentos
- Customer ve "Service fee" desglosado

### Refund policy
| Tiempo | Cliente | Cleaner |
|--------|---------|---------|
| >24h antes | 100% refund | 0€ |
| 12-24h antes | 50% refund | 50% (compensación) |
| <12h antes | 0% refund | 100% |
| Cleaner no-show | 100% refund | 0€ + strike |
| Cleaner cancela | 100% refund | 0€ + strike |
| 3 strikes | — | Suspendido 30 días |

### Capture method
- **Charge immediate** at booking (no auth holds)
- Razón: más barato, no auth expiry (cards expiran auth en 7 días)
- Refund manual via Stripe API según policy

### Payouts a cleaners
- Stripe Connect Direct Charges
- Express accounts (KYC automático)
- Payout: lunes semanal automático
- Platform NUNCA toca el dinero del cleaner

---

## 🌍 Cuentas y servicios externos

| Servicio | Estado | Owner |
|----------|--------|-------|
| Vercel | ✅ Conectado a GitHub | Antonio |
| Mijndomein | ✅ DNS configurado | Antonio |
| Supabase | ✅ Project activo | Antonio |
| GitHub | ✅ Repo activo | Antonio |
| Stripe | ⏳ Por crear | Antonio (pendiente) |
| Resend | ⏳ Por crear | Antonio (pendiente) |
| Google Maps | ⏳ Por crear | Antonio (pendiente) |
| KvK / BTW | ⏳ Por gestionar | Antonio (legal) |
| Seguros | ⏳ Por contratar | Antonio (legal) |

---

## 📈 Métricas de progreso (auto-tracking)

- Líneas de código aprox: ~10,000 LOC
- Archivos HTML: 5 (index, admin, 2 dashboards, cleaner-signup)
- Tablas Supabase: 7
- Storage buckets: 2
- Email templates: 1 corporativo
- RLS policies: 15+

---

## 🎬 Estado de mí (Antonio)

- Trabajo en mañanas/tardes
- Delego trabajo web a Claude durante el día
- Confío en sus decisiones técnicas
- Prefiero entregas reales no over-discusión
- Le trato como socio
