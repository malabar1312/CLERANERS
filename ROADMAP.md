# 🗺️ ROADMAP — cleaners

Lo que haría yo, en orden de impacto, para llevar este MVP a un producto real.

---

## 🚦 FASE 0: ARREGLOS URGENTES (ya hechos)
- ✅ Bug del chat en perfiles
- ✅ Calculadora de precio
- ✅ Botón WhatsApp
- ✅ Logo más grande
- ✅ Persistencia bookings en localStorage
- ✅ Persistencia worker profiles en localStorage
- ✅ Modal "Mijn boekingen" con histórico

---

## 🔥 FASE 1: CIERRA EL LOOP DE NEGOCIO (1-2 semanas)
*Sin esto no puedes facturar.*

### 1.1 Backend real
**Por qué**: Hoy todo es localStorage. Si el usuario borra cookies, pierde todo.
- [ ] Conectar el `cleaners-backend/` que ya está hecho (Supabase + Stripe + Resend)
- [ ] Migrar localStorage → Supabase
- [ ] Auth real con Supabase Auth (Google + Apple + email)
- [ ] **Coste**: 0€ hasta cierto tráfico

### 1.2 Pago real
**Por qué**: Sin esto no cobras.
- [ ] Activar Stripe en modo Live
- [ ] Stripe Connect Express para que cada schoonmaker reciba pagos
- [ ] Escrow funcionando: pago retenido → schoonmaker cobra al confirmar
- [ ] Webhook que actualiza estado del booking
- [ ] **Coste**: 1.4% + €0.25 por transacción

### 1.3 Onboarding KYC real
**Por qué**: Es tu diferenciador "platform de confianza".
- [ ] Integrar **Stripe Identity** (49€/verificación) o **Onfido**
- [ ] Subida real de pasaporte + selfie
- [ ] Verificación VOG manual (recibís email cuando alguien sube)
- [ ] Solo activar perfil cuando KYC pase
- [ ] **Tiempo dev**: 3-4 días

### 1.4 Email transaccional
**Por qué**: Sin emails de confirmación se pierde gente.
- [ ] Conectar Resend (ya configurado en backend)
- [ ] Templates: Boeking bevestigd, Reminder 24h, Boeking voltooid, Review request, Worker accepted/rejected
- [ ] **Coste**: gratis hasta 3.000/mes

### 1.5 Notificaciones push
**Por qué**: Engagement crítico para marketplaces.
- [ ] PWA con service worker (ya tienes manifest)
- [ ] Web push para schoonmakers cuando llega oferta
- [ ] **Coste**: 0€

---

## 💎 FASE 2: CONVERSIÓN (1 semana)
*Esto sube CTR/conversión 20-40%.*

### 2.1 Promo primera reserva
- [ ] Banner "Primera limpieza con -20%" muy visible
- [ ] Código de cupón en URL: `cleaners.nl/?promo=WELKOM20`
- [ ] Auto-aplicación al checkout

### 2.2 Filtro de disponibilidad
- [ ] "Hoy" / "Mañana" / "Esta semana" buttons en search
- [ ] Solo mostrar schoonmakers disponibles en esa ventana
- [ ] Vincular con calendarios reales (cuando esté backend)

### 2.3 Búsqueda más inteligente
- [ ] Autocomplete de Ámsterdam con Google Places API
- [ ] Detectar geolocation y centrar mapa
- [ ] "Schoonmakers en mijn buurt" como filtro rápido

### 2.4 Más schoonmakers
- [ ] La DB tiene 8. Para parecer marketplace real necesitas 30+
- [ ] Idealmente: schoonmakers reales que onboardees vos
- [ ] Mientras tanto: aumenta la DB demo a 20-25

### 2.5 Compatibility score real
- [ ] El % de match es estático. Hacerlo dinámico:
  - Distancia
  - Idiomas en común
  - Servicios que coincidan
  - Historial de booking (si repite cliente)

### 2.6 Reviews fotos
- [ ] Permitir subir foto en reviews (Cloudinary o Supabase Storage)
- [ ] Reviews con foto convierten 3x más

---

## 📱 FASE 3: MÓVIL NATIVO (2-3 semanas)
*Los marketplaces premium tienen app.*

### 3.1 PWA optimizada
- [ ] Service worker para cache offline
- [ ] Install prompt cuando entran desde móvil
- [ ] Splash screen con branding
- [ ] **Ya tienes** manifest.json — falta el resto

### 3.2 App nativa real
- [ ] **Expo** (React Native) — comparte código con web
- [ ] iOS + Android desde el mismo codebase
- [ ] App Store + Google Play submission (~7 días review)
- [ ] **Coste**: 99$/año Apple + 25$ una vez Google

---

## 🌍 FASE 4: I18N + EXPANSIÓN (2 semanas)
*Crecer fuera de Ámsterdam.*

### 4.1 Multiidioma completo
- [ ] Migrar HTML estático al proyecto Next.js i18n que tienes en `cleaners-web/`
- [ ] Activar EN + NL + ES
- [ ] Hreflang, sitemaps multilingüe (ya configurado)

### 4.2 Multi-ciudad
- [ ] Utrecht, Rotterdam, Den Haag, Eindhoven
- [ ] URL por ciudad: `cleaners.nl/amsterdam`, `cleaners.nl/utrecht`
- [ ] Schoonmakers filtrados por ciudad
- [ ] SEO por ciudad (landing pages diferenciadas)

### 4.3 Expansión Bélgica
- [ ] `cleaners.be` con Flamenco + Francés
- [ ] Brussels + Antwerp + Gent

---

## 📊 FASE 5: ANALYTICS + GROWTH (continuo)

### 5.1 Tracking
- [ ] **PostHog** o **Mixpanel** para eventos
- [ ] Funnel: home → search → click profile → start checkout → complete
- [ ] Identify cuellos de botella

### 5.2 SEO
- [ ] Blog técnico "Schoonmaaktips voor Airbnb hosts"
- [ ] Landing pages por servicio: "Airbnb cleaning Amsterdam"
- [ ] Schema.org markup (LocalBusiness, Service)
- [ ] Backlinks: NRC, Quote, TechCrunch (cuando tengas tracción)

### 5.3 Referrals
- [ ] "Invita un amigo, recibe €15 ambos"
- [ ] Unique referral link por usuario
- [ ] Tracked en Supabase

### 5.4 Email marketing
- [ ] Mailchimp/Beehiiv
- [ ] Newsletter mensual con tips + promos
- [ ] Re-engagement: usuarios inactivos 30+ días

---

## 🤖 FASE 6: AI / DIFERENCIACIÓN (visión)

### 6.1 Match AI
- [ ] Algoritmo que recomienda schoonmaker ideal según:
  - Historial de bookings
  - Reviews que dejó
  - Preferencias (eco, pets, alergias)
- [ ] Embedding-based recommendation

### 6.2 Chat asistente
- [ ] Bot que responde preguntas frecuentes 24/7
- [ ] Te ayuda a elegir entre 2-3 schoonmakers
- [ ] Powered by Claude API (yo, hola 👋) o GPT-4

### 6.3 Estimación visual
- [ ] Subes foto de tu casa → AI estima superficie + tipo de limpieza necesaria
- [ ] Cotización instantánea

---

## 💼 FASE 7: B2B SERIO (cuando tengas revenue)

### 7.1 Hotel partnerships
- [ ] El tab "Voor bedrijven" ya está
- [ ] Faltan: contratos templates, SLA, API real
- [ ] Sales pipeline (HubSpot/Pipedrive)

### 7.2 Property managers
- [ ] Integración con sistemas PMS (Mews, Cloudbeds)
- [ ] Auto-trigger schoonmaak al check-out
- [ ] Volumen 100+ schoonmakas/mes

### 7.3 Subscription Enterprise
- [ ] Plan empresa con dashboard avanzado
- [ ] Multi-user (varios managers en una cuenta)
- [ ] Facturación mensual consolidada

---

## ⚖️ FASE 8: LEGAL + COMPLIANCE (antes de escalar)

### 8.1 Legal essentials
- [ ] KvK registrada (Kamer van Koophandel)
- [ ] BTW number
- [ ] Términos revisados por abogado holandés
- [ ] Privacy policy AVG-compliant (no genérica)
- [ ] DPA con Supabase, Stripe, Resend (todos GDPR-ready)

### 8.2 Schoonmakers status
- [ ] Holanda: schoonmakers serían **ZZP** (autónomos) o **werknemer**
- [ ] Marketplace approach = ZZP, pero hay riesgos legales si trabajan exclusivo para tí
- [ ] Consulta con belastingadviseur

### 8.3 Verzekering platform
- [ ] No es tu seguro personal — necesitas póliza para el platform
- [ ] Aansprakelijkheidsverzekering bedrijven (B2B)
- [ ] ~50-100€/mes con cobertura €500K

---

## 🎯 PRIORIDAD REALISTA SI TIENES 1 MES

Si tuvieras que elegir SOLO 5 cosas para hacer este mes:

1. **Backend real con Supabase** — sin esto no escalas
2. **Stripe pagos funcionando** — sin esto no facturas
3. **Onboarding KYC real** — sin esto no eres "trust platform"
4. **20 schoonmakers reales** — outreach manual a profesionales
5. **Tracking analytics** — sin esto no sabés qué optimizar

---

## 💰 INVERSIÓN ESTIMADA

### Bootstrap (mes 1-3):
- Vercel: 0€
- Supabase Free: 0€
- Stripe: solo % por transacción
- Resend Free: 0€
- Dominio: ~10€/año
- Stripe Identity (KYC): 2-3€ por verificación
- **Total**: ~50-100€/mes

### Growth (mes 4-12):
- Vercel Pro: $20/mes
- Supabase Pro: $25/mes
- Resend Pro: $20/mes
- Mailchimp: $20/mes
- Analytics (Plausible o PostHog Pro): $25/mes
- Google Ads/Meta Ads (cuando ready): $500-2000/mes
- **Total**: $300-2500/mes según ads

### Equity-stage:
- Equipo: 2-3 devs + 1 designer + 1 ops manager
- Office Amsterdam: 1000-2000€/mes
- Legal counsel mensual: 500€
- **Total**: 15-30K€/mes con team

---

## 🎬 PRÓXIMO PASO SUGERIDO

Mi sugerencia HONESTA como socio:

**Esta semana:**
1. Lanza con el HTML estático actual + dominio propio (1-2h)
2. Configura WhatsApp Business para `+31 6 XX XX XX XX` (gratis)
3. Outreach manual a 5-10 schoonmakers reales para tener inventario
4. Pon Google Analytics para empezar a medir
5. Crea cuentas profesionales en LinkedIn + Instagram

**Próximas 2-3 semanas:**
6. Empieza a desarrollar el backend real
7. Stripe en modo Test mientras desarrollas
8. Diseña el flow de KYC en Stripe Identity

**Mes 2:**
9. Lanzamiento "real" con backend funcional
10. Primeros 10 bookings reales (focus en conversión)

**Mes 3+:**
11. Scale: ads, SEO, content
12. App móvil

---

¿Empezamos por el backend o por outreach a schoonmakers? Yo iría por **outreach primero** — sin inventario, no hay marketplace. El código se construye en paralelo.
