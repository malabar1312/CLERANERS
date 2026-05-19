# 🗺️ ROADMAP — Próximos pasos

Después de Supabase, esto es lo que sigue. **Por prioridad, no por dificultad.**

---

## ✅ FASE ACTUAL — Supabase Auth

- ✅ Web online en getcleaners.nl
- ✅ Dominio funcionando
- ⏳ **Supabase setup** (lee `SUPABASE-SETUP.md`)
- ⏳ Usuarios reales se registran
- ⏳ Emails reales de verificación
- ⏳ Datos persisten en DB real

**Cuando termines esto avísame y pasamos a Fase 1.**

---

## 🔥 FASE 1 — KYC + Storage de documentos (1-2 días)

Para que las verificaciones funcionen:

### 1.1 Upload real a Supabase Storage
Las tablas/buckets ya están creadas. Falta el JS que sube los archivos en lugar de simular. Te lo hago yo cuando me digas.

### 1.2 Verificación manual (mientras)
- Entras a Supabase → tabla `cleaners`
- Cambias `kyc_status` a `verified`
- Cambias `is_visible` a `true`
- El cleaner aparece automáticamente en la home

### 1.3 KYC automático (cuando crezcas)
Tres opciones cuando tengas volumen:
- **Stripe Identity** (~49€/verificación) — integrado con pagos
- **Onfido** (~5€/verificación) — usado por Revolut/Coinbase
- **Veriff** — opción holandesa

---

## 💰 FASE 2 — Pagos reales con Stripe (3-4 días)

**Sin esto no facturas. CRÍTICO.**

### Lo que hace falta:
1. Crear cuenta Stripe (gratis, solo cobra %)
2. **Stripe Standard** — cobrar al cliente
3. **Stripe Connect Express** — pagar al schoonmaker automáticamente
4. **Escrow** — autorizar pago, capturar solo cuando confirme el cliente
5. Tu plataforma se queda 15-20% automático

**Coste**: 1.4% + €0.25 por transacción. Sin extras.

---

## 🗺️ FASE 3 — Maps real (1 día)

Ahora el mapa es mockup. Para real:

### 3.1 Google Maps
- Cuenta Google Cloud (gratis 200$ crédito/mes)
- Activa Maps JavaScript API
- Copia API key
- Pégalo en `config.js` → `GOOGLE_MAPS_KEY`
- **Gratis hasta ~30.000 cargas/mes**

### 3.2 Pins con cleaners reales
- Query Supabase: cleaners visibles
- Geocoding del stadsdeel → lat/lng
- Pin con foto + precio
- Click → modal del cleaner

### 3.3 Alternativa más estética
**Mapbox** — gratis hasta 50K cargas/mes, mucho mejor diseño.

---

## 💬 FASE 4 — Chat real (2 días)

Actualmente el chat es estático. Para real:

### 4.1 Supabase Realtime
- Incluido en plan gratis
- Mensajes en tabla `messages` (ya creada)
- WebSocket auto-actualiza
- **Gratis hasta 2M mensajes/mes**

### 4.2 Notificaciones
- Mensaje sin leer → email automático (Resend)
- Push notif si tiene PWA instalada
- Badge contador

### 4.3 Adjuntos
- Subir fotos al chat (Supabase Storage)
- Lightbox para ver

---

## 📧 FASE 5 — Emails automáticos (1 día)

Eventos que disparan email:

| Evento | Quién recibe | Cuándo |
|--------|--------------|--------|
| Nueva reserva | Cleaner | Inmediato |
| Reserva aceptada | Cliente | Cuando cleaner acepta |
| Recordatorio 24h | Ambos | 24h antes |
| Pago capturado | Ambos | Después del servicio |
| Solicitud de review | Cliente | 1h después |
| Mensaje sin leer | Receptor | 10 min después |

### Cómo:
- **Resend** (100 emails/día gratis)
- Templates React Email
- Trigger desde **Supabase Edge Functions**

---

## 🔔 FASE 6 — Push notifications (2 días)

### PWA
- Ya tienes `site.webmanifest`
- Falta service worker (cache offline)
- Install prompt en móvil

### Web Push
- API nativa del navegador (gratis)
- Funciona en Android + iOS 16.4+
- Setup: 4-5h

---

## ⭐ FASE 7 — Reviews reales (1 día)

Ahora hardcoded. Para real:
- Trabajo termina → email "Hoe was Sofia?"
- Click → 5 estrellas + texto
- Guarda en `bookings.rating` y `bookings.review_text`
- Trigger calcula media → `cleaners.rating`
- Aparece en perfil

---

## 📱 FASE 8 — App nativa (2-3 semanas)

Cuando tengas 50+ bookings/semana:

### Opción A: PWA (recomendada para start)
- Base ya está con manifest
- Add service worker
- Install prompt
- **0€**

### Opción B: Expo/React Native
- iOS + Android desde mismo código
- $99/año Apple + $25 Google único

---

## 📊 FASE 9 — Analytics + SEO (continuo)

### Tracking
- **Plausible** (~$9/mes, GDPR-compliant)
- O **PostHog** (gratis 1M eventos) con funnel completo
- Events: signup_started, email_verified, profile_completed, first_booking

### SEO
- Blog técnico en `/blog`
- Landing pages: "Airbnb cleaning Amsterdam", "Eco cleaning Amsterdam"
- Schema.org markup (LocalBusiness)

### Ads
- **Solo CUANDO conversión >2%**
- Google Ads: "schoonmaakster Amsterdam"
- Meta Ads: lookalike de tus primeros 100 usuarios

---

## 🌍 FASE 10 — Expansión

### Multi-idioma
- Ya en holandés
- Añadir inglés (50% expats) + español (turistas)
- Next.js i18n routing

### Otras ciudades NL
- Utrecht, Rotterdam, Den Haag, Eindhoven
- URLs `/utrecht`, `/rotterdam`, etc.

### Bélgica
- `cleaners.be` con holandés + francés

---

## ⚠️ LEGAL — Antes de facturar dinero real

### Empresarial:
- [ ] Inscribir **KvK** (Kamer van Koophandel) — €75 una vez
- [ ] Conseguir **BTW number**
- [ ] Cuenta empresa: **Bunq Business**, Knab, ING Zakelijk

### Legal:
- [ ] **Términos y Condiciones** revisados por abogado holandés (~€500)
- [ ] **Privacy Policy GDPR** (no la genérica, hecha para tu negocio)
- [ ] Stripe = AML-compliant ✓

### Schoonmakers:
- [ ] Decidir status: **ZZP** (autónomos) vs **werknemer**
- [ ] Consulta con **belastingadviseur**
- [ ] Si ZZP: cada uno con su propia KvK

### Seguros:
- [ ] **Aansprakelijkheidsverzekering bedrijven** (~€80/mes, cobertura €1M)
- [ ] Bedrijfsverzekering para platform

---

## 🎯 PRIORIDAD HONESTA

### Esta semana:
1. ✅ **Supabase setup** (estás aquí)
2. **Conseguir 3 schoonmakers reales** dispuestas a probar
3. Activarles cuenta manual desde Supabase

### Próximas 2 semanas:
4. **Stripe payments**
5. **Upload de fotos KYC** a Supabase Storage
6. Verificación manual desde admin

### Mes 2:
7. **Maps real**
8. **Chat real** con Supabase Realtime
9. **Emails automáticos**
10. Primeros 10 bookings reales

### Mes 3:
11. Tracking + optimización
12. PWA / app nativa
13. Ads cuando conversión sólida

---

## 💰 INVERSIÓN

### Bootstrap (mes 1-3):
| Item | Coste |
|------|-------|
| Vercel | 0€ |
| Supabase Free | 0€ |
| Stripe | 1.4% transacción |
| Resend | 0€ hasta 3K emails |
| Dominio | 10€/año |
| KvK | 75€ una vez |
| **Total fijo/mes** | **~10€** |

### Escalando (mes 4+):
| Item | Coste |
|------|-------|
| Vercel Pro | $20/mes |
| Supabase Pro | $25/mes |
| Stripe Identity (KYC) | €49/verif |
| Plausible | $9/mes |
| Resend Pro | $20/mes |
| Seguro empresa | €80/mes |
| **Total fijo/mes** | **~€150** |

---

## 📞 ¿POR DÓNDE EMPIEZO?

**Honestamente:**

1. **Hoy/mañana**: termina `SUPABASE-SETUP.md`
2. **Esta semana**: contacta 3-5 schoonmakers por LinkedIn/boca a boca
   - "Hola, soy [tu nombre], lanzando plataforma en Amsterdam donde TÚ eliges precio, horarios y clientes. ¿Te interesa probar gratis?"
3. **Próxima semana**: cuando tengas 3 schoonmakers + 1 cliente registrado, vamos a Stripe

**El código no es el cuello de botella. La gente real sí.**

Cuando tengas:
- 3 schoonmakers reales
- 1 cliente listo para reservar

Ahí sí toca Stripe. Antes, es prematuro.

🚀 **Vamos paso a paso.**
