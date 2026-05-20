'use server'

import { createSupabaseServerClient } from '@/lib/supabase'
import { validateLength } from '@/lib/validation'
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

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const TIME_RE  = /^([01]\d|2[0-3]):[0-5]\d$/

export async function createBookingAction(
  input: CreateBookingInput,
): Promise<CreateBookingResult> {
  // H3: server-side input validation (HTML constraints are bypassable)
  if (!validateLength(input.clientName.trim(), 1, 200)) {
    return { error: 'Nombre no válido' }
  }
  if (!EMAIL_RE.test(input.clientEmail)) {
    return { error: 'Email no válido' }
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.date)) {
    return { error: 'Fecha no válida' }
  }
  const bookingDate = new Date(input.date + 'T00:00:00')
  const today = new Date(new Date().toDateString())
  if (isNaN(bookingDate.getTime()) || bookingDate < today) {
    return { error: 'La fecha no puede ser en el pasado' }
  }
  if (!TIME_RE.test(input.time)) {
    return { error: 'Hora no válida' }
  }

  const supabase = await createSupabaseServerClient()

  // M2: rate limit — max 5 bookings per email per hour
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
  const { count } = await supabase
    .from('bookings')
    .select('*', { count: 'exact', head: true })
    .eq('client_email', input.clientEmail)
    .gte('created_at', oneHourAgo)

  if ((count ?? 0) >= 5) {
    return { error: 'Demasiadas reservas desde este email. Inténtalo más tarde.' }
  }

  // Verify service belongs to the business (prevents cross-business injection)
  const { data: service } = await supabase
    .from('services')
    .select('id')
    .eq('id', input.serviceId)
    .eq('business_id', input.businessId)
    .single()

  if (!service) return { error: 'Servicio no válido para este negocio' }

  // Verify employee belongs to the business when provided
  if (input.employeeId) {
    const { data: employee } = await supabase
      .from('employees')
      .select('id')
      .eq('id', input.employeeId)
      .eq('business_id', input.businessId)
      .single()

    if (!employee) return { error: 'Empleado no válido para este negocio' }
  }

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

  if (error) return { error: 'No se pudo crear la reserva. Inténtalo de nuevo.' }
  return { booking: data as CreatedBooking }
}

// ─── Update booking status (business owner only, enforced via RLS) ────────────

const ALLOWED_STATUS_TRANSITIONS = ['confirmed', 'cancelled'] as const
type AllowedStatus = (typeof ALLOWED_STATUS_TRANSITIONS)[number]

export async function updateBookingStatusAction(formData: FormData) {
  const bookingId = formData.get('bookingId') as string
  const rawStatus = formData.get('status') as string

  if (!bookingId || !rawStatus) return

  // Reject any status value not explicitly allowed by this action
  if (!(ALLOWED_STATUS_TRANSITIONS as readonly string[]).includes(rawStatus)) return
  const status = rawStatus as AllowedStatus

  const supabase = await createSupabaseServerClient()

  await supabase.from('bookings').update({ status }).eq('id', bookingId)

  revalidatePath('/dashboard/reservations')
}
