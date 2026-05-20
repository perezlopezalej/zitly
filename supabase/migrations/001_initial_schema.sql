-- ============================================================
-- Zitly — Esquema inicial
-- Ejecutar en: Supabase SQL Editor
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- 0. Extensiones
-- ────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


-- ────────────────────────────────────────────────────────────
-- 1. Tipos personalizados
-- ────────────────────────────────────────────────────────────
CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'cancelled', 'completed');


-- ────────────────────────────────────────────────────────────
-- 2. Tablas
-- ────────────────────────────────────────────────────────────

-- 2.1 Perfiles (espejo de auth.users)
CREATE TABLE profiles (
  id          UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name   TEXT,
  avatar_url  TEXT,
  phone       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2.2 Negocios
CREATE TABLE businesses (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id    UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name        TEXT        NOT NULL,
  description TEXT,
  category    TEXT        NOT NULL,
  address     TEXT,
  phone       TEXT,
  email       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2.3 Empleados
CREATE TABLE employees (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID        NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  name        TEXT        NOT NULL,
  avatar_url  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2.4 Servicios
CREATE TABLE services (
  id                UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id       UUID           NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  name              TEXT           NOT NULL,
  description       TEXT,
  duration_minutes  INTEGER        NOT NULL CHECK (duration_minutes > 0),
  price             NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  created_at        TIMESTAMPTZ    NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ    NOT NULL DEFAULT now()
);

-- 2.5 Reservas
CREATE TABLE bookings (
  id           UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id  UUID           NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  client_id    UUID           NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  employee_id  UUID           REFERENCES employees(id) ON DELETE SET NULL,
  service_id   UUID           NOT NULL REFERENCES services(id) ON DELETE RESTRICT,
  date         DATE           NOT NULL,
  time         TIME           NOT NULL,
  status       booking_status NOT NULL DEFAULT 'pending',
  notes        TEXT,
  created_at   TIMESTAMPTZ    NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ    NOT NULL DEFAULT now()
);


-- ────────────────────────────────────────────────────────────
-- 3. Índices
-- ────────────────────────────────────────────────────────────
CREATE INDEX idx_businesses_owner       ON businesses(owner_id);
CREATE INDEX idx_employees_business     ON employees(business_id);
CREATE INDEX idx_services_business      ON services(business_id);
CREATE INDEX idx_bookings_business      ON bookings(business_id);
CREATE INDEX idx_bookings_client        ON bookings(client_id);
CREATE INDEX idx_bookings_employee      ON bookings(employee_id);
CREATE INDEX idx_bookings_date_time     ON bookings(date, time);
CREATE INDEX idx_bookings_status        ON bookings(status);


-- ────────────────────────────────────────────────────────────
-- 4. Trigger: updated_at automático
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_businesses_updated_at
  BEFORE UPDATE ON businesses
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_employees_updated_at
  BEFORE UPDATE ON employees
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_services_updated_at
  BEFORE UPDATE ON services
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_bookings_updated_at
  BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- ────────────────────────────────────────────────────────────
-- 5. Trigger: crear perfil automáticamente al registrarse
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'full_name',
    NEW.raw_user_meta_data ->> 'avatar_url'
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();


-- ────────────────────────────────────────────────────────────
-- 6. Row Level Security
-- ────────────────────────────────────────────────────────────
ALTER TABLE profiles   ENABLE ROW LEVEL SECURITY;
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees  ENABLE ROW LEVEL SECURITY;
ALTER TABLE services   ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings   ENABLE ROW LEVEL SECURITY;


-- ── profiles ────────────────────────────────────────────────
-- El usuario solo ve y edita su propio perfil
CREATE POLICY "profiles: select own"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "profiles: update own"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);


-- ── businesses ──────────────────────────────────────────────
-- El dueño gestiona su negocio; cualquier usuario autenticado puede leer (directorio público)
CREATE POLICY "businesses: owner full access"
  ON businesses FOR ALL
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "businesses: public read"
  ON businesses FOR SELECT
  TO authenticated
  USING (true);


-- ── employees ───────────────────────────────────────────────
-- Solo el dueño del negocio gestiona sus empleados
CREATE POLICY "employees: owner full access"
  ON employees FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM businesses
      WHERE businesses.id = employees.business_id
        AND businesses.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM businesses
      WHERE businesses.id = employees.business_id
        AND businesses.owner_id = auth.uid()
    )
  );

CREATE POLICY "employees: public read"
  ON employees FOR SELECT
  TO authenticated
  USING (true);


-- ── services ────────────────────────────────────────────────
-- Solo el dueño del negocio gestiona sus servicios
CREATE POLICY "services: owner full access"
  ON services FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM businesses
      WHERE businesses.id = services.business_id
        AND businesses.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM businesses
      WHERE businesses.id = services.business_id
        AND businesses.owner_id = auth.uid()
    )
  );

CREATE POLICY "services: public read"
  ON services FOR SELECT
  TO authenticated
  USING (true);


-- ── bookings ────────────────────────────────────────────────
-- El dueño del negocio ve y gestiona todas las reservas de su negocio
CREATE POLICY "bookings: owner full access"
  ON bookings FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM businesses
      WHERE businesses.id = bookings.business_id
        AND businesses.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM businesses
      WHERE businesses.id = bookings.business_id
        AND businesses.owner_id = auth.uid()
    )
  );

-- El cliente ve sus propias reservas
CREATE POLICY "bookings: client select own"
  ON bookings FOR SELECT
  USING (auth.uid() = client_id);

-- El cliente puede crear reservas
CREATE POLICY "bookings: client insert"
  ON bookings FOR INSERT
  WITH CHECK (auth.uid() = client_id);

-- El cliente solo puede cancelar (no cambiar otro campo)
CREATE POLICY "bookings: client cancel"
  ON bookings FOR UPDATE
  USING (auth.uid() = client_id)
  WITH CHECK (
    auth.uid() = client_id
    AND status = 'cancelled'
  );
