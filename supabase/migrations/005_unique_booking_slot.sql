-- ────────────────────────────────────────────────────────────
-- 005_unique_booking_slot.sql
-- Prevents double bookings at the database level.
-- A single employee cannot have two bookings at the same date+time.
-- The application layer handles error code 23505 explicitly in
-- createBookingAction — this constraint makes that handler functional.
-- ────────────────────────────────────────────────────────────

ALTER TABLE public.bookings
  ADD CONSTRAINT unique_employee_slot
  UNIQUE (employee_id, date, time);
