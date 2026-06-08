-- ════════════════════════════════════════════════════════════════════════
-- seed-cleaners.sql — 2 cleaners REALES de ejemplo (OPCIONAL)
-- ════════════════════════════════════════════════════════════════════════
-- Para qué: validar el HYBRID. En cuanto cleaner_profiles tiene ≥1 fila
-- visible, la capa lib/data/cleaners.ts deja de usar el mock y muestra ESTOS.
--
-- Cómo usar:
--   1. Corré PRIMERO supabase/schema.sql (crea cleaner_profiles + trigger).
--   2. Corré este archivo en Supabase → SQL Editor.
--   3. Recargá el sitio (o esperá 60s por el ISR). Verás los reales.
--
-- En producción los cleaners NO se seedean: entran por el onboarding
-- (/signup?role=cleaner → wizard). Este seed es solo para demo/QA.
--
-- Es idempotente: re-ejecutable sin duplicar.
-- ════════════════════════════════════════════════════════════════════════

-- Necesario para crypt()/gen_salt() al crear los auth.users de prueba.
create extension if not exists pgcrypto;

-- ── Cleaner 1 ────────────────────────────────────────────────────────────
insert into auth.users (
  id, instance_id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data
) values (
  'aaaaaaaa-0000-4000-8000-0000000000c1',
  '00000000-0000-0000-0000-000000000000',
  'authenticated', 'authenticated', 'demo.eva@getcleaners.nl',
  crypt('DemoCleaner123!', gen_salt('bf')),
  now(), now(), now(),
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"Eva de Vries","role":"cleaner"}'
) on conflict (id) do nothing;

-- ── Cleaner 2 ────────────────────────────────────────────────────────────
insert into auth.users (
  id, instance_id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data
) values (
  'aaaaaaaa-0000-4000-8000-0000000000c2',
  '00000000-0000-0000-0000-000000000000',
  'authenticated', 'authenticated', 'demo.tom@getcleaners.nl',
  crypt('DemoCleaner123!', gen_salt('bf')),
  now(), now(), now(),
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"Tom Bakker","role":"cleaner"}'
) on conflict (id) do nothing;

-- El trigger on_auth_user_created ya creó las filas en profiles.
-- Aseguramos el role cleaner (por si el trigger lo dejó en customer).
update public.profiles set role = 'cleaner'
  where id in (
    'aaaaaaaa-0000-4000-8000-0000000000c1',
    'aaaaaaaa-0000-4000-8000-0000000000c2'
  );

-- ── Perfiles públicos de cleaner ─────────────────────────────────────────
insert into public.cleaner_profiles (
  profile_id, slug, name, hood, price_per_hour, bio, languages, specialties,
  image, tone, rating, reviews_count, response_mins, since, online, verified, visible
) values
(
  'aaaaaaaa-0000-4000-8000-0000000000c1', 'eva-de-vries', 'Eva de Vries', 'Zuid',
  27,
  'Acht jaar ervaring in premium schoonmaak in Amsterdam-Zuid. Oog voor detail, discreet en betrouwbaar. Ik laat je huis achter zoals ik mijn eigen huis wil zien.',
  array['Nederlands','Engels'],
  array['Premium','Dieptereiniging','Ramen'],
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=800',
  0, 4.9, 64, 10, 2017, true, true, true
),
(
  'aaaaaaaa-0000-4000-8000-0000000000c2', 'tom-bakker', 'Tom Bakker', 'Oud-West',
  24,
  'Snel, grondig en flexibel. Ik werk met eco-producten en ben goed met huisdieren. Ideaal voor wekelijks onderhoud of een grote voorjaarsschoonmaak.',
  array['Nederlands','Engels'],
  array['Wekelijks','Eco-producten','Huisdieren OK'],
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=800',
  1, 4.8, 38, 15, 2020, true, true, true
)
on conflict (profile_id) do update set
  slug = excluded.slug,
  name = excluded.name,
  hood = excluded.hood,
  price_per_hour = excluded.price_per_hour,
  bio = excluded.bio,
  languages = excluded.languages,
  specialties = excluded.specialties,
  image = excluded.image,
  rating = excluded.rating,
  reviews_count = excluded.reviews_count,
  visible = true;

-- ✓ Listo. Recargá el sitio → la landing/listado/perfil muestran a Eva y Tom.
--   Para volver al mock: update public.cleaner_profiles set visible = false;
