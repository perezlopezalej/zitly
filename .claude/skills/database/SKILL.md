---
name: database
description: Use this skill when writing SQL migrations, modifying the Supabase schema, adding RLS policies, or working with database types and queries.
---

# Database in Zitly

## Migration conventions

- Files in `supabase/migrations/` — format: `NNN_description.sql`
- Next migration number: check last file in the folder
- Always include both the change AND the RLS policy in the same migration

## Supabase client to use for queries

| Context                  | Client                          |
| ------------------------ | ------------------------------- |
| Dashboard Server Actions | `createSupabaseServerClient()`  |
| Public booking           | `createSupabaseAdminClient()`   |
| Cron routes              | `createSupabaseAdminClient()`   |
| Client components        | `createSupabaseBrowserClient()` |

## RLS policy template

```sql
-- Enable RLS
ALTER TABLE public.table_name ENABLE ROW LEVEL SECURITY;

-- Owner can read their own data
CREATE POLICY "owner_select" ON public.table_name
  FOR SELECT USING (auth.uid() = user_id);

-- Owner can insert
CREATE POLICY "owner_insert" ON public.table_name
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Owner can update
CREATE POLICY "owner_update" ON public.table_name
  FOR UPDATE USING (auth.uid() = user_id);

-- Owner can delete (only if no active bookings)
CREATE POLICY "owner_delete" ON public.table_name
  FOR DELETE USING (auth.uid() = user_id);
```

## Double booking prevention

Any table storing bookings MUST have:

```sql
ALTER TABLE public.bookings
  ADD CONSTRAINT unique_employee_slot
  UNIQUE (employee_id, date, time);
```

Handle the `23505` error explicitly in the Server Action — never silently ignore it.

## TypeScript types

All domain types in `src/types/index.ts` — never define inline types for DB entities.
Generate updated types after schema changes:

```bash
npx supabase gen types typescript --project-id gypbzgwnjfqbzustdqei > src/types/database.ts
```
