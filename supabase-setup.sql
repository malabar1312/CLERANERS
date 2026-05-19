-- ═══════════════════════════════════════════════════════════
-- cleaners — Setup completo de base de datos en Supabase
-- ═══════════════════════════════════════════════════════════
--
-- INSTRUCCIONES:
-- 1. En tu proyecto Supabase, ve a "SQL Editor" (icono <> en menú izquierdo)
-- 2. Click "New query"
-- 3. Copia TODO este archivo y pégalo
-- 4. Click "Run" (botón verde abajo derecha)
-- 5. Verás "Success. No rows returned" → todo bien
--
-- Después ve a Authentication → Email Templates y personaliza emails si quieres.
-- ═══════════════════════════════════════════════════════════


-- ───────────────────────────────────────────────────────────
-- 1. TABLA: cleaners (perfiles de schoonmakers)
-- ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.cleaners (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Datos básicos
  firstname   TEXT NOT NULL,
  lastname    TEXT NOT NULL,
  email       TEXT NOT NULL UNIQUE,
  phone       TEXT,
  hood        TEXT,
  
  -- Profesional
  bio         TEXT,
  hourly_rate INTEGER DEFAULT 15,
  years_exp   INTEGER DEFAULT 0,
  services    TEXT[],
  languages   TEXT[] DEFAULT ARRAY['Nederlands'],
  
  -- KYC / verificación
  kyc_status  TEXT DEFAULT 'pending' CHECK (kyc_status IN ('pending','in_review','verified','rejected')),
  id_doc_url  TEXT,
  selfie_url  TEXT,
  vog_url     TEXT,
  photo_url   TEXT,
  
  -- Disponibilidad
  available_days TEXT[],
  available_start TEXT DEFAULT '09:00',
  available_end   TEXT DEFAULT '17:00',
  hours_per_week  INTEGER DEFAULT 20,
  
  -- Stats (se calculan automáticamente)
  rating          NUMERIC(2,1),
  reviews_count   INTEGER DEFAULT 0,
  jobs_count      INTEGER DEFAULT 0,
  
  -- Estado
  status      TEXT DEFAULT 'pending' CHECK (status IN ('pending','active','paused','suspended')),
  is_visible  BOOLEAN DEFAULT false,
  
  -- Pago
  iban_last4  TEXT,
  stripe_account_id TEXT,
  
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ───────────────────────────────────────────────────────────
-- 2. TABLA: bookings (reservas hechas por clientes)
-- ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.bookings (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference   TEXT UNIQUE NOT NULL,
  
  -- Cliente
  client_user_id UUID REFERENCES auth.users(id),
  client_email   TEXT NOT NULL,
  client_name    TEXT,
  
  -- Schoonmaker
  cleaner_id     UUID REFERENCES public.cleaners(id),
  
  -- Detalles
  service_type   TEXT,
  address        TEXT NOT NULL,
  scheduled_date DATE NOT NULL,
  scheduled_time TEXT NOT NULL,
  hours          INTEGER DEFAULT 3,
  hourly_rate    INTEGER,
  total_price    NUMERIC(8,2),
  
  -- Pago (Stripe)
  payment_intent_id TEXT,
  payment_status    TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending','authorized','captured','refunded','failed')),
  
  -- Estado
  status      TEXT DEFAULT 'confirmed' CHECK (status IN ('confirmed','in_progress','completed','cancelled','disputed')),
  
  -- Reviews
  rating      INTEGER CHECK (rating BETWEEN 1 AND 5),
  review_text TEXT,
  
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- ───────────────────────────────────────────────────────────
-- 3. TABLA: messages (chat entre cliente y cleaner)
-- ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.messages (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id  UUID REFERENCES public.bookings(id) ON DELETE CASCADE,
  from_user_id UUID REFERENCES auth.users(id),
  to_user_id   UUID REFERENCES auth.users(id),
  body         TEXT NOT NULL,
  read_at      TIMESTAMPTZ,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ───────────────────────────────────────────────────────────
-- 4. TABLA: waitlist (email signups)
-- ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.waitlist (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email      TEXT NOT NULL,
  city       TEXT,
  role       TEXT DEFAULT 'client' CHECK (role IN ('client','cleaner','app_ios','app_android')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ───────────────────────────────────────────────────────────
-- INDEXES (para queries rápidas)
-- ───────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_cleaners_status ON public.cleaners(status, is_visible);
CREATE INDEX IF NOT EXISTS idx_cleaners_hood   ON public.cleaners(hood);
CREATE INDEX IF NOT EXISTS idx_bookings_cleaner ON public.bookings(cleaner_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings(status);
CREATE INDEX IF NOT EXISTS idx_messages_booking ON public.messages(booking_id, created_at);

-- ───────────────────────────────────────────────────────────
-- ROW LEVEL SECURITY (cada usuario solo ve lo suyo)
-- ───────────────────────────────────────────────────────────
ALTER TABLE public.cleaners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;

-- Cleaners visibles públicamente (solo si están activos + visibles)
CREATE POLICY "Cleaners visibles para todos"
  ON public.cleaners FOR SELECT
  USING (status = 'active' AND is_visible = true);

-- Cleaners pueden editar su propio perfil
CREATE POLICY "Cleaner edita su propio perfil"
  ON public.cleaners FOR UPDATE
  USING (auth.uid() = user_id);

-- Cleaner puede crear su propio perfil (al registrarse)
CREATE POLICY "Cleaner crea su propio perfil"
  ON public.cleaners FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Cleaner ve TODAS sus datos propios (incluido pending)
CREATE POLICY "Cleaner ve su propio perfil completo"
  ON public.cleaners FOR SELECT
  USING (auth.uid() = user_id);

-- Bookings: el cliente y el cleaner ven la suya
CREATE POLICY "Ver booking propio"
  ON public.bookings FOR SELECT
  USING (
    auth.uid() = client_user_id OR
    auth.uid() = (SELECT user_id FROM public.cleaners WHERE id = cleaner_id)
  );

CREATE POLICY "Crear booking propio"
  ON public.bookings FOR INSERT
  WITH CHECK (auth.uid() = client_user_id);

-- Messages
CREATE POLICY "Ver mis mensajes"
  ON public.messages FOR SELECT
  USING (auth.uid() = from_user_id OR auth.uid() = to_user_id);

CREATE POLICY "Enviar mensajes"
  ON public.messages FOR INSERT
  WITH CHECK (auth.uid() = from_user_id);

-- Waitlist: cualquiera puede añadirse
CREATE POLICY "Cualquiera se apunta a waitlist"
  ON public.waitlist FOR INSERT
  WITH CHECK (true);

-- ───────────────────────────────────────────────────────────
-- STORAGE BUCKETS (para subida de fotos y documentos KYC)
-- ───────────────────────────────────────────────────────────
-- Bucket para fotos de perfil (públicas)
INSERT INTO storage.buckets (id, name, public)
VALUES ('cleaner-photos', 'cleaner-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Bucket para documentos KYC (privados)
INSERT INTO storage.buckets (id, name, public)
VALUES ('cleaner-kyc', 'cleaner-kyc', false)
ON CONFLICT (id) DO NOTHING;

-- Permisos: cleaner puede subir sus propios docs
CREATE POLICY "Cleaner sube su foto"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'cleaner-photos' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Cleaner sube su KYC"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'cleaner-kyc' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Fotos públicas legibles"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'cleaner-photos');

CREATE POLICY "KYC privado: solo dueño + admin"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'cleaner-kyc' AND (storage.foldername(name))[1] = auth.uid()::text);

-- ───────────────────────────────────────────────────────────
-- FUNCIÓN: actualizar updated_at automáticamente
-- ───────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER cleaners_updated_at
  BEFORE UPDATE ON public.cleaners
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ═══════════════════════════════════════════════════════════
-- ✓ TODO LISTO. La base de datos está preparada.
-- ═══════════════════════════════════════════════════════════
