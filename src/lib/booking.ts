import type { SupabaseClient } from '@supabase/supabase-js'

export const BOOKING_HOURS_START = 9   // 09:00
export const BOOKING_HOURS_END   = 18  // 18:00 (exclusive upper bound)

export const BOOKING_SLOT_INTERVAL = 30 // minutes between available slots

/** Returns business open/close as total minutes from midnight (e.g. "09:30" → 570). */
export function parseBookingHours(
  opening_time?: string | null,
  closing_time?: string | null,
): { start: number; end: number } {
  const toMinutes = (t: string) => {
    const [h, m] = t.split(':').map(Number)
    return h * 60 + (m ?? 0)
  }
  const start = opening_time ? toMinutes(opening_time) : BOOKING_HOURS_START * 60
  const end   = closing_time ? toMinutes(closing_time) : BOOKING_HOURS_END * 60
  return { start, end }
}

export const ALLOWED_STATUS_TRANSITIONS = ['confirmed', 'cancelled'] as const
export type AllowedStatus = (typeof ALLOWED_STATUS_TRANSITIONS)[number]

export async function countActiveBookings(
  supabase: SupabaseClient,
  column: 'service_id' | 'employee_id',
  id: string,
  businessId: string,
): Promise<number> {
  const { count } = await supabase
    .from('bookings')
    .select('*', { count: 'exact', head: true })
    .eq(column, id)
    .eq('business_id', businessId)
    .neq('status', 'cancelled')
  return count ?? 0
}
