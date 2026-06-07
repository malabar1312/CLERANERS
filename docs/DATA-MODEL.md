# DATA-MODEL.md — cleaners (BETA)

> Fuente de verdad del schema. Refleja el estado real del código tras AUTO-CYCLES 1-4.
> Mantener sincronizado cuando se ejecute una migration o se agregue una entidad nueva.

---

## Estado actual (Auto-cycles 1-4 integrados)

```
                ┌─────────────────┐
                │   auth.users    │  (Supabase Auth — read-only desde nuestro código)
                │  id (uuid PK)   │
                │  email          │
                │  raw_user_meta  │  → { full_name, role }
                └────────┬────────┘
                         │ trigger on_auth_user_created
                         ▼
                ┌─────────────────────────────────┐
                │           profiles              │  RLS: own_select, own_update (role immutable)
                │  id (uuid PK, FK auth.users)    │
                │  role (enum: customer|cleaner|admin)
                │  first_name, last_name, phone   │
                │  avatar_url                     │
                │  created_at, updated_at         │
                └─────────────────────────────────┘
                         │ (linked via client_user_id)
                         ▼
   ┌───────────────────────────────────────────────────┐
   │                  bookings                         │  RLS: own_select (by user_id OR email)
   │  id (uuid PK)                                     │  INSERT/UPDATE solo service-role
   │  reference (text unique)                          │
   │  stripe_session_id, payment_intent_id             │
   │  cleaner_id (text — slug del mock o slug real)    │
   │  client_user_id (uuid, nullable)                  │  ← linkea cuando hay login
   │  client_email, client_name                        │
   │  scheduled_date, scheduled_time, frequency        │
   │  m2, hours                                        │
   │  subtotal_cents, fee_cents, total_cents, currency │
   │  status (enum: pending|paid|refunded|canceled|completed)
   │  street, postcode, city, notes                    │  ← AUTO-CYCLE 1
   │  created_at, updated_at                           │
   └───────────────────────────────────────────────────┘
                         │ event.id dedupe
                         ▼
                ┌─────────────────┐
                │ webhook_events  │  Idempotencia del webhook de Stripe (anti-replay)
                │ id (text PK)    │
                │ type, received  │
                └─────────────────┘

   ┌───────────────────┐         ┌───────────────────┐
   │     favorites     │         │ contact_messages  │
   │ client_user_id    │         │ (form /contact)   │
   │ cleaner_id        │         └───────────────────┘
   └───────────────────┘
   ┌───────────────────┐
   │     waitlist      │
   │ email, locale,    │
   │ source            │
   └───────────────────┘
```

---

## Decisiones de diseño (LOCKED — registradas en cycle 1+2)

| Decisión | Valor | Razón |
|---|---|---|
| Cleaner ID público | **slug** (ej. `sofia-r`) | SEO-friendly + estable + clean URLs |
| Cleaner ID interno | **UUID** (en cleaner_profiles cuando exista) | FK estable, renombrable |
| Pricing | `cleaner_profiles.price_per_hour` editable | cleaner libre de su tarifa |
| Availability | **Sin tabla** — cleaner acepta/rechaza booking | Cleaner totalmente libre de su horario |
| Beta badge | Solo en `/aanmelden/schoonmaker` (futuro) | Público mantiene landing premium |
| Role | Trigger DB valida + autopopulate; immutable desde client | Anti escalation; bypass solo con service-role |
| Booking IDs | UUID determinista desde idempotencyKey hash | Re-submit del mismo payload → misma fila |
| Reference | `BK-${id.slice(-8).toUpperCase()}` | Legible; consistente DB ↔ UI |
| Address | Persistida en `bookings`, NO en Stripe metadata | Privacy + truth-source único |
| Webhook source of truth | Stripe signature + `event.id` dedupe + UPDATE by booking_id | Anti-spoof + anti-replay |

---

## State machine — bookings.status

```
        ┌──────────┐
        │ pending  │  ← Server Action createBookingCheckout (pre-Stripe insert)
        └────┬─────┘
             │ webhook checkout.session.completed
             ▼
        ┌──────────┐
        │   paid   │  ← stripe_session_id + payment_intent_id seteados
        └────┬─────┘
             │
             ├─ webhook charge.refunded
             ▼
        ┌──────────┐
        │ refunded │
        └──────────┘

   Estados futuros (no implementados):
        accepted   ← cleaner acepta el booking
        rejected   ← cleaner rechaza (gatilla refund vía Connect)
        in_progress ← día/hora de inicio
        completed  ← cleaner marca como hecho
        reviewed   ← customer dejó review
```

CHECK constraint actual (AUTO-CYCLE 6) permite: `pending`, `paid`, `accepted`, `rejected`, `in_progress`, `completed`, `reviewed`, `refunded`, `canceled`. Webhook hoy solo setea `paid` y `refunded`; los demás requieren UI/cron (cycles futuros).

---

## Triggers vivos

| Trigger | Tabla | Cuándo | Qué hace |
|---|---|---|---|
| `on_auth_user_created` | `auth.users` | AFTER INSERT | Crea fila en `profiles` con role validado (customer/cleaner; admin nunca por signup) y `first_name` desde meta. |
| `profiles_set_updated_at` | `profiles` | BEFORE UPDATE | Setea `updated_at = now()` |
| `profiles_role_immutable` | `profiles` | BEFORE UPDATE | Rechaza cambio de `role` si la sesión no es service_role |
| `bookings_set_updated_at` | `bookings` | BEFORE UPDATE | Setea `updated_at = now()` |

---

## RLS policies vivas

| Tabla | Operation | Política | Quién |
|---|---|---|---|
| `waitlist` | INSERT | `with check (true)` | anon + authenticated |
| `waitlist` | SELECT | — | nadie (privada) |
| `bookings` | SELECT | `auth.uid() = client_user_id OR auth.email() = client_email` | authenticated |
| `bookings` | INSERT/UPDATE | — | solo service-role |
| `webhook_events` | * | — | solo service-role |
| `contact_messages` | INSERT | `with check (true)` | anon + authenticated |
| `contact_messages` | SELECT | — | solo service-role |
| `favorites` | SELECT/INSERT/DELETE | `auth.uid() = client_user_id` | authenticated propio |
| `profiles` | SELECT | `auth.uid() = id` | authenticated propio |
| `profiles` | UPDATE | `auth.uid() = id` + trigger role immutable | authenticated propio |
| `profiles` | INSERT/DELETE | — | solo trigger (security definer) |

---

## Futuras tablas (NO implementadas — gating cycles posteriores)

### `cleaner_profiles` (1:1 con `profiles` where role='cleaner')

```sql
create table cleaner_profiles (
  profile_id      uuid primary key references profiles(id) on delete cascade,
  slug            text unique not null,          -- SEO URL (ej. "sofia-r")
  price_per_hour  numeric(5,2) not null,         -- cleaner libre
  bio             text,
  languages       text[],
  specialties     text[],
  hood            text,                          -- barrio principal Amsterdam
  response_time_minutes integer,
  accepts_bookings boolean default true,
  photo_url       text,
  verified_kvk    boolean default false,
  verified_vog    boolean default false,
  verified_id     boolean default false,
  stripe_connect_account_id text,                -- Stripe Connect Express
  created_at, updated_at
);
```

Cuando exista, el `cleaner_id text` de `bookings` migrará a `cleaner_slug text references cleaner_profiles(slug)`.

### `reviews`

```sql
create table reviews (
  id, booking_id (FK), cleaner_slug, client_user_id,
  rating (1-5), comment, created_at
);
```

Una review por booking. Trigger: solo se puede crear si booking.status='completed' Y client_user_id = auth.uid().

### `messages`

```sql
create table messages (
  id, booking_id (FK), sender_id (uuid), body, created_at, read_at
);
```

Chat entre cliente y cleaner ligado al booking. RLS: ambos pueden leer/escribir si participan.

### `cleaner_verifications` (audit trail)

```sql
create table cleaner_verifications (
  id, profile_id (FK), type (enum: kvk|vog|id|photo|insurance),
  status (enum: pending|approved|rejected),
  verifier_id (uuid, admin), verified_at, evidence_url
);
```

---

## Variables de entorno requeridas

| Var | Scope | Requerida cuando |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | public | Cualquier operación con DB |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | public | Idem |
| `SUPABASE_SERVICE_ROLE_KEY` | server-only | Server Action booking (pending insert), Webhook persist |
| `STRIPE_SECRET_KEY` | server-only | Booking checkout |
| `STRIPE_WEBHOOK_SECRET` | server-only | Webhook verification (fail-closed si falta) |
| `NEXT_PUBLIC_SITE_URL` | public | Canonical origin para Stripe success_url |

---

## Migraciones aplicadas (orden cronológico)

| Cycle | Fecha | Cambio |
|---|---|---|
| Foundation | inicio | waitlist, bookings, webhook_events, contact_messages, favorites |
| AUTO-CYCLE 1 | 2026-06-07 | bookings + columnas street, postcode, city, notes, client_user_id + indexes + RLS bookings_own_select |
| AUTO-CYCLE 2 | 2026-06-07 | profiles + trigger handle_new_user + role_immutable + RLS own_select/update |
| AUTO-CYCLE 6 | 2026-06-07 | bookings_status_check extendido: +accepted, +rejected, +in_progress, +reviewed |

---

## Cómo aplicar el schema en Supabase

`supabase/schema.sql` es idempotente (todo `IF NOT EXISTS` / `DROP IF EXISTS`).

```bash
# Local dev (supabase CLI):
supabase db reset                       # wipe + re-apply
# o solo aplicar nuevos cambios:
supabase db push

# Producción (manual hasta CI):
# Supabase Dashboard → SQL Editor → pegar schema.sql → Run
```
