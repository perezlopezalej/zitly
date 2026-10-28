-- Zitly — Migración 009: permisos de anon sobre businesses = exactamente lo que lee /book.
-- Repetible: el REVOKE de tabla también retira los permisos de columna previos.
-- Aplicar después de 007 (si una columna no existe, el GRANT falla).
REVOKE SELECT ON public.businesses FROM anon;
GRANT  SELECT (id, name, description, opening_time, closing_time)
  ON public.businesses TO anon;
