# 💸 STRIPE CONNECT — Plan completo de pagos

**Decisiones tomadas y por qué.**

---

## ✅ Decisiones finales

| Decisión | Valor | Por qué |
|----------|-------|---------|
| **Procesador** | Stripe Connect (Direct Charges) | Mejor herramienta marketplace del mundo, KYC integrado, iDEAL nativo |
| **Modelo** | Customer-side fee (Airbnb-style) | Cleaner ve 100% de su tarifa, customer ve precio claro, tu nunca tocas el dinero |
| **% comisión platform** | **15%** | Estándar industria (TaskRabbit 15%, Helpling 30%, Uber 25%). Sostenible + competitivo |
| **Stripe fees pasados al customer** | ~3% | Cubre iDEAL/CC + Connect fee sin afectar tu margen |
| **Customer service fee total** | **18%** del precio del cleaner | Sostenible para todos |
| **Cuándo cobrar** | **Inmediato al reservar** | Más barato (no auth expiry), simplifica refunds, lo hace Airbnb |
| **Refund policy** | 24h gratis → 50% → no refund | Estándar industria, protege a ambos |
| **Payout al cleaner** | Lunes semanal automático | Cleaner sabe cuándo cobra, reduce ansiedad |

---

## 💰 Cómo funciona el dinero

### Ejemplo: limpieza de 3 horas a €15/h

```
Cliente paga:        €53.10  (€45 × 1.18)
                       │
                       ▼
                  ┌─────────┐
                  │ STRIPE  │  ← procesa pago vía iDEAL
                  │         │
                  └────┬────┘
                       │ 
        ┌──────────────┴──────────────┬─────────────────┐
        ▼                             ▼                 ▼
  €1.50 Stripe                   €45.00 cleaner    €6.60 cleaners
  (fees iDEAL+Connect)           (su tarifa pura)  (tu comisión)
```

✅ Tu nunca tocas los €53.10
✅ Cleaner recibe €45 directos a su cuenta Stripe Express
✅ Tu plataforma recibe €6.60 automáticamente
✅ Stripe se lleva sus fees por separado

### A nivel fiscal NL

**Para ti:**
- Solo declaras los €6.60 como ingreso
- 21% BTW sobre comisión = €1.39
- Beneficio neto: €5.21

**Para el cleaner:**
- Declara €45 como ingreso (es el merchant)
- Si es ZZP'er bajo KOR (<€20K/año): exento de BTW
- Si está sobre KOR: 21% BTW pero recibe €54.45 (cliente paga extra)

**Para el cliente:**
- Recibe factura del cleaner (no de cleaners.nl)
- Si es empresa: deduce el BTW del cleaner
- Si es particular: paga el precio final tal cual

---

## 🔁 Flujo técnico completo

### Onboarding del cleaner (una sola vez, 5 min)

```
Cleaner se registra en cleaners
        ▼
Llega a su dashboard
        ▼
Ve banner: "Activeer betalingen om aanvragen te ontvangen"
        ▼
Click → redirige a Stripe Express onboarding
        ▼
Stripe le pide:
  - Datos personales (auto desde nuestro perfil)
  - IBAN holandés
  - Foto del DNI (Stripe lo verifica con AI)
  - Selfie (matching automático)
  - KvK number (si es ZZP'er)
        ▼
Stripe aprueba en 1-24h (normalmente <1h)
        ▼
Vuelve a cleaners.nl dashboard
        ▼
Banner cambia: "✓ Verificado. Estás listo para recibir pagos."
        ▼
Su perfil se hace visible para clientes (is_visible=true)
```

### Reserva por parte del cliente

```
Cliente encuentra cleaner → click "Reservar"
        ▼
Modal: fecha, hora, duración, dirección, instrucciones
        ▼
Resumen de precio:
  Tarifa cleaner:    €45.00
  Service fee:       €8.10
  ────────────────────────
  Totaal:            €53.10
        ▼
Click "Naar betaling" → Stripe Checkout
        ▼
Cliente paga con iDEAL (un click) / Apple Pay / Card
        ▼
Booking creada en Supabase con status=confirmed
        ▼
Email automático a ambos (cleaner: "Nueva reserva", cliente: "Bevestigd")
        ▼
24h antes: recordatorio
        ▼
Después del servicio: cliente confirma → cleaner recibe pago
        ▼
Lunes siguiente: payout automático a IBAN del cleaner
```

---

## 📋 Refund policy (mi recomendación)

| Tiempo antes del servicio | Cliente recibe | Cleaner recibe |
|---------------------------|---------------|----------------|
| **>24h** | 100% refund | 0€ |
| **12-24h** | 50% refund | 50% (compensación) |
| **<12h** | 0% refund | 100% |
| **No-show del cleaner** | 100% refund + compensación | 0€ + strike |
| **3 strikes del cleaner** | — | Suspendido 30 días |
| **Cancelación por cleaner** | 100% refund | 0€ + strike |

**Justificación:** estándar industria (Airbnb, Helpling, TaskRabbit usan variantes similares). Protege a ambas partes y reduce no-shows.

---

## 🛠️ Lo que TÚ tienes que hacer (manual, sin código)

### 1. Crear cuenta Stripe (10 min)

1. Ir a **https://stripe.com**
2. Click **"Start now"** → "Sign up"
3. Email + contraseña
4. **País: Netherlands**
5. Verifica tu email
6. Completa el formulario:
   - Tipo de negocio: **Online marketplace** (importante)
   - Industria: Cleaning services / Marketplace
   - KvK number (cuando lo tengas, opcional al principio)
   - Cuenta bancaria (IBAN para recibir tu comisión)
7. **Activa el dashboard** (esto te da una clave de test gratis)

### 2. Activar Stripe Connect (5 min)

1. En el dashboard Stripe → menú izquierdo **"Connect"**
2. Click **"Get started with Connect"**
3. Selecciona **"Marketplace or platform"**
4. Tipo de cuentas conectadas: **"Express"** (KYC automático)
5. Tipo de pagos: **"Direct charges"**
6. País de operación: **Netherlands**
7. Confirma → te genera 2 API keys (test mode):
   - **Publishable key** (`pk_test_...`) → frontend, segura
   - **Secret key** (`sk_test_...`) → backend, SECRETA
8. Copia ambas y guárdalas en un sitio seguro

### 3. Configurar webhook endpoint (después, cuando montemos el backend)

Por ahora no, requiere backend serverless. Lo hacemos en el siguiente paso.

---

## 🗺️ Roadmap de implementación

Vamos por **fases pequeñas y verificables**. Cada fase: 1-2 horas de mi trabajo + 5-15 min tuyos para configurar/probar.

### **FASE 1 — Stripe Express Onboarding del cleaner** (próxima)

Lo que hago yo:
- Botón "Activeer betalingen" en cleaner-dashboard
- Backend serverless en Vercel que crea Express account + onboarding link
- Sección "Verdiensten" muestra saldo Stripe real

Lo que haces tú:
- Crear cuenta Stripe + activar Connect (Pasos 1+2 arriba)
- Copiar las 2 API keys en `config.js` (privada en variable de Vercel, no en GitHub)
- Probar onboarding con tu propia cuenta Stripe

**Resultado:** los cleaners pueden activar pagos. Su perfil se vuelve visible solo cuando KYC pasa.

### **FASE 2 — Booking + Stripe Checkout**

Lo que hago yo:
- Modal de reserva en el perfil del cleaner (fecha/hora/dirección)
- Cálculo del precio: tarifa × horas × 1.18
- Stripe Checkout integrado (modal, no redirect)
- Webhook que confirma booking + envía emails

Lo que haces tú:
- Probar con tu tarjeta (modo test, no se cobra nada)

### **FASE 3 — Webhook + emails transaccionales**

Lo que hago yo:
- Supabase Edge Function como webhook receiver
- Procesa eventos Stripe (payment_succeeded, refund, dispute)
- Actualiza booking status
- Triggers emails vía Resend (que aún no tienes setup)

Lo que haces tú:
- Setup Resend (15 min, lo veremos)

### **FASE 4 — Refund + dashboard cliente**

Lo que hago yo:
- Botón "Annuleer boeking" con lógica de policy
- Mostrar refund status en /client-dashboard
- Historial de pagos para ambos lados

### **FASE 5 — Switch a producción**

Lo que haces tú:
- Activar Stripe en modo Live (1 click)
- Verificar KvK + BTW number completado
- Cambiar las API keys de test a live en Vercel
- Primera transacción real con un amigo/conocido

---

## ⚠️ Lo legal/fiscal — checklist antes de cobrar dinero real

(No bloquea desarrollo, pero **NO factures sin esto**)

- [ ] **KvK registrado** (~€75, 1 hora en https://www.kvk.nl)
- [ ] **BTW number obtenido** (gratis, automático después de KvK)
- [ ] **Cuenta empresarial** (Bunq Business / Knab / ING Zakelijk)
- [ ] **Términos y Condiciones** revisados por abogado holandés (~€500)
- [ ] **Privacy Policy** GDPR-compliant
- [ ] **Aansprakelijkheidsverzekering bedrijven** (~€80/mes con €1M cobertura)
- [ ] **Belastingadviseur** identificado (~€100/mes cuando empieces)

---

## 💡 Por qué este modelo es perfecto para ti

1. **No tocas dinero ajeno** = simplifica fiscal, no necesitas licencia PSP
2. **Stripe maneja KYC del cleaner** = tu no responsable de validar IDs
3. **Stripe maneja disputas** = si hay chargeback, va contra el cleaner directamente
4. **iDEAL nativo** = método #1 en NL, conversión 95%+
5. **Escalable** = funciona con 1 booking o con 10.000/día sin cambios
6. **Internacional** = clientes extranjeros (Airbnb!) pagan con CC sin problema
7. **Fácil de explicar** a inversores futuros (Stripe Connect = standard)

---

## 🚦 Próximo paso

**Cuando me digas que has hecho los pasos 1 + 2 de "Lo que tú tienes que hacer"** (crear cuenta Stripe + activar Connect + obtener API keys), empiezo con la **FASE 1**.

Te avisaré exactamente qué necesito de ti en cada momento.

📌 **Ahora mismo solo necesito:**
1. Confirmes que has leído este plan
2. Crees cuenta Stripe
3. Actives Connect
4. Me digas: "API keys obtenidas, ¿qué hago con ellas?"

Y empiezo. 🚀
