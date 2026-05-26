---
name: security-audit
description: Use this skill when doing a security review, checking RLS policies, auditing Supabase configuration, or verifying env vars before a production deploy.
---

# Security audit for Zitly

## RLS checklist — run against every table

```sql
-- Check which tables have RLS disabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public' AND rowsecurity = false;

-- Check for overpermissive policies (auth.role instead of auth.uid)
SELECT tablename, policyname, qual
FROM pg_policies
WHERE qual LIKE '%auth.role%';
```

Correct pattern:

```sql
-- ✅ User sees only their own data
USING (auth.uid() = user_id)
-- ❌ Any authenticated user sees ALL rows
USING (auth.role() = 'authenticated')
```

## Admin client audit

Search codebase for `createSupabaseAdminClient` — should only appear in:

- `src/app/actions/booking.ts` (createBookingAction)
- `src/app/api/cron/reminders/route.ts`

If it appears anywhere else → immediate fix required.

## Env vars audit

NEXT*PUBLIC* vars that should NOT exist:

- `NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY` — if this exists, rotate key immediately
- `NEXT_PUBLIC_RESEND_API_KEY` — same
- `NEXT_PUBLIC_CRON_SECRET` — same

Safe to be public:

- `NEXT_PUBLIC_SUPABASE_URL` ✅
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` ✅
- `NEXT_PUBLIC_TURNSTILE_SITE_KEY` ✅

## Session / cookie refresh

Verify `src/proxy.ts` calls `supabase.auth.getUser()` and passes updated cookies back to the response. If not, users get randomly logged out in production.

## Pre-deploy checklist

- [ ] All tables have RLS enabled
- [ ] No overpermissive `auth.role()` policies
- [ ] Admin client only in cron + public booking
- [ ] No secrets with NEXT*PUBLIC* prefix
- [ ] `npm run build` passes with zero errors
- [ ] Next.js version is up to date (check for security advisories)
