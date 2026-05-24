-- ============================================================
-- Zitly — Migración 004: hardening de seguridad
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- C1. Rate limiting a nivel de base de datos para INSERT en bookings.
--     Replica las protecciones de createBookingAction para cubrir
--     llamadas directas a la API REST de Supabase que esquivan
--     la Server Action (anon key es pública, cualquiera puede
--     llamar a la API REST directamente).
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION check_booking_rate_limit()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  email_count  INTEGER;
  biz_count    INTEGER;
  one_hour_ago TIMESTAMPTZ := now() - INTERVAL '1 hour';
BEGIN
  -- Máx. 5 reservas por email por hora
  IF NEW.client_email IS NOT NULL THEN
    SELECT COUNT(*) INTO email_count
    FROM bookings
    WHERE client_email = NEW.client_email
      AND created_at  >= one_hour_ago;
    IF email_count >= 5 THEN
      RAISE EXCEPTION 'rate_limit_email' USING ERRCODE = 'P0001';
    END IF;
  END IF;

  -- Máx. 20 reservas por negocio por hora
  SELECT COUNT(*) INTO biz_count
  FROM bookings
  WHERE business_id = NEW.business_id
    AND created_at  >= one_hour_ago;
  IF biz_count >= 20 THEN
    RAISE EXCEPTION 'rate_limit_business' USING ERRCODE = 'P0001';
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_booking_rate_limit
  BEFORE INSERT ON bookings
  FOR EACH ROW EXECUTE FUNCTION check_booking_rate_limit();


-- ────────────────────────────────────────────────────────────
-- C2. Restricción de columnas visibles para el rol anon.
--
--     Antes: SELECT * en businesses exponía phone, email, address
--     a cualquier usuario no autenticado.
--
--     Ahora: el rol anon solo puede leer id, name, category,
--     description — los únicos campos que consume /book/[businessId].
--     Los campos phone / email / address solo son accesibles por
--     el owner autenticado (cubierto por la RLS policy "owner full access").
--
--     Verificado: los únicos SELECT anónimos sobre businesses son
--     en /book/[businessId]/page.tsx → select('id, name, description').
-- ────────────────────────────────────────────────────────────
REVOKE SELECT ON businesses FROM anon;
GRANT  SELECT (id, name, category, description) ON businesses TO anon;
