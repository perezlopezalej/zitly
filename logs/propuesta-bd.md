# Propuesta de BD para Zitly (solo propuesta, nada aplicado)

Basada en `AUDITORIA.md` (secciones 1.3, 3.2 y 4) y en la lectura de `supabase/migrations/001..006` y del código de `src/`.
No se ha consultado la base de datos remota ni se ha tocado ningún archivo salvo este. **El SQL de abajo no está probado.**

Orden sugerido (cada una es un commit/migración lógica por separado):

| Migración | Contenido | Depende de |
|---|---|---|
| `007_missing_columns.sql` | Punto 1 | nada |
| `008_active_booking_slot.sql` | Punto 2 | comprobar duplicados antes |
| `009_anon_businesses_grants.sql` | Punto 3 | resultado de la consulta de comprobación |

---

## 1. Columnas que faltan

### Qué falta y quién las usa

| Columna | Usada en | Nota |
|---|---|---|
| `businesses.opening_time` | `book/[businessId]/page.tsx:19`, `actions/booking.ts:57`, `actions/business.ts:79`, `dashboard/settings/page.tsx:14` | |
| `businesses.closing_time` | idem | |
| `businesses.contact_email` | `actions/booking.ts:57`, `actions/business.ts:38`, `dashboard/settings/page.tsx:14` | La tabla de `001` tiene `email`, que **ningún código lee ni escribe**; `contact_email` es otra columna. |
| `bookings.service_name` | `actions/booking.ts:151`, `api/cron/reminders/route.ts:25`, `dashboard/page.tsx:41`, `dashboard/reservations/page.tsx:94` | Copia del nombre del servicio en el momento de reservar. |
| **`businesses.active_days`** | `actions/business.ts:79`, `dashboard/settings/page.tsx:14`, `ScheduleForm.tsx:41` | **No estaba en tu lista ni en la auditoría**, pero tampoco la crea ninguna migración. Sin ella, guardar el horario (`updateScheduleAction`) falla. La incluyo. |

### Tipos elegidos

- `opening_time` / `closing_time`: `TIME`, nullable. El código ya trata `null` como 09:00–18:00 (`parseBookingHours`), así que no hace falta `DEFAULT`. Postgres devuelve `'09:00:00'`; `parseBookingHours` y `<input type="time">` lo aceptan.
- `contact_email`, `service_name`: `TEXT`, nullable (los tipos de `src/types` ya son `string | null`).
- `active_days`: `TEXT[]`, nullable. El código usa nombres en inglés en minúscula (`'monday'`…) y trata `null` como lunes–viernes.

> **Antes de commitear esta migración**, comprueba el tipo real en la BD viva (consulta 1.B). `ADD COLUMN IF NOT EXISTS` no cambia una columna ya existente: si en producción `opening_time` es `TEXT`, la migración del repo diría `TIME` y volvería a haber deriva. En ese caso, ajusta el tipo del repo al de producción.

### SQL propuesto: `007_missing_columns.sql`

```sql
-- Zitly — Migración 007: columnas que el código usa y que ninguna migración creaba.
-- Idempotente: en una BD donde ya se añadieron a mano no hace nada.

ALTER TABLE public.businesses
  ADD COLUMN IF NOT EXISTS opening_time  TIME,
  ADD COLUMN IF NOT EXISTS closing_time  TIME,
  ADD COLUMN IF NOT EXISTS contact_email TEXT,
  ADD COLUMN IF NOT EXISTS active_days   TEXT[];

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
```

Opcional (no incluido arriba porque puede fallar si ya hay datos incoherentes):

```sql
-- ALTER TABLE public.businesses
--   ADD CONSTRAINT businesses_hours_check
--   CHECK (opening_time IS NULL OR closing_time IS NULL OR opening_time < closing_time) NOT VALID;
```

### 1.B Consulta de solo lectura: estado real de esas columnas

```sql
SELECT table_name, column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND (table_name, column_name) IN (
    ('businesses','opening_time'), ('businesses','closing_time'),
    ('businesses','contact_email'), ('businesses','active_days'),
    ('bookings','service_name')
  )
ORDER BY table_name, column_name;
```

Si devuelve menos de 5 filas, las que falten no existen en la BD viva.

---

## 2. Doble reserva sin empleado + huecos cancelados

### Diagnóstico

La restricción actual (`005`) es `UNIQUE (employee_id, date, time)` y tiene dos problemas:

1. **`employee_id` NULL**: en Postgres los NULL son distintos entre sí, así que no protege las reservas sin empleado. En `actions/booking.ts:127-144` esas reservas solo se protegen con un `SELECT count` previo y luego `INSERT`: dos peticiones simultáneas pasan ambas el chequeo.
2. **Canceladas**: la restricción cuenta reservas `cancelled`, pero el chequeo previo las ignora (`.neq('status','cancelled')`). Un hueco cancelado pasa el chequeo y luego el insert falla con 23505 (mensaje "ya no está disponible").

### Solución: un único índice único parcial, que sustituye a la restricción

Una restricción `UNIQUE` no puede ser parcial, así que hay que borrarla y crear un índice. Un solo índice resuelve ambos problemas:

- `WHERE status <> 'cancelled'` → las canceladas dejan de ocupar hueco.
- `NULLS NOT DISTINCT` (Postgres ≥ 15) → dos reservas sin empleado en el mismo negocio/fecha/hora colisionan.
- `business_id` en la clave → "sin empleado" significa "una por hueco **por negocio**" (sin él, dos negocios distintos chocarían entre sí).

Comprobar la versión: `SHOW server_version_num;` (≥ 150000). Supabase lleva años en 15+, pero conviene mirarlo.

### Comprobar antes de aplicar (solo lectura)

Si ya hay duplicados activos (posible, porque el caso NULL nunca estuvo protegido), la creación del índice **fallará**. Hay que resolverlos antes (cancelar o mover una de las reservas):

```sql
SELECT business_id, employee_id, date, time, count(*) AS n, array_agg(id) AS booking_ids
FROM public.bookings
WHERE status <> 'cancelled'
GROUP BY business_id, employee_id, date, time   -- GROUP BY trata los NULL como iguales
HAVING count(*) > 1;
```

### SQL propuesto: `008_active_booking_slot.sql`

```sql
-- Zitly — Migración 008: unicidad de hueco solo para reservas activas, incluyendo "sin empleado".
-- Sustituye a unique_employee_slot (005). Mismo commit, misma transacción: no hay ventana sin protección.

ALTER TABLE public.bookings
  DROP CONSTRAINT IF EXISTS unique_employee_slot;

CREATE UNIQUE INDEX IF NOT EXISTS uq_bookings_active_slot
  ON public.bookings (business_id, employee_id, date, time) NULLS NOT DISTINCT
  WHERE status <> 'cancelled';
```

Alternativa si el servidor fuese < 15 (misma semántica, sin `NULLS NOT DISTINCT`):

```sql
CREATE UNIQUE INDEX IF NOT EXISTS uq_bookings_active_slot
  ON public.bookings (
    business_id,
    COALESCE(employee_id, '00000000-0000-0000-0000-000000000000'::uuid),
    date, time
  )
  WHERE status <> 'cancelled';
```

Los estados `pending`, `confirmed` y `completed` ocupan hueco; solo `cancelled` lo libera (igual que `countActiveBookings` en `lib/booking.ts:36`).

### Cambios necesarios en el código

1. **`src/app/actions/booking.ts:127-144` (conflictQuery): eliminar el chequeo previo.** Con el índice, la BD es el árbitro y el `SELECT count` es justo el patrón "comprobar y luego insertar" que `CLAUDE.md` prohíbe. El manejo de `23505` (líneas 164-166) ya existe y cubre ahora también el caso sin empleado. Efecto lateral bueno: una consulta menos por reserva.
2. **`src/app/actions/booking.ts:208-214` (`updateBookingStatusAction`): manejar `23505`.** Esto es nuevo con el índice parcial: la acción permite pasar a `confirmed` desde cualquier estado, incluido `cancelled`. Si el hueco de una reserva cancelada ya lo ocupó otra persona, "reactivarla" viola el índice y hoy mostraría el genérico "Error al actualizar la reserva". Propuesta: `if (error.code === '23505') return { error: 'Ese horario ya está reservado por otra persona.' }` (mensaje en español, sin detalle de BD).
3. **Tests** (`src/app/actions/__tests__/booking.test.ts`):
   - El test de `23505` existente (línea 192) ya usa `employeeId: null`, así que cubre el caso sin empleado; añadir uno gemelo con `employeeId` informado.
   - Los mocks actuales toleran quitar el chequeo previo (`conflictQuery` no se afirma en ningún test), pero conviene un test que verifique que ya no se hace esa consulta.
   - Test nuevo para el `23505` de `updateBookingStatusAction` (`CLAUDE.md`: toda acción sobre `bookings` necesita test de conflicto UNIQUE).
4. **`CLAUDE.md`**: la sección "Double booking prevention" menciona `UNIQUE (employee_id, date, time)`; actualizar al índice parcial.
5. **Sin cambios** en `BookingFlow.tsx` (no consulta huecos ocupados), en tipos ni en `countActiveBookings`.

### Límites que este índice no resuelve (solo para tener en cuenta)

- Solo compara la **hora de inicio**: un servicio de 60 min a las 09:00 y otra reserva a las 09:30 del mismo empleado no colisionan, aunque se solapen. Resolverlo exigiría una `EXCLUDE USING gist` con rangos (`btree_gist`); es un cambio mayor.
- "Sin empleado" y "con empleado" en la misma hora no colisionan entre sí (igual que hoy).
- `bookings.employee_id` es `ON DELETE SET NULL`: borrar un empleado pasa sus reservas a "sin empleado" y ahora podrían colisionar. La app lo evita porque `countActiveBookings` bloquea el borrado si tiene reservas no canceladas (las `completed` cuentan), y las canceladas no entran en el índice. Solo sería un problema borrando empleados por SQL directo.

---

## 3. Permisos de `anon` sobre `businesses`

### Diagnóstico

- `004` hizo `REVOKE SELECT ON businesses FROM anon` y `GRANT SELECT (id, name, category, description) ... TO anon`. Su comentario dice que `/book` solo lee `id, name, description`, pero hoy `/book` lee **`id, name, description, opening_time, closing_time`** (`book/[businessId]/page.tsx:19`).
- Como el `REVOKE` quitó el permiso a nivel de tabla, las columnas añadidas después **no heredan ningún permiso para `anon`**. Si en la BD viva nadie hizo un `GRANT` manual sobre `opening_time`/`closing_time`, PostgREST devuelve error de permisos, `.single()` da `data: null` y la página hace `notFound()`.
- Pasa **solo con visitantes sin sesión**. Si el propio dueño abre `/book/...` con sesión iniciada, la consulta va como `authenticated` (con permisos completos) y funciona, así que es fácil que no se haya notado.
- Único consumidor anónimo de `businesses` en `src/`: `/book/[businessId]/page.tsx`. `createBookingAction` usa el cliente admin (no depende de estos permisos); el resto de lecturas son del dueño, autenticado.
- `category` está concedida a `anon` pero `/book` no la usa. No es sensible; decide si quitarla (mínimo privilegio) o dejarla.

### Consulta de solo lectura para el SQL Editor

Muestra todas las columnas de `businesses`, si `anon` puede leerlas (permisos efectivos, tabla o columna) y si `/book` las necesita. También avisa de columnas que `/book` necesita y no existen:

```sql
WITH needed(column_name) AS (
  VALUES ('id'), ('name'), ('description'), ('opening_time'), ('closing_time')
),
cols AS (
  SELECT a.attname::text AS column_name,
         a.attnum,
         has_column_privilege('anon', 'public.businesses'::regclass, a.attnum, 'SELECT') AS anon_can_read
  FROM pg_attribute a
  WHERE a.attrelid = 'public.businesses'::regclass
    AND a.attnum > 0
    AND NOT a.attisdropped
)
SELECT COALESCE(c.column_name, n.column_name) AS column_name,
       (c.column_name IS NOT NULL)            AS exists_in_db,
       c.anon_can_read,
       (n.column_name IS NOT NULL)            AS needed_by_book,
       CASE
         WHEN c.column_name IS NULL                                 THEN 'NO EXISTE en la BD (falta migración 007)'
         WHEN n.column_name IS NOT NULL AND NOT c.anon_can_read     THEN 'FALTA GRANT: /book falla para visitantes'
         WHEN n.column_name IS NULL     AND c.anon_can_read         THEN 'Anon la lee pero /book no la necesita'
         WHEN n.column_name IS NOT NULL                             THEN 'OK'
         ELSE 'OK (privada)'
       END AS estado
FROM cols c
FULL JOIN needed n ON n.column_name = c.column_name
ORDER BY c.attnum NULLS LAST, 1;
```

Cómo leerla:
- `FALTA GRANT` en `opening_time` / `closing_time` → confirma el 404 en `/book` para visitantes.
- Cualquier fila `Anon la lee…` en `phone`, `address`, `contact_email`, `email` u `owner_id` sería una **fuga**; `category` es aceptable.

Dos comprobaciones complementarias (también solo lectura):

```sql
-- Políticas RLS de businesses (una fila con roles {public} y qual = true permite leer filas a anon)
SELECT policyname, cmd, roles, qual
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'businesses';

-- Versión del servidor (para elegir variante del índice del punto 2)
SHOW server_version_num;
```

### SQL propuesto: `009_anon_businesses_grants.sql` (aplicar según el resultado)

```sql
-- Zitly — Migración 009: permisos de anon sobre businesses = exactamente lo que lee /book.
-- Repetible: REVOKE de tabla también retira los permisos de columna previos.
REVOKE SELECT ON public.businesses FROM anon;
GRANT  SELECT (id, name, description, opening_time, closing_time)
  ON public.businesses TO anon;
-- category queda fuera: /book no la usa. Añadirla aquí si se prefiere mantener lo de 004.
```

Aplicar solo **después** de `007` (si una columna no existe, el `GRANT` falla). Si la consulta ya muestra todo `OK`, esta migración no cambia nada pero deja el repo reproducible; en ese caso conviene también corregir el comentario obsoleto de `004` (dice `select('id, name, description')`).

---

## Resumen de impacto en código

| Archivo | Cambio | Punto |
|---|---|---|
| `src/app/actions/booking.ts` | borrar chequeo previo (L127-144) | 2 |
| `src/app/actions/booking.ts` | manejar `23505` en `updateBookingStatusAction` | 2 |
| `src/app/actions/__tests__/booking.test.ts` | tests nuevos de conflicto (con empleado, estado) | 2 |
| `CLAUDE.md` | actualizar descripción de la restricción | 2 |
| Resto de `src/` | ninguno | 1, 3 |
