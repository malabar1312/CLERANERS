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
-- profiles — 1:1 con auth.users. Se autopopula vía trigger al registrarse.
-- `role` es immutable desde el cliente (RLS bloquea UPDATE de esa columna).
-- Cleaner-specific cols (slug, price_per_hour, bio, etc.) van en una tabla
-- separada `cleaner_profiles` cuando se implemente.
-- ─────────────────────────────────────────────────────────────────────────
do $$ begin
  create type public.user_role as enum ('customer', 'cleaner', 'admin');
exception when duplicate_object then null;
end $$;

create table if not exists public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  role        public.user_role not null default 'customer',
  first_name  text,
  last_name   text,
  phone       text,
  avatar_url  text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists profiles_role_idx on public.profiles (role);

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;

-- Usuario lee su propio perfil.
drop policy if exists "profiles_own_select" on public.profiles;
create policy "profiles_own_select"
  on public.profiles for select
  to authenticated
  using (auth.uid() = id);

-- Usuario actualiza su propio perfil EXCEPTO role (role lo cambia solo admin/server).
-- Postgres no permite GRANT por columna en RLS, así que usamos un trigger que
-- bloquea cambios a `role` desde no-service-role. (Service-role bypassa RLS.)
drop policy if exists "profiles_own_update" on public.profiles;
create policy "profiles_own_update"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

create or replace function public.profiles_role_immutable()
returns trigger
language plpgsql
as $$
begin
  -- Permitir cambios desde service-role (no aplica RLS), bloquear si el role JWT
  -- es distinto al original. Usamos current_setting de la sesión.
  if new.role is distinct from old.role then
    -- Si la sesión NO es service_role, rechazar.
    if current_setting('request.jwt.claim.role', true) is distinct from 'service_role'
       and (auth.jwt() ->> 'role') is distinct from 'service_role' then
      raise exception 'role is immutable from client' using errcode = '42501';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_role_immutable on public.profiles;
create trigger profiles_role_immutable
  before update on public.profiles
  for each row execute function public.profiles_role_immutable();

-- Trigger autopopulate: al crearse un auth.users, se crea su profile.
-- Lee `raw_user_meta_data->>'full_name'` (lo manda la Server Action signUp).
-- Role: lee `raw_user_meta_data->>'role'` y valida; default 'customer'.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer  -- corre con privilegios del owner; necesario para insertar en public.profiles
set search_path = public
as $$
declare
  meta_role text;
  validated_role public.user_role;
begin
  meta_role := new.raw_user_meta_data->>'role';
  -- Validación whitelist: solo customer o cleaner desde el cliente; admin
  -- nunca via signup.
  if meta_role = 'cleaner' then
    validated_role := 'cleaner';
  else
    validated_role := 'customer';
  end if;

  insert into public.profiles (id, role, first_name)
  values (
    new.id,
    validated_role,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ─────────────────────────────────────────────────────────────────────────
-- cleaner_profiles — perfil público del schoonmaker (1:1 con profiles).
-- Fuente de verdad del catálogo cuando existe ≥1 fila (sino: mock fallback).
-- `slug` = id público SEO ("sofia-r"). El cleaner edita el suyo; público lee
-- los visibles. La capa lib/data/cleaners.ts hace el switch mock↔real.
-- ─────────────────────────────────────────────────────────────────────────
create table if not exists public.cleaner_profiles (
  profile_id                 uuid primary key references public.profiles (id) on delete cascade,
  slug                       text unique not null,
  name                       text not null,
  hood                       text,
  price_per_hour             numeric(6,2) not null default 24,
  bio                        text,
  languages                  text[] not null default '{}',
  specialties                text[] not null default '{}',
  image                      text,
  tone                       integer not null default 0,
  rating                     numeric(2,1) not null default 0,
  reviews_count              integer not null default 0,
  response_mins              integer not null default 20,
  since                      integer,
  online                     boolean not null default false,
  verified                   boolean not null default false,
  accepts_bookings           boolean not null default true,
  visible                    boolean not null default true,
  verified_kvk               boolean not null default false,
  verified_vog               boolean not null default false,
  verified_id                boolean not null default false,
  stripe_connect_account_id  text,
  created_at                 timestamptz not null default now(),
  updated_at                 timestamptz not null default now()
);

create index if not exists cleaner_profiles_visible_idx on public.cleaner_profiles (visible);
create index if not exists cleaner_profiles_hood_idx    on public.cleaner_profiles (hood);

drop trigger if exists cleaner_profiles_set_updated_at on public.cleaner_profiles;
create trigger cleaner_profiles_set_updated_at
  before update on public.cleaner_profiles
  for each row execute function public.set_updated_at();

alter table public.cleaner_profiles enable row level security;

-- Público (anon + authenticated) ve los cleaners visibles.
drop policy if exists "cleaner_profiles_public_select" on public.cleaner_profiles;
create policy "cleaner_profiles_public_select"
  on public.cleaner_profiles for select
  to anon, authenticated
  using (visible = true);

-- El cleaner SIEMPRE ve su propio perfil, también en borrador (visible=false).
-- Sin esto, el alta con visible=false deja al cleaner ciego a su propia fila:
-- el wizard no detecta que ya existe y el dashboard no puede mostrarla.
drop policy if exists "cleaner_profiles_own_select" on public.cleaner_profiles;
create policy "cleaner_profiles_own_select"
  on public.cleaner_profiles for select
  to authenticated
  using (auth.uid() = profile_id);

-- El cleaner crea/edita SU propio perfil (no puede cambiar verified flags —
-- eso lo hace service-role/admin; protegido por un trigger más abajo).
drop policy if exists "cleaner_profiles_own_insert" on public.cleaner_profiles;
create policy "cleaner_profiles_own_insert"
  on public.cleaner_profiles for insert
  to authenticated
  with check (auth.uid() = profile_id);

drop policy if exists "cleaner_profiles_own_update" on public.cleaner_profiles;
create policy "cleaner_profiles_own_update"
  on public.cleaner_profiles for update
  to authenticated
  using (auth.uid() = profile_id)
  with check (auth.uid() = profile_id);

-- Los flags de verificación (KYC) son inmutables desde el cliente: solo
-- service-role/admin los cambia. Igual patrón que profiles.role.
create or replace function public.cleaner_verification_immutable()
returns trigger
language plpgsql
as $$
begin
  if (new.verified is distinct from old.verified
      or new.verified_kvk is distinct from old.verified_kvk
      or new.verified_vog is distinct from old.verified_vog
      or new.verified_id is distinct from old.verified_id)
     and current_setting('request.jwt.claim.role', true) is distinct from 'service_role'
     and (auth.jwt() ->> 'role') is distinct from 'service_role' then
    raise exception 'verification flags are admin-only' using errcode = '42501';
  end if;
  return new;
end;
$$;

drop trigger if exists cleaner_verification_immutable on public.cleaner_profiles;
create trigger cleaner_verification_immutable
  before update on public.cleaner_profiles
  for each row execute function public.cleaner_verification_immutable();

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

  -- Estados extendidos AUTO-CYCLE 6 (preparación accept/reject del cleaner):
  --   pending     ← Server Action pre-Stripe insert
  --   paid        ← webhook checkout.session.completed
  --   accepted    ← cleaner acepta el booking (cycle futuro)
  --   rejected    ← cleaner rechaza (gatilla refund vía Connect — cycle futuro)
  --   in_progress ← día/hora de inicio (cron o cleaner toggle)
  --   completed   ← cleaner marca como hecho
  --   reviewed    ← customer dejó review (cycle futuro)
  --   refunded    ← webhook charge.refunded
  --   canceled    ← customer cancela antes de 24h
  status             text not null default 'pending',

  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

-- Data-integrity (Bloque 1, AUTO-CYCLE 1): la dirección llega al Server Action
-- vía Zod pero se perdía tras Stripe. Estas columnas la preservan. El
-- `client_user_id` linkea la reserva al auth.user cuando está logueado;
-- queda NULL para checkout anónimo (flow actual permite reservar sin login).
alter table public.bookings add column if not exists street          text;
alter table public.bookings add column if not exists postcode        text;
alter table public.bookings add column if not exists city            text;
alter table public.bookings add column if not exists notes           text;
alter table public.bookings add column if not exists client_user_id  uuid;

create index if not exists bookings_cleaner_idx     on public.bookings (cleaner_id);
create index if not exists bookings_status_idx      on public.bookings (status);
create index if not exists bookings_client_user_idx on public.bookings (client_user_id);
create index if not exists bookings_client_email_idx on public.bookings (lower(client_email));

drop trigger if exists bookings_set_updated_at on public.bookings;
create trigger bookings_set_updated_at
  before update on public.bookings
  for each row execute function public.set_updated_at();

alter table public.bookings enable row level security;

-- El cliente ve su propia reserva: match por client_user_id O por email auth.
-- (Permite ver reservas hechas anónimamente si después se loguea con ese email.)
drop policy if exists "bookings_own_select" on public.bookings;
create policy "bookings_own_select"
  on public.bookings for select
  to authenticated
  using (
    auth.uid() = client_user_id
    or auth.email() = client_email
  );
-- INSERT/UPDATE/DELETE siguen sin policy → solo service-role (webhook + Server Action admin).

-- CHECK constraint del status (AUTO-CYCLE 6): idempotente vía drop+add.
-- Se aplica fuera del CREATE TABLE para que las re-ejecuciones del schema
-- actualicen la constraint cuando agreguemos estados nuevos.
alter table public.bookings drop constraint if exists bookings_status_check;
alter table public.bookings add constraint bookings_status_check
  check (status in (
    'pending', 'paid',
    'accepted', 'rejected',
    'in_progress', 'completed', 'reviewed',
    'refunded', 'canceled'
  ));

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
