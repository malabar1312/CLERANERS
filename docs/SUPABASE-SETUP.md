# Supabase — setup (C1) · paso a paso

Esto conecta la base de datos real. Desbloquea:
- **P1** — los emails de la wachtlijst se **guardan** de verdad.
- **P5** — las reservas pagadas se **persisten** (el webhook de Stripe es la fuente de verdad).

Es **gratis** (plan free de Supabase). No toca KvK ni Stripe live.

---

## 1. Crear el proyecto (2 min)

1. Entrá a **https://supabase.com** → *Start your project* → logueate (GitHub o email).
2. *New project*:
   - **Name:** `cleaners`
   - **Database Password:** generá una fuerte y **guardala** (la vas a necesitar si usás el CLI; para esto no hace falta).
   - **Region:** `West EU (Ireland)` o `Frankfurt` (cerca de NL).
3. *Create new project* → esperá ~2 min a que se provisione.

---

## 2. Correr el SQL (1 min)

1. En el proyecto: menú izquierdo → **SQL Editor** → *New query*.
2. Abrí el archivo **`supabase/schema.sql`** de este repo, copiá **todo**, pegalo.
3. *Run* (▶, abajo a la derecha). Tenés que ver **"Success. No rows returned"**.

Eso crea `waitlist`, `bookings` y `webhook_events` con RLS. Es idempotente (lo podés re-correr sin romper nada).

---

## 3. Copiar las 3 claves

Menú izquierdo → **Project Settings** (la rueda) → **API**. Copiá:

| En el dashboard | Va en `.env.local` como |
|---|---|
| **Project URL** (`https://xxxx.supabase.co`) | `NEXT_PUBLIC_SUPABASE_URL` |
| **Project API keys → `anon` `public`** | `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| **Project API keys → `service_role` `secret`** ⚠️ | `SUPABASE_SERVICE_ROLE_KEY` |

> ⚠️ La **`service_role`** es secreta (acceso total, bypassa RLS). Solo va en `.env.local` (que **nunca** se sube a git). Si se filtra, la rotás desde el mismo panel.

---

## 4. Pegarlas en `apps/web/.env.local`

Si el archivo no existe, copiá `apps/web/.env.example` → `apps/web/.env.local`.
Rellená estas tres líneas (las de Stripe ya están):

```bash
NEXT_PUBLIC_SUPABASE_URL=https://TU-PROYECTO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...        # anon public
SUPABASE_SERVICE_ROLE_KEY=eyJ...            # service_role secret
```

(O pasámelas a mí y las escribo yo en `.env.local`.)

---

## 5. Reiniciar y probar

```bash
pnpm dev
```

- **Wachtlijst:** en el hero, dejá un email → ahora se guarda. Verificalo en Supabase → **Table Editor → waitlist**.
- **Reserva:** "Boek nu" → pagá con la tarjeta de test `4242 4242 4242 4242`. Para que la fila aparezca en `bookings` necesitás el webhook (paso 6).

---

## 6. (Opcional, para test local de reservas) Webhook de Stripe

El webhook es lo que persiste la reserva tras el pago. Para probarlo en local:

```bash
stripe login
stripe listen --forward-to localhost:3000/api/webhook/stripe
```

El CLI imprime un `whsec_...` → ponelo en `.env.local` como `STRIPE_WEBHOOK_SECRET=whsec_...` y reiniciá `pnpm dev`.
Pagá una reserva de test → mirá **Table Editor → bookings** (status `paid`).

En **producción** (cuando toque): Stripe Dashboard → Developers → Webhooks → endpoint `https://getcleaners.nl/api/webhook/stripe`, eventos `checkout.session.completed`, `charge.refunded` → copiás el signing secret a las env vars de Vercel.

---

## Qué queda para después (no ahora)
- **Auth real** (login/registro) — C2/C3.
- **Cleaners y reviews reales** en DB (hoy mock) — C4/C7. Esto es lo que respalda los trust panels (P3) y las reviews verificadas (P4).
- `cleaner_id` pasará de TEXT a UUID + FK cuando existan cleaners reales.
