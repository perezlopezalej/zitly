export const BOOKING_HOURS_START = 9   // 09:00
export const BOOKING_HOURS_END   = 18  // 18:00 (exclusive upper bound)

export const BOOKING_SLOT_INTERVAL = 30 // minutes between available slots

export const ALLOWED_STATUS_TRANSITIONS = ['confirmed', 'cancelled'] as const
export type AllowedStatus = (typeof ALLOWED_STATUS_TRANSITIONS)[number]
