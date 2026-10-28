# CLAUDE.md

> **Next.js 16 — cambios críticos:**
> `cookies()`, `headers()`, `params`, `searchParams` son async — siempre `await`.
> El caché es opt-in (`'use cache'`). El middleware es `src/proxy.ts`, NO `middleware.ts`.
> Ante dudas de API, lee `node_modules/next/dist/docs/` (ver AGENTS.md).

## Commands

```bash
npm run dev      # localhost:3000
npm run build    # ejecutar antes de dar una tarea por terminada
npm run lint
npx vitest run <path>  # SIEMPRE un solo archivo, nunca npm run test
```

## Architecture

Zitly es un SaaS de reservas. Los negocios comparten `/book/[businessId]` (reserva
sin auth). `/dashboard/*` requiere auth vía `proxy.ts`. Env vars: ver `.env.example`.

- **Reserva pública**: `BookingFlow.tsx` → `createBookingAction` (admin client). Slots
  cada `BOOKING_SLOT_INTERVAL` (30 min) entre `opening_time`/`closing_time`. Rate
  limit: 5 reservas/email/h y 20/negocio/h.
- **Dashboard**: mutaciones con Server Actions en `src/app/actions/`, auth con `getBusiness()`.
- **Cron**: `GET /api/cron/reminders` (Vercel, diario 09:00 UTC), `Authorization: Bearer $CRON_SECRET`.
- **Auth**: CAPTCHA Turnstile opcional en login/registro/reset (`NEXT_PUBLIC_TURNSTILE_SITE_KEY`).
- **Migraciones**: `supabase/migrations/001–009`; la siguiente es la 010.

### Supabase clients

| Client                          | Cuándo                                         |
| ------------------------------- | ---------------------------------------------- |
| `createSupabaseBrowserClient()` | Solo client components                         |
| `createSupabaseServerClient()`  | Server components y Server Actions con auth    |
| `createSupabaseAdminClient()`   | Salta RLS. SOLO en `/api/cron/reminders` y `createBookingAction` |

Nunca el admin client en rutas del dashboard ni en client components.

### Server Action pattern

```ts
"use server";
let supabase, businessId;
try {
  ({ supabase, businessId } = await getBusiness());
} catch (e) {
  if (isRedirectError(e)) throw e; // from "next/dist/client/components/redirect-error"
  return { error: "Error de conexión. Inténtalo de nuevo." };
}
```

`ActionResult = { error: string } | undefined` (en `src/types/index.ts`) es el retorno estándar de las mutaciones.

### Email

`src/lib/email.ts` (Resend + react-email, plantillas en `src/lib/emails/`):
`sendWelcomeEmail` (registro, con `.catch`), `sendBookingConfirmationEmail`
(fire-and-forget: `void fn().catch(() => {})`) y `sendReminderEmail` (cron).
Sin `RESEND_API_KEY` los emails se omiten sin error.

### Borrado con reservas activas

Llamar a `countActiveBookings(supabase, column, id, businessId)` (`src/lib/booking.ts`)
antes de borrar un servicio o empleado.

## Rules

- Sin `any`, sin secretos hardcodeados, sin `import React` explícito
- Los errores de BD nunca llegan al cliente: solo mensajes genéricos en español
- Tipos de dominio desde `src/types/index.ts`
- `cn()` de `src/lib/utils.ts` para clases Tailwind condicionales
- `bg-linear-to-*`, no `bg-gradient-to-*` (Tailwind v4)

## Security

**RLS: siempre `auth.uid() = user_id`, nunca `auth.role() = 'authenticated'`**
(esto último deja a cualquier usuario logueado ver todas las filas).

## Double booking

`createBookingAction` debe ser atómico: nunca comprobar disponibilidad y luego insertar
en dos consultas. El índice parcial único `uq_bookings_active_slot` (migración 008) sobre
`(business_id, employee_id, date, time) NULLS NOT DISTINCT WHERE status <> 'cancelled'`
es el árbitro. Tratar explícitamente el error `23505` en `createBookingAction` y
`updateBookingStatusAction`; nunca ignorarlo.

## Tests

Vitest + jsdom, solo lógica pura y actions (los Server Components async no se testean).
Archivos en `src/lib/__tests__/` y `src/app/actions/__tests__/`.

- `beforeEach`/`afterEach` para fake timers, nunca `beforeAll`/`afterAll`
- Recrear los mocks en `beforeEach`; no compartir estado entre tests
- Toda action que toque `bookings` DEBE tener un test del conflicto UNIQUE (23505)

## Workflow

- Planificar antes de implementar (Plan Mode)
- `npm run lint` y luego `npm run build`, sin errores, antes de terminar
- Un commit por cambio lógico; ramas `feat/`, `fix/`, `chore/` + descripción corta
