'use server'

import { createSupabaseServerClient } from '@/lib/supabase'
import { getBusiness } from '@/lib/actions'
import { validateLength } from '@/lib/validation'
import { todayISO } from '@/lib/format'
import { revalidatePath } from 'next/cache'
import { BOOKING_HOURS_START, BOOKING_HOURS_END, BOOKING_SLOT_INTERVAL, ALLOWED_STATUS_TRANSITIONS } from '@/lib/booking'
import type { AllowedStatus } from '@/lib/booking'
import { isRedirectError } from 'next/dist/client/components/redirect-error'

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
const UUID_RE  = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function createBookingAction(
  input: CreateBookingInput,
): Promise<CreateBookingResult> {
  // Reject malformed UUIDs before hitting the database
  if (!UUID_RE.test(input.businessId)) return { error: 'Negocio no válido' }
  if (!UUID_RE.test(input.serviceId))  return { error: 'Servicio no válido' }
  if (input.employeeId && !UUID_RE.test(input.employeeId)) return { error: 'Empleado no válido' }

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
  if (isNaN(new Date(input.date).getTime()) || input.date < todayISO()) {
    return { error: 'La fecha no puede ser en el pasado' }
  }
  if (!TIME_RE.test(input.time)) {
    return { error: 'Hora no válida' }
  }

  // Validate time is within accepted business hours (matches client-generated slots)
  const [h, m] = input.time.split(':').map(Number)
  const totalMinutes = h * 60 + m
  if (totalMinutes < BOOKING_HOURS_START * 60 || totalMinutes >= BOOKING_HOURS_END * 60) {
    const lastSlotH = Math.floor((BOOKING_HOURS_END * 60 - BOOKING_SLOT_INTERVAL) / 60)
    const lastSlotM = (BOOKING_HOURS_END * 60 - BOOKING_SLOT_INTERVAL) % 60
    const lastSlot = `${String(lastSlotH).padStart(2, '0')}:${String(lastSlotM).padStart(2, '0')}`
    return { error: `La hora debe estar entre las 09:00 y las ${lastSlot}` }
  }

  // Reject dates more than one year in the future
  const maxDate = new Date()
  maxDate.setFullYear(maxDate.getFullYear() + 1)
  if (input.date > maxDate.toISOString().split('T')[0]) {
    return { error: 'La fecha no puede ser superior a un año desde hoy' }
  }

  const supabase = await createSupabaseServerClient()

  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()

  // M2a: max 5 bookings per email per hour
  const { count: emailCount } = await supabase
    .from('bookings')
    .select('*', { count: 'exact', head: true })
    .eq('client_email', input.clientEmail)
    .gte('created_at', oneHourAgo)

  if ((emailCount ?? 0) >= 5) {
    return { error: 'Demasiadas reservas desde este email. Inténtalo más tarde.' }
  }

  // M2b: max 20 bookings per business per hour (prevents business-targeted spam)
  const { count: businessCount } = await supabase
    .from('bookings')
    .select('*', { count: 'exact', head: true })
    .eq('business_id', input.businessId)
    .gte('created_at', oneHourAgo)

  if ((businessCount ?? 0) >= 20) {
    return { error: 'Este negocio ha recibido demasiadas reservas. Inténtalo más tarde.' }
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

// ─── Update booking status (business owner only) ─────────────────────────────

export async function updateBookingStatusAction(
  _prevState: { error: string } | undefined,
  formData: FormData,
): Promise<{ error: string } | undefined> {
  const bookingId = (formData.get('bookingId') as string)?.trim()
  const rawStatus = formData.get('status') as string

  if (!bookingId || !rawStatus) return

  // Reject any status value not explicitly allowed by this action
  if (!(ALLOWED_STATUS_TRANSITIONS as readonly string[]).includes(rawStatus)) return
  const status = rawStatus as AllowedStatus

  let supabase, businessId
  try {
    ;({ supabase, businessId } = await getBusiness())
  } catch (e) {
    if (isRedirectError(e)) throw e
    return { error: 'Error de conexión. Inténtalo de nuevo.' }
  }

  const { error } = await supabase
    .from('bookings')
    .update({ status })
    .eq('id', bookingId)
    .eq('business_id', businessId)

  if (error) return { error: 'Error al actualizar la reserva. Inténtalo de nuevo.' }

  revalidatePath('/dashboard/reservations')
}
