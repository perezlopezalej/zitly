-- ============================================================
-- Zitly — Migración 003: correcciones de seguridad
-- Ejecutar en: Supabase SQL Editor
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- C1. Reforzar política de insert anónimo en bookings:
--     el service_id debe pertenecer al business_id indicado,
--     igual que el employee_id cuando se especifica.
-- ────────────────────────────────────────────────────────────
DROP POLICY "bookings: anonymous insert" ON bookings;

CREATE POLICY "bookings: anonymous insert"
  ON bookings FOR INSERT
  WITH CHECK (
    client_id    IS NULL
    AND client_name  IS NOT NULL
    AND client_email IS NOT NULL
    -- El servicio debe pertenecer al negocio de la reserva
    AND EXISTS (
      SELECT 1 FROM services
      WHERE services.id          = bookings.service_id
        AND services.business_id = bookings.business_id
    )
    -- Si se indica empleado, también debe pertenecer al negocio
    AND (
      bookings.employee_id IS NULL
      OR EXISTS (
        SELECT 1 FROM employees
        WHERE employees.id          = bookings.employee_id
          AND employees.business_id = bookings.business_id
      )
    )
  );
