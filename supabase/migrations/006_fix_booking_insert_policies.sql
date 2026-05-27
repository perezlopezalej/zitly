-- Drop the overly permissive allow_public_booking_insert policy.
-- It only checks (client_id IS NULL AND status = 'pending') and applies to the anon role.
-- Because permissive policies are combined with OR, it was allowing anonymous users to
-- bypass the stricter "bookings: anonymous insert" policy (which validates client_name,
-- client_email, and service/employee integrity). Removing this policy forces all anonymous
-- inserts through the complete validation in "bookings: anonymous insert".
DROP POLICY IF EXISTS "allow_public_booking_insert" ON public.bookings;
