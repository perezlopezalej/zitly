-- ============================================================
-- Zitly — Migración 002: reservas públicas (sin cuenta)
-- Ejecutar en: Supabase SQL Editor
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- 1. Abrir lectura pública (rol anon) para la página de reservas
--    Antes: solo "authenticated". Ahora: cualquiera (true).
--
-- L2 NOTA DE SEGURIDAD: esta política expone a usuarios anónimos los campos
-- públicos de businesses (incluidos phone, email, address si existen).
-- Si estos campos contienen datos privados del dueño, considera añadir
-- columnas separadas para el contacto público y restringir las privadas.
-- ────────────────────────────────────────────────────────────
DROP POLICY "businesses: public read" ON businesses;
CREATE POLICY "businesses: public read"
  ON businesses FOR SELECT
  USING (true);

DROP POLICY "employees: public read" ON employees;
CREATE POLICY "employees: public read"
  ON employees FOR SELECT
  -- INTENCIONADO: el flujo /book necesita listar empleados sin autenticación
  -- para que el cliente elija profesional al reservar. Ver booking.ts.
  USING (true);

DROP POLICY "services: public read" ON services;
CREATE POLICY "services: public read"
  ON services FOR SELECT
  -- INTENCIONADO: el selector de servicios en /book es público.
  USING (true);

-- ────────────────────────────────────────────────────────────
-- 2. Extender tabla bookings para reservas anónimas
-- ────────────────────────────────────────────────────────────
ALTER TABLE bookings
  ALTER COLUMN client_id DROP NOT NULL,
  ADD COLUMN client_name  TEXT,
  ADD COLUMN client_email TEXT;

-- ────────────────────────────────────────────────────────────
-- 3. Reemplazar la política de insert de clientes por dos:
--    una anónima y otra autenticada
-- ────────────────────────────────────────────────────────────
DROP POLICY "bookings: client insert" ON bookings;

-- Reserva sin cuenta: client_id nulo, nombre y email obligatorios
CREATE POLICY "bookings: anonymous insert"
  ON bookings FOR INSERT
  WITH CHECK (
    client_id IS NULL
    AND client_name  IS NOT NULL
    AND client_email IS NOT NULL
  );

-- Reserva con cuenta: client_id debe coincidir con el usuario autenticado
CREATE POLICY "bookings: client insert"
  ON bookings FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND client_id = auth.uid()
  );
