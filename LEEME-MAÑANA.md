# ☀️ Buenos días, Antonio — resumen de la noche

Trabajé en `cleaners-deploy-v6/` (dejé `v5` intacta como respaldo). Esto es lo que hice,
qué quedó probado, y **los pasos que solo vos podés hacer** (necesitan tus cuentas).

---

## ✅ Hecho y VALIDADO (Playwright + Chrome, consola sin errores)

**Bugs de frontend arreglados en `v6/index.html` + `v6/cleaner-dashboard.html`:**
1. **Foto de portada del perfil coherente** — antes "Maria C." (mujer) tenía de portada un hombre. Ahora la portada usa la foto del propio cleaner → nunca hay mismatch ni imágenes rotas.
2. **Transparencia de precio en el checkout** — antes mostraba un total plano sin tu fee. Ahora desglosa: **Subtotaal €48 · Servicekosten (18%) €8,64 · Totaal €56,64** (verificado en vivo). Además la **superficie ahora define las horas** (≤50m²→2u, 50-80→3u, 80-120→4u, 120+→5u) y el total recalcula.
3. **Fecha mínima del checkout = mañana** (antes permitía hoy mismo).
4. **Fecha de próximo pago dinámica** en Verdiensten — antes decía "vrijdag 22 mei" (¡vencida!). Ahora calcula el próximo viernes real.
5. **Números consistentes** — "Klussen (maand)" coincidía mal (home 12 vs earnings 28). Unificado a 28.

Validación: hero coherente ✓ · desglose €48/€8,64/€56,64 ✓ · **0 errores de consola** ✓ · handlers intactos.

---

## 📦 Escrito y LISTO para desplegar (no pude deployar: necesita tus claves)

Carpeta `v6/backend/`:
- `supabase/migrations/0001_payments.sql` — columnas de pago en `bookings` + tablas `payments`, `idempotency_keys`, `webhook_events` + **RLS**. Idempotente.
- `supabase/functions/create-checkout/` — Stripe Checkout (Connect): cobra **cleaner + 18%**, retiene **15%** de comisión, crea booking `pending`. Con idempotencia.
- `supabase/functions/stripe-webhook/` — **verifica firma + raw body + anti-replay**, marca booking `paid`/escrow, registra pago.
- `supabase/functions/refund/` — reembolso admin (revierte cargo + transferencia + comisión).
- `.env.example` — todas las variables.
- `frontend-integration/pago.js` + `README.md` — puente del frontend + patch exacto de `doPayment()` para cobrar de verdad (aditivo, no rompe el demo).
- `SETUP-STRIPE.md` — **guía paso a paso** + checklist a producción.

Seguridad estilo PagoKit: claves solo en env, webhook firmado, idempotencia con UUID, raw body, service_role solo en el servidor.

---

## 🔒 Lo que SOLO vos podés hacer (necesita tus cuentas — ~30-45 min)
Seguí `v6/backend/SETUP-STRIPE.md`. Resumen:
1. Crear cuenta **Stripe** + activar **Connect (Express)** → copiar `sk_test_…`.
2. Correr el **SQL** en Supabase.
3. `supabase secrets set` con las claves + `supabase functions deploy` (las 3).
4. Crear el **webhook** en Stripe → copiar `whsec_…`.
5. Incluir `pago.js` + aplicar el patch de `doPayment` (ver `frontend-integration/README.md`).
6. Probar con tarjeta `4242 4242 4242 4242`.
7. Pushear `v6/` a GitHub → Vercel deploya.

> No pude hacer esto yo porque son **tus credenciales** (Stripe, login de Supabase, GitHub/Vercel), no permisos del entorno.

---

## ⏳ Lo que dejé pendiente a propósito (para no romper a ciegas)
- **Mapa de resultados** ("Google Maps API-sleutel vereist"): hay que poner la API key de Google **o** cambiarlo por el mapa SVG mock que ya existe en el resto del sitio. No lo toqué para no romper el init; lo dejo señalado.
- **Búsqueda por ciudad/fecha**: hoy `doSearch` filtra por *tipo* (funciona), pero ciudad/fecha son decorativos. Mejora menor.
- **Wiring real del booking**: el patch está escrito, pero se activa cuando las cards salgan de Supabase con UUIDs reales (hoy el `DB` es demo 1..8). Detalle en `frontend-integration/README.md`.
- **Onboarding Connect del cleaner** (función `connect-onboard`): Fase 2. Mientras, se puede crear la cuenta Express a mano y guardar `stripe_account_id`.

---

## 🗂️ Carpetas
- `cleaners-deploy-v5/` — refactor visual completo (respaldo, estable).
- `cleaners-deploy-v6/` — **v5 + fixes de bugs + carpeta `backend/`** ← usar esta.

Cuando despiertes lo vemos juntos. Si algo del SQL/funciones no te cuadra con tu esquema real de Supabase, decime y lo ajusto. — Claude
