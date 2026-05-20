'use server'

import { createSupabaseServerClient } from '@/lib/supabase'
import { revalidatePath } from 'next/cache'

// ─── Create booking (public — no auth required) ──────────────────────────────

export type CreateBookingInput = {
  businessId: string
  serviceId: string
  employeeId: string | null
  date: string
  time: string
  clientName: string
  clientEmail: string
}

export type CreatedBooking = { id: string; date: string; time: string }

export type CreateBookingResult =
  | { booking: CreatedBooking; error?: never }
  | { error: string; booking?: never }

export async function createBookingAction(
  input: CreateBookingInput,
): Promise<CreateBookingResult> {
  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from('bookings')
    .insert({
      business_id: input.businessId,
      service_id: input.serviceId,
      employee_id: input.employeeId,
      date: input.date,
      time: input.time,
      client_id: null,
      client_name: input.clientName,
      client_email: input.clientEmail,
      status: 'pending',
    })
    .select('id, date, time')
    .single()

  if (error) return { error: error.message }
  return { booking: data as CreatedBooking }
}

// ─── Update booking status (business owner only, enforced via RLS) ────────────

export async function updateBookingStatusAction(formData: FormData) {
  const bookingId = formData.get('bookingId') as string
  const status = formData.get('status') as 'confirmed' | 'cancelled'

  if (!bookingId || !status) return

  const supabase = await createSupabaseServerClient()

  await supabase.from('bookings').update({ status }).eq('id', bookingId)

  revalidatePath('/dashboard/reservations')
}
