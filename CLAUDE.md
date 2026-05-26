# CLAUDE.md

> **CRITICAL — Next.js 16 breaking changes:**
> `cookies()`, `headers()`, `params`, `searchParams` are ALL async — always `await` them.
> Caching is **opt-in** (`'use cache'`), not opt-out.
> Middleware file is `src/proxy.ts`, NOT `middleware.ts`.

```ts
// ✅ CORRECT — params and searchParams must be awaited
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
}
// ✅ CORRECT — cookies must be awaited
const cookieStore = await cookies()
// ❌ WRONG — synchronous access (Next.js 14/15 pattern, breaks here)
const { id } = params
```

## Commands

```bash
npm run dev      # dev server localhost:3000 (Turbopack)
npm run build    # production build — run before finishing any task
npm run lint     # ESLint
npx vitest run <path>  # ALWAYS run single test file, never npm run test
```

## Architecture

Zitly is a booking SaaS. Businesses share `/book/[businessId]` — clients book
without auth. Dashboard at `/dashboard/*` requires auth via `proxy.ts`.

### Key flows

**Public booking** (`/book/[businessId]`): `BookingFlow.tsx` calls `createBookingAction`
— uses admin client (no auth). Slots from `BOOKING_SLOT_INTERVAL` (30 min) against
`opening_time`/`closing_time`. Rate limiting: 5 bookings/email/hr, 20/business/hr.

**Dashboard** (`/dashboard/*`): Protected by `proxy.ts`. Mutations via Server Actions
in `src/app/actions/` using `getBusiness()` for auth.

**Cron reminders**: Vercel runs `GET /api/cron/reminders` daily at 09:00 UTC.
Authenticated via `Authorization: Bearer $CRON_SECRET`.

### Supabase clients — use the right one

| Client | Function | When |
|--------|----------|------|
| `createSupabaseBrowserClient()` | Browser | Client components only |
| `createSupabaseServerClient()` | Server | Server components, Server Actions needing auth |
| `createSupabaseAdminClient()` | Admin — bypasses RLS | Cron routes, public booking ONLY |

### Server Action pattern — always use this

```ts
'use server'
import { getBusiness } from '@/lib/actions'
import { isRedirectError } from 'next/dist/client/components/redirect-error'

let supabase, businessId
try {
  ;({ supabase, businessId } = await getBusiness())
} catch (e) {
  if (isRedirectError(e)) throw e
  return { error: 'Error de conexión. Inténtalo de nuevo.' }
}
```

`ActionResult = { error: string } | undefined` — standard return type for all mutations.

### Email

`src/lib/email.ts` — three functions via Resend + react-email:
- `sendWelcomeEmail` — on register
- `sendBookingConfirmationEmail` — fire-and-forget: `void fn().catch(() => {})`
- `sendReminderEmail` — called by cron

`RESEND_API_KEY` absent = soft failure (emails silently skipped).

### Preventing deletion with active bookings

Call `countActiveBookings(supabase, column, id, businessId)` from `src/lib/booking.ts`
before deleting a service or employee.

## Rules

- No `any`, no hardcoded secrets, no explicit `import React`
- DB errors never reach the client — generic messages in Spanish only
- All domain types from `src/types/index.ts`
- `cn()` from `src/lib/utils.ts` for conditional Tailwind classes
- `bg-linear-to-*` not `bg-gradient-to-*` (Tailwind v4)

## Security — non-negotiable

**RLS policies — always `auth.uid()`, never `auth.role()`:**
```sql
-- ✅ User sees only their own data
USING (auth.uid() = user_id)
-- ❌ Any logged-in user sees ALL rows (AI default, wrong)
USING (auth.role() = 'authenticated')
```

**Admin client bypasses ALL RLS — only allowed in:**
- `/api/cron/reminders`
- `createBookingAction` (public booking, no auth context)
Never in dashboard routes or client components.

## Double booking prevention

`createBookingAction` must be atomic. Never check slot availability and then
insert in two separate queries — race condition allows two users to book the same slot.
The DB enforces a `UNIQUE` constraint on `(employee_id, start_time)` — handle
the conflict error explicitly, never silently ignore it.

## Workflow

- Before implementing anything: always plan first using Plan Mode (Ctrl+P)
- Run `npm run lint` then `npm run build` — zero errors before task is done
- Commit each logical change separately, not everything bundled
- Branch naming: `feat/`, `fix/`, `chore/` + short description