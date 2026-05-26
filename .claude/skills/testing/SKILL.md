---
name: testing
description: Use this skill when writing, fixing, or expanding tests in Vitest. Covers patterns, mock structure, fake timers, and what to test in this project.
---

# Testing in Zitly

## What to test

- Pure logic and utilities in `src/lib/__tests__/`
- Server Actions in `src/app/actions/__tests__/`
- DO NOT try to test async Server Components — use Playwright for those

## Running tests

```bash
npx vitest run src/lib/__tests__/validation.test.ts  # single file
npx vitest run src/app/actions/__tests__/            # actions suite
```

## Mock structure — always recreate in beforeEach

```ts
function buildMocks() {
  const mockInsertChain = {
    select: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: { id: "x" }, error: null }),
  };
  const mockQueryChain = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    gte: vi.fn().mockResolvedValue({ count: 0 }),
    insert: vi.fn().mockReturnValue(mockInsertChain),
  };
  return {
    mockQueryChain,
    mockSupabase: { from: vi.fn().mockReturnValue(mockQueryChain) },
  };
}
```

## Fake timers — always beforeEach/afterEach, never beforeAll

```ts
beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-06-01"));
  const { mockSupabase } = buildMocks();
  vi.mocked(createSupabaseServerClient).mockResolvedValue(
    mockSupabase as never,
  );
});
afterEach(() => {
  vi.useRealTimers();
  vi.clearAllMocks();
});
```

## Mandatory tests for booking actions

- Date in the past → rejected
- Date > 1 year → rejected
- Invalid email → rejected
- UNIQUE constraint violation (code `23505`) → generic Spanish error, never raw DB error
- Happy path → returns booking object

## Error codes to handle

- `23505` — UNIQUE constraint (double booking)
- `23503` — Foreign key violation
- Always return generic Spanish message, never the raw Postgres error
