-- Zitly — Migración 007: columnas que el código usa y que ninguna migración creaba.
-- Idempotente: en una BD donde ya existen (producción) no hace nada.
-- Tipos alineados con producción: las horas son TEXT 'HH:MM', no TIME.

ALTER TABLE public.businesses
  ADD COLUMN IF NOT EXISTS opening_time  TEXT DEFAULT '09:00',
  ADD COLUMN IF NOT EXISTS closing_time  TEXT DEFAULT '18:00',
  ADD COLUMN IF NOT EXISTS contact_email TEXT,
  ADD COLUMN IF NOT EXISTS active_days   TEXT[]
    DEFAULT ARRAY['monday','tuesday','wednesday','thursday','friday'];

ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS service_name TEXT;

-- Rellenar el nombre del servicio en reservas antiguas (idempotente: solo toca NULL).
-- El cron de recordatorios usa service_name, y el dashboard cae a services(name).
UPDATE public.bookings b
SET    service_name = s.name
FROM   public.services s
WHERE  s.id = b.service_id
  AND  b.service_name IS NULL;

-- Que PostgREST vea las columnas nuevas sin esperar.
NOTIFY pgrst, 'reload schema';
