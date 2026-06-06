-- ============================================================
-- cleaners · Stripe Connect + escrow · migración de pagos
-- Idempotente (IF NOT EXISTS). Seguro de re-ejecutar.
-- Ejecutar en: Supabase → SQL Editor (o `supabase db push`).
-- ============================================================

-- 1) Stripe Connect account del cleaner ------------------------------------
alter table if exists public.cleaners
  add column if not exists stripe_account_id text,
  add column if not exists stripe_charges_enabled boolean not null default false,
  add column if not exists stripe_payouts_enabled boolean not null default false;

-- 2) Columnas de pago/escrow en bookings -----------------------------------
alter table if exists public.bookings
  add column if not exists cleaner_id uuid,
  add column if not exists client_id uuid,
  add column if not exists service_type text,
  add column if not exists scheduled_at timestamptz,
  add column if not exists hours numeric(4,1) not null default 3,
  add column if not exists cleaner_amount_cents integer not null default 0,  -- lo que recibe el cleaner (precio * horas)
  add column if not exists service_fee_cents integer not null default 0,      -- fee al cliente (18%)
  add column if not exists total_cents integer not null default 0,            -- lo que paga el cliente
  add column if not exists platform_fee_cents integer not null default 0,     -- comisión plataforma (15%)
  add column if not exists currency text not null default 'eur',
  add column if not exists status text not null default 'pending'
    check (status in ('pending','paid','accepted','completed','cancelled','refunded')),
  add column if not exists escrow_status text not null default 'held'
    check (escrow_status in ('held','released','refunded')),
  add column if not exists stripe_checkout_session_id text,
  add column if not exists stripe_payment_intent_id text,
  add column if not exists reference text,
  add column if not exists created_at timestamptz not null default now();

create index if not exists idx_bookings_cleaner on public.bookings(cleaner_id);
create index if not exists idx_bookings_client on public.bookings(client_id);
create unique index if not exists uq_bookings_pi on public.bookings(stripe_payment_intent_id)
  where stripe_payment_intent_id is not null;

-- 3) Idempotencia de requests (create-checkout) ----------------------------
create table if not exists public.idempotency_keys (
  key text primary key,
  scope text not null,
  response jsonb,
  created_at timestamptz not null default now()
);

-- 4) Eventos de webhook ya procesados (anti-replay) ------------------------
create table if not exists public.webhook_events (
  id text primary key,             -- Stripe event id (evt_...)
  type text not null,
  processed_at timestamptz not null default now()
);

-- 5) Registro de pagos (audit) ---------------------------------------------
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid references public.bookings(id) on delete set null,
  stripe_payment_intent_id text,
  stripe_charge_id text,
  amount_cents integer not null,
  application_fee_cents integer not null default 0,
  currency text not null default 'eur',
  status text not null,            -- succeeded | refunded | failed
  created_at timestamptz not null default now()
);
create index if not exists idx_payments_booking on public.payments(booking_id);

-- 6) RLS --------------------------------------------------------------------
alter table public.bookings        enable row level security;
alter table public.payments        enable row level security;
alter table public.idempotency_keys enable row level security;
alter table public.webhook_events  enable row level security;

-- El cliente ve/crea sus bookings; el cleaner ve los suyos.
drop policy if exists bookings_client_select on public.bookings;
create policy bookings_client_select on public.bookings
  for select using (auth.uid() = client_id or auth.uid() = cleaner_id);

drop policy if exists bookings_client_insert on public.bookings;
create policy bookings_client_insert on public.bookings
  for insert with check (auth.uid() = client_id);

-- El cleaner puede aceptar/actualizar el estado de SUS bookings.
drop policy if exists bookings_cleaner_update on public.bookings;
create policy bookings_cleaner_update on public.bookings
  for update using (auth.uid() = cleaner_id or auth.uid() = client_id);

-- payments: solo lectura para las partes implicadas (escritura solo service_role / webhook).
drop policy if exists payments_select on public.payments;
create policy payments_select on public.payments
  for select using (
    exists (select 1 from public.bookings b
            where b.id = payments.booking_id
              and (b.client_id = auth.uid() or b.cleaner_id = auth.uid()))
  );

-- idempotency_keys y webhook_events: NO accesibles por usuarios (solo service_role,
-- que bypassa RLS). Sin políticas => denegado por defecto con RLS activo.

-- NOTA: las Edge Functions usan la SERVICE_ROLE key (bypassa RLS) para escribir
-- pagos/estado desde el webhook firmado. El frontend usa la anon key (sujeta a RLS).
