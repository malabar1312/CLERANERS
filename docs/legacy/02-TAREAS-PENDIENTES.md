# ✅ TAREAS PENDIENTES · cleaners

**Última actualización**: 22 mayo 2026

Lista priorizada y accionable. Separada por quién la ejecuta.

---

## 🔥 ACCIÓN INMEDIATA · TUS PENDIENTES (Antonio)

Estas las tienes que hacer tú antes de que Claude pueda seguir.

### Bloqueantes para sesión actual

- [ ] **Ejecutar `admin-setup.sql` en Supabase**
   - Editar línea con tu email real (`TU-EMAIL@EJEMPLO.COM`)
   - SQL Editor → Run
   - Verificar: `SELECT * FROM admin_users;` muestra tu fila

- [ ] **Subir 4 archivos a GitHub**:
   - `index.html` (actualizado con loadRealCleaners)
   - `admin.html` (NUEVO)
   - `cleaner-signup.html` (refactor auth-aware)
   - `cleaner-dashboard.html` (auth gate + status)

- [ ] **Probar end-to-end**:
   - Acceder a `/admin.html` → ves panel
   - Registrarte como cleaner de prueba
   - Aprobarte desde admin
   - Verificar aparición en home

### Bloqueantes para próximas iteraciones

- [ ] **Crear cuenta Stripe** (10 min)
   - https://stripe.com → Sign up
   - País: Netherlands
   - Tipo: Online marketplace

- [ ] **Activar Stripe Connect** (5 min)
   - Tipo cuenta: Express
   - Tipo pagos: Direct charges
   - Copiar `pk_test_...` + `sk_test_...`
   - Compartir keys con Claude para FASE 1

- [ ] **Crear cuenta Resend** (10 min, después de Stripe)
   - https://resend.com → Free tier
   - Verificar dominio `getcleaners.nl` con DNS records
   - Copiar API key
   - Compartir con Claude para integración

- [ ] **KvK + BTW number** (legal, no bloquea desarrollo)
   - Inscribirse en KvK (~€75)
   - BTW number automático
   - Necesario antes de cobrar dinero real

---

## 🚀 TAREAS DE CLAUDE (autónomo)

Cosas que Claude puede hacer sin esperar acción tuya.

### Próxima iteración recomendada

**Opción A: Recover password flow** ⭐ recomendado (alta utilidad, baja complejidad)
- Modal "¿Olvidaste contraseña?" en login
- Email con link de reset
- Página `/reset-password.html`
- Update template Supabase "Reset password"

**Opción B: Profile photo upload a Supabase Storage**
- Botón en cleaner-dashboard "Subir foto"
- Sube a `cleaner-photos` bucket
- Guarda URL en `cleaners.photo_url`
- Auto-aparece en home y dashboard

**Opción C: KYC docs upload a Supabase Storage**
- Reemplaza la simulación actual con uploads reales
- Bucket privado `cleaner-kyc`
- 4 uploads: ID, selfie, VOG, foto de muestra
- Admin puede ver en panel para aprobar

**Opción D: Booking system request-only** (sin pago)
- Modal "Reservar" en cleaner profile
- Crea booking con `status='pending_payment'`
- Cleaner recibe en su dashboard "Aanvragen"
- Cleaner puede aceptar/rechazar
- Sin dinero (esperando Stripe)

### Iteraciones medio plazo

- Real reviews UI (cuando haya bookings reales)
- Real-time chat con Supabase Realtime
- Cleaner availability calendar real (no mockup)
- Search/filter cleaners por hood, precio, servicios
- Cleaner stats en dashboard (jobs, earnings) con datos reales
- Edit profile completo (servicios, idiomas, availability)

### Iteraciones largo plazo

- PWA installable + offline
- Push notifications (Web Push API)
- Multi-idioma (EN, ES) — i18n
- Multi-city (Utrecht, Rotterdam, Den Haag, Eindhoven)
- Blog SEO + landing pages por servicio
- Schema.org structured data
- Sitemap dinámico
- Analytics (Plausible)
- Native app (Expo o PWA)

---

## ⏳ TAREAS BLOQUEADAS (necesitan acción externa)

- ❌ **Stripe integration** → bloqueado en API keys de Antonio
- ❌ **Email transaccionales** → bloqueado en Resend setup
- ❌ **Maps real** → bloqueado en Google Maps API key
- ❌ **Pagos en producción** → bloqueado en KvK + Stripe Live mode
- ❌ **Push notifications** → bloqueado en Firebase setup

---

## 📋 ROADMAP STRIPE (cuando empecemos)

Cuando Antonio tenga las API keys, Claude ejecuta en orden:

### FASE 1 — Express Onboarding
- Botón "Activeer betalingen" en cleaner-dashboard
- Backend serverless en Vercel API Routes
- Express account creation + onboarding link
- Webhook receiver básico
- Cleaner se vuelve `is_visible=true` solo cuando Stripe pasa KYC

### FASE 2 — Booking Checkout
- Modal de reserva en cleaner profile
- Cálculo precio: `cleaner_rate × hours × 1.18`
- Stripe Checkout integrado (modal, no redirect)
- `application_fee_amount` = 15% + ~3% Stripe
- Booking en `status='confirmed'` después de pago

### FASE 3 — Webhooks + Notifications
- Supabase Edge Function como webhook
- Procesa: `payment_succeeded`, `payment_failed`, `refund`, `dispute`
- Triggers emails via Resend
- Update booking status en DB

### FASE 4 — Refund + Cliente Dashboard
- Botón "Annuleer boeking" con lógica de policy
- Show refund status en client-dashboard
- Historial de pagos en ambos dashboards
- Stripe portal link para cleaner ver sus payouts

### FASE 5 — Live Mode
- Verificar KvK + BTW completo
- Cambiar API keys de test a live en Vercel env
- Primera transacción real con conocido
- Monitoring + alertas

---

## 🎯 Prioridad recomendada (Claude decide cuando vuelva Antonio)

Si Antonio no especifica, Claude debe sugerir:

1. **¿Antonio subió cambios pendientes?** → primero validar eso
2. **¿Antonio tiene cuenta Stripe creada?** → FASE 1 Stripe
3. **Si NO Stripe**: Opción A (Recover password) o B (Profile photo)
4. **Si recover password + photo ya hechos**: Opción D (Booking sin pago)

---

## 📊 Métricas de éxito (qué validar)

Para considerar el MVP "listo para invitar amigos como cleaners":

- [ ] Antonio se registra como cleaner exitosamente
- [ ] Aparece en `/admin.html` como pending
- [ ] Antonio se aprueba a sí mismo desde admin
- [ ] Aparece en home como cleaner real
- [ ] Sube foto de perfil (necesita Storage upload)
- [ ] Sube KYC docs (necesita Storage upload)
- [ ] Recibe primera "reserva" de prueba (necesita booking system)

Para considerar listo para clientes reales:

- [ ] Todo lo anterior
- [ ] Stripe integrado y testado
- [ ] Resend funcionando con noreply@getcleaners.nl
- [ ] Recover password funcional
- [ ] 5+ cleaners aprobados reales
- [ ] Términos y Condiciones revisados por abogado
- [ ] Seguro de responsabilidad civil contratado
- [ ] BTW number activo

---

## 🔄 Cómo añadir nuevas tareas

Si Antonio quiere añadir algo:
- "Añade X a tareas pendientes" → Claude actualiza este archivo
- "Quita X de pendientes" → Claude la mueve a una sección "Completadas"

Si Claude termina algo:
- Mueve la línea de "Pendientes" a "Completadas" (al final del archivo)
- Actualiza fecha del header
