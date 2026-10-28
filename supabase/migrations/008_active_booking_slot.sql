-- Zitly — Migración 008: unicidad de hueco solo para reservas activas, incluyendo "sin empleado".
-- Sustituye a unique_employee_slot (005). Requiere Postgres >= 15 (NULLS NOT DISTINCT).
-- Misma transacción: no hay ventana sin protección.

ALTER TABLE public.bookings
  DROP CONSTRAINT IF EXISTS unique_employee_slot;

CREATE UNIQUE INDEX IF NOT EXISTS uq_bookings_active_slot
  ON public.bookings (business_id, employee_id, date, time) NULLS NOT DISTINCT
  WHERE status <> 'cancelled';
