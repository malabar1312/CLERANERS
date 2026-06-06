-- ════════════════════════════════════════════════════════════════════════
-- cleaners — Supabase schema v2 (Next.js)
-- ════════════════════════════════════════════════════════════════════════
-- Cómo usar:
--   1. Supabase → SQL Editor → New query
--   2. Pegá TODO este archivo → Run
--   3. "Success. No rows returned" = listo
--
-- Es IDEMPOTENTE: lo podés re-ejecutar sin romper nada.
-- Alineado al código de apps/web (waitlist Server Action + webhook de Stripe).
-- ════════════════════════════════════════════════════════════════════════

-- Helper: setea updated_at en cada UPDATE. (Definido ANTES de los triggers.)
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ─────────────────────────────────────────────────────────────────────────
-- waitlist — captura de leads (hero waitlist-first, P1)
-- El Server Action inserta { email, locale, source } con la ANON key.
-- ─────────────────────────────────────────────────────────────────────────
create table if not exists public.waitlist (
  id          uuid primary key default gen_random_uuid(),
  email       text not null,
  locale      text not null default 'nl',
  source      text not null default 'landing',
  created_at  timestamptz not null default now()
);

-- Único por email (case-insensitive) → el insert duplicado devuelve 23505,
-- que el Server Action trata como "ya estás en la lista".
create unique index if not exists waitlist_email_key
  on public.waitlist (lower(email));

alter table public.waitlist enable row level security;

-- Cualquiera (anon) puede APUNTARSE; nadie puede LEER con la anon key
-- (sin policy de SELECT → la lista de emails queda privada).
drop policy if exists "waitlist_anon_insert" on public.waitlist;
create policy "waitlist_anon_insert"
  on public.waitlist for insert
  to anon, authenticated
  with check (true);

-- ─────────────────────────────────────────────────────────────────────────
-- bookings — reservas (las escribe el webhook de Stripe con service-role)
-- cleaner_id es TEXT (hoy ids mock tipo "sofia-r"); pasará a UUID+FK en Fase 4.
-- ─────────────────────────────────────────────────────────────────────────
create table if not exists public.bookings (
  id                 uuid primary key default gen_random_uuid(),
  reference          text unique not null,
  stripe_session_id  text unique,
  payment_intent_id  text,

  cleaner_id         text not null,
  client_email       text,
  client_name        text,

  scheduled_date     date,
  scheduled_time     text,
  frequency          text,
  m2                 integer,
  hours              integer,

  subtotal_cents     integer,
  fee_cents          integer,
  total_cents        integer,
  currency           text not null default 'eur',

  status             text not null default 'pending'
                       check (status in ('pending','paid','refunded','canceled','completed')),

  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

create index if not exists bookings_cleaner_idx on public.bookings (cleaner_id);
create index if not exists bookings_status_idx  on public.bookings (status);

drop trigger if exists bookings_set_updated_at on public.bookings;
create trigger bookings_set_updated_at
  before update on public.bookings
  for each row execute function public.set_updated_at();

alter table public.bookings enable row level security;
-- Sin policies para anon/authenticated → bookings NO es accesible con la anon
-- key. Solo el service-role (webhook) escribe/lee. Cuando exista auth (Fase 4)
-- añadimos "el cliente ve su propia reserva".

-- ─────────────────────────────────────────────────────────────────────────
-- webhook_events — anti-replay / idempotencia del webhook de Stripe
-- ─────────────────────────────────────────────────────────────────────────
create table if not exists public.webhook_events (
  id           text primary key,          -- Stripe event.id
  type         text,
  received_at  timestamptz not null default now()
);

alter table public.webhook_events enable row level security;
-- Sin policies → solo service-role. (RLS activado por seguridad por defecto.)

-- ─────────────────────────────────────────────────────────────────────────
-- contact_messages — formulario de contacto (/contact)
-- Insert abierto (anon); lectura solo con service-role.
-- ─────────────────────────────────────────────────────────────────────────
create table if not exists public.contact_messages (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  email      text not null,
  subject    text not null,
  message    text not null,
  created_at timestamptz not null default now()
);

alter table public.contact_messages enable row level security;

drop policy if exists "contact_anon_insert" on public.contact_messages;
create policy "contact_anon_insert"
  on public.contact_messages for insert
  to anon, authenticated
  with check (true);

-- ─────────────────────────────────────────────────────────────────────────
-- favorites — cleaners favoritos del cliente (M4)
-- Cada usuario autenticado puede CRUD sus propios favoritos.
-- ─────────────────────────────────────────────────────────────────────────
create table if not exists public.favorites (
  id              uuid primary key default gen_random_uuid(),
  client_user_id  uuid not null,
  cleaner_id      text not null,
  created_at      timestamptz not null default now(),
  unique (client_user_id, cleaner_id)
);

create index if not exists favorites_user_idx on public.favorites (client_user_id);

alter table public.favorites enable row level security;

drop policy if exists "favorites_own_select" on public.favorites;
create policy "favorites_own_select"
  on public.favorites for select
  to authenticated
  using (auth.uid() = client_user_id);

drop policy if exists "favorites_own_insert" on public.favorites;
create policy "favorites_own_insert"
  on public.favorites for insert
  to authenticated
  with check (auth.uid() = client_user_id);

drop policy if exists "favorites_own_delete" on public.favorites;
create policy "favorites_own_delete"
  on public.favorites for delete
  to authenticated
  using (auth.uid() = client_user_id);

-- ════════════════════════════════════════════════════════════════════════
-- ✓ Listo. waitlist + bookings + webhook_events + contact_messages + favorites.
-- ════════════════════════════════════════════════════════════════════════
