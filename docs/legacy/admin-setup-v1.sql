-- ═══════════════════════════════════════════════════════════
-- cleaners — Admin system setup
-- ═══════════════════════════════════════════════════════════
--
-- IMPORTANTE: Ejecuta esto DESPUÉS del supabase-setup.sql principal.
-- Es idempotente (puedes ejecutarlo varias veces sin romper nada).
--
-- INSTRUCCIONES:
-- 1. Supabase → SQL Editor → New query
-- 2. Copia y pega este archivo entero
-- 3. ⚠️ EDITA la línea marcada con "⚠️ CAMBIA AQUÍ"
--    Pon TU EMAIL real (el que usaste para registrarte como tu primer cleaner)
-- 4. Click "Run"
-- 5. Verifica que dice "Success"
-- ═══════════════════════════════════════════════════════════


-- ───────────────────────────────────────────────────────────
-- 1. TABLA: admin_users (lista de admins de la plataforma)
-- ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.admin_users (
  user_id    UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email      TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  notes      TEXT
);

ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Añadir columna rejection_reason a cleaners (si no existe)
ALTER TABLE public.cleaners ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- Solo los admins pueden ver la lista de admins
DROP POLICY IF EXISTS "Admins zien admin lijst" ON public.admin_users;
CREATE POLICY "Admins zien admin lijst"
  ON public.admin_users FOR SELECT
  USING (auth.uid() IN (SELECT user_id FROM public.admin_users));


-- ───────────────────────────────────────────────────────────
-- 2. POLÍTICAS RLS: Admins pueden gestionar TODO
-- ───────────────────────────────────────────────────────────

-- Admins pueden actualizar cualquier cleaner (approve, reject, suspend)
DROP POLICY IF EXISTS "Admins beheren cleaners" ON public.cleaners;
CREATE POLICY "Admins beheren cleaners"
  ON public.cleaners FOR UPDATE
  USING (auth.uid() IN (SELECT user_id FROM public.admin_users));

-- Admins pueden ver TODOS los cleaners (incluso los no visibles/pending)
DROP POLICY IF EXISTS "Admins zien alle cleaners" ON public.cleaners;
CREATE POLICY "Admins zien alle cleaners"
  ON public.cleaners FOR SELECT
  USING (auth.uid() IN (SELECT user_id FROM public.admin_users));

-- Admins pueden ver todos los clients
DROP POLICY IF EXISTS "Admins zien alle clients" ON public.clients;
CREATE POLICY "Admins zien alle clients"
  ON public.clients FOR SELECT
  USING (auth.uid() IN (SELECT user_id FROM public.admin_users));

-- Admins pueden ver todos los bookings
DROP POLICY IF EXISTS "Admins zien alle bookings" ON public.bookings;
CREATE POLICY "Admins zien alle bookings"
  ON public.bookings FOR SELECT
  USING (auth.uid() IN (SELECT user_id FROM public.admin_users));

DROP POLICY IF EXISTS "Admins beheren bookings" ON public.bookings;
CREATE POLICY "Admins beheren bookings"
  ON public.bookings FOR UPDATE
  USING (auth.uid() IN (SELECT user_id FROM public.admin_users));

-- Admins pueden ver waitlist
DROP POLICY IF EXISTS "Admins zien waitlist" ON public.waitlist;
CREATE POLICY "Admins zien waitlist"
  ON public.waitlist FOR SELECT
  USING (auth.uid() IN (SELECT user_id FROM public.admin_users));


-- ───────────────────────────────────────────────────────────
-- 3. AÑADIR EL PRIMER ADMIN (TÚ)
-- ───────────────────────────────────────────────────────────
-- ⚠️ CAMBIA AQUÍ: pon TU EMAIL (el que usaste para registrarte en getcleaners.nl)

INSERT INTO public.admin_users (user_id, email, notes)
SELECT id, email, 'Plataforma founder · added via SQL'
FROM auth.users
WHERE email = 'MRSALGADO94@GMAIL.COM'   -- ⚠️ CAMBIA AQUÍ tu email real
ON CONFLICT (user_id) DO NOTHING;


-- ───────────────────────────────────────────────────────────
-- 4. VERIFICACIÓN
-- ───────────────────────────────────────────────────────────
-- Después de ejecutar, comprueba que tu user_id está en la tabla:
-- 
-- SELECT * FROM admin_users;
--
-- Deberías ver al menos 1 fila con tu email.
-- Si no, asegúrate de:
--   1. Estar registrado en getcleaners.nl con ese email
--   2. Haber confirmado el email (estar en auth.users)
--   3. Haber escrito bien el email en la línea ⚠️ arriba
-- ═══════════════════════════════════════════════════════════
