-- ─────────────────────────────────────────────────────────────────────────
-- 0002 · Stripe Connect — payouts al cleaner + comisión on-platform.
--
-- `stripe_connect_account_id` YA existe en schema.sql (cuenta Express del
-- cleaner). Falta el flag de "puede recibir fondos" (capability transfers
-- activa), que el webhook `account.updated` mantiene al día.
--
-- Idempotente: seguro de re-ejecutar. Antonio corre esto en Supabase SQL editor.
-- ─────────────────────────────────────────────────────────────────────────

alter table public.cleaner_profiles
  add column if not exists stripe_charges_enabled boolean not null default false;

comment on column public.cleaner_profiles.stripe_charges_enabled is
  'Capability transfers activa en la cuenta Connect → puede recibir el destination charge. Lo setea el webhook account.updated (service-role).';

-- El cleaner NO puede tocar sus propios flags de Stripe (igual que verified*):
-- solo service-role (webhook/admin). Extiende el trigger de inmutabilidad.
create or replace function public.cleaner_verification_immutable()
returns trigger
language plpgsql
as $$
begin
  if (new.verified is distinct from old.verified
      or new.verified_kvk is distinct from old.verified_kvk
      or new.verified_vog is distinct from old.verified_vog
      or new.verified_id is distinct from old.verified_id
      or new.stripe_connect_account_id is distinct from old.stripe_connect_account_id
      or new.stripe_charges_enabled is distinct from old.stripe_charges_enabled)
     and current_setting('request.jwt.claim.role', true) is distinct from 'service_role'
     and (auth.jwt() ->> 'role') is distinct from 'service_role' then
    raise exception 'verification / stripe flags are admin-only' using errcode = '42501';
  end if;
  return new;
end;
$$;
