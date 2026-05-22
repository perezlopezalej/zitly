import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest'

// Mocked before booking.ts is imported so module-level side effects
// (env var guards in supabase.ts, next/* internals) never run.
vi.mock('@/lib/supabase', () => ({
  createSupabaseServerClient: vi.fn(),
}))

vi.mock('@/lib/actions', () => ({
  getBusiness: vi.fn(),
}))

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

import { createSupabaseServerClient } from '@/lib/supabase'
import { createBookingAction, type CreateBookingInput } from '../booking'

// ─── Supabase chain mock ────────────────────────────────────────────────────
// Mimics the builder API: .from().select().eq().gte() and
// .from().insert().select().single() without requiring a real client.

const mockInsertChain: any = {
  select: vi.fn().mockReturnThis(),
  single: vi.fn().mockResolvedValue({
    data: { id: 'b-1', date: '2026-06-01', time: '10:00' },
    error: null,
  }),
}

const mockQueryChain: any = {
  select: vi.fn().mockReturnThis(),
  eq:     vi.fn().mockReturnThis(),
  gte:    vi.fn().mockResolvedValue({ count: 0 }),
  single: vi.fn().mockResolvedValue({ data: { id: 'svc-1' }, error: null }),
  insert: vi.fn().mockReturnValue(mockInsertChain),
}

const mockSupabase = { from: vi.fn().mockReturnValue(mockQueryChain) }

// ─── Shared test setup ───────────────────────────────────────────────────────
// Pin system time to a known date so comparisons against "today" are stable.
const TODAY = '2026-05-22'

beforeAll(() => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date(TODAY))
  vi.mocked(createSupabaseServerClient).mockResolvedValue(mockSupabase as any)
})

afterAll(() => {
  vi.useRealTimers()
})

const VALID_INPUT: CreateBookingInput = {
  businessId:  'biz-1',
  serviceId:   'svc-1',
  employeeId:  null,
  date:        '2026-06-01',
  time:        '10:00',
  clientName:  'Ana García',
  clientEmail: 'ana@example.com',
}

// ─── Date validation ────────────────────────────────────────────────────────

describe('createBookingAction — date validation', () => {
  it('rejects a date in the past', async () => {
    const result = await createBookingAction({ ...VALID_INPUT, date: '2026-05-21' })
    expect(result).toEqual({ error: 'La fecha no puede ser en el pasado' })
  })

  it('accepts today as a valid date', async () => {
    const result = await createBookingAction({ ...VALID_INPUT, date: TODAY })
    expect(result.error).not.toBe('La fecha no puede ser en el pasado')
  })

  it('rejects a date more than one year in the future', async () => {
    const result = await createBookingAction({ ...VALID_INPUT, date: '2027-05-23' })
    expect(result).toEqual({ error: 'La fecha no puede ser superior a un año desde hoy' })
  })

  it('accepts a date exactly one year from today', async () => {
    const result = await createBookingAction({ ...VALID_INPUT, date: '2027-05-22' })
    expect(result.error).not.toBe('La fecha no puede ser superior a un año desde hoy')
  })
})

// ─── Email validation ───────────────────────────────────────────────────────

describe('createBookingAction — email validation', () => {
  it('rejects an email without @', async () => {
    const result = await createBookingAction({ ...VALID_INPUT, clientEmail: 'not-an-email' })
    expect(result).toEqual({ error: 'Email no válido' })
  })

  it('rejects an email without domain after @', async () => {
    const result = await createBookingAction({ ...VALID_INPUT, clientEmail: 'user@' })
    expect(result).toEqual({ error: 'Email no válido' })
  })

  it('rejects an empty email', async () => {
    const result = await createBookingAction({ ...VALID_INPUT, clientEmail: '' })
    expect(result).toEqual({ error: 'Email no válido' })
  })
})

// ─── Time range validation (09:00 – 17:30) ─────────────────────────────────

describe('createBookingAction — time range validation', () => {
  it('rejects a time before 09:00', async () => {
    const result = await createBookingAction({ ...VALID_INPUT, time: '08:00' })
    expect(result.error).toMatch(/09:00/)
  })

  it('rejects 18:00 (exclusive upper bound)', async () => {
    const result = await createBookingAction({ ...VALID_INPUT, time: '18:00' })
    expect(result.error).toMatch(/09:00/)
  })

  it('rejects a time after 18:00', async () => {
    const result = await createBookingAction({ ...VALID_INPUT, time: '19:00' })
    expect(result.error).toMatch(/09:00/)
  })

  it('accepts 09:00 as the earliest valid slot', async () => {
    const result = await createBookingAction({ ...VALID_INPUT, time: '09:00' })
    expect(result).toHaveProperty('booking')
  })

  it('accepts 17:30 as the last valid slot', async () => {
    const result = await createBookingAction({ ...VALID_INPUT, time: '17:30' })
    expect(result).toHaveProperty('booking')
  })
})

// ─── Client name validation ─────────────────────────────────────────────────

describe('createBookingAction — client name validation', () => {
  it('rejects an empty name', async () => {
    const result = await createBookingAction({ ...VALID_INPUT, clientName: '' })
    expect(result).toEqual({ error: 'Nombre no válido' })
  })

  it('rejects a name that is only whitespace', async () => {
    const result = await createBookingAction({ ...VALID_INPUT, clientName: '   ' })
    expect(result).toEqual({ error: 'Nombre no válido' })
  })
})
