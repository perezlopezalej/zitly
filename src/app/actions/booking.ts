'use server'

import { createSupabaseAdminClient } from '@/lib/supabase'
import { getBusiness } from '@/lib/actions'
import { validateLength } from '@/lib/validation'
import { todayISO } from '@/lib/format'
import { revalidatePath } from 'next/cache'
import { sendBookingConfirmationEmail } from '@/lib/email'
import { BOOKING_SLOT_INTERVAL, ALLOWED_STATUS_TRANSITIONS, parseBookingHours } from '@/lib/booking'
import type { AllowedStatus } from '@/lib/booking'
import { isRedirectError } from 'next/dist/client/components/redirect-error'
import type { CreateBookingInput, CreatedBooking, CreateBookingResult, BusinessContact, Service, Employee } from '@/types'

// ─── Create booking (public — no auth required) ──────────────────────────────

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

  // Reject dates more than one year in the future
  const maxDate = new Date()
  maxDate.setFullYear(maxDate.getFullYear() + 1)
  if (input.date > maxDate.toISOString().split('T')[0]) {
    return { error: 'La fecha no puede ser superior a un año desde hoy' }
  }

  const supabase = createSupabaseAdminClient()

  // Fetch business early to get configurable hours (also used for email later)
  const { data: businessData } = await supabase
    .from('businesses')
    .select('name, opening_time, closing_time, phone, contact_email')
    .eq('id', input.businessId)
    .single()

  if (!businessData) return { error: 'Negocio no válido' }

  const biz = businessData as BusinessContact
  // parseBookingHours returns total minutes from midnight
  const { start: startMinutes, end: endMinutes } = parseBookingHours(biz.opening_time, biz.closing_time)

  const [h, m] = input.time.split(':').map(Number)
  const totalMinutes = h * 60 + m
  if (totalMinutes < startMinutes || totalMinutes >= endMinutes) {
    const lastSlotH = Math.floor((endMinutes - BOOKING_SLOT_INTERVAL) / 60)
    const lastSlotM = (endMinutes - BOOKING_SLOT_INTERVAL) % 60
    const lastSlot  = `${String(lastSlotH).padStart(2, '0')}:${String(lastSlotM).padStart(2, '0')}`
    const openH     = Math.floor(startMinutes / 60)
    const openM     = startMinutes % 60
    const openStr   = `${String(openH).padStart(2, '0')}:${String(openM).padStart(2, '0')}`
    return { error: `La hora debe estar entre las ${openStr} y las ${lastSlot}` }
  }

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
    .select('id, name')
    .eq('id', input.serviceId)
    .eq('business_id', input.businessId)
    .single()

  if (!service) return { error: 'Servicio no válido para este negocio' }

  // Verify employee belongs to the business when provided
  let employeeName: string | null = null
  if (input.employeeId) {
    const { data: employee } = await supabase
      .from('employees')
      .select('id, name')
      .eq('id', input.employeeId)
      .eq('business_id', input.businessId)
      .single()

    if (!employee) return { error: 'Empleado no válido para este negocio' }
    employeeName = (employee as Employee).name
  }

  let conflictQuery = supabase
    .from('bookings')
    .select('*', { count: 'exact', head: true })
    .eq('business_id', input.businessId)
    .eq('date', input.date)
    .eq('time', input.time)
    .neq('status', 'cancelled')

  if (input.employeeId) {
    conflictQuery = conflictQuery.eq('employee_id', input.employeeId)
  } else {
    conflictQuery = conflictQuery.is('employee_id', null)
  }

  const { count: conflictCount } = await conflictQuery
  if ((conflictCount ?? 0) > 0) {
    return { error: 'Este horario ya no está disponible. Por favor elige otro.' }
  }

  const { data, error } = await supabase
    .from('bookings')
    .insert({
      business_id: input.businessId,
      service_id: input.serviceId,
      service_name: (service as Service).name,
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

  if (error) {
    if (error.code === '23505') {
      return { error: 'Este horario ya no está disponible. Por favor elige otro.' }
    }
    return { error: 'No se pudo crear la reserva. Inténtalo de nuevo.' }
  }

  void sendBookingConfirmationEmail(input.clientEmail, {
    clientName: input.clientName,
    businessName: biz.name,
    serviceName: (service as Service).name,
    date: input.date,
    time: input.time,
    employeeName,
    businessPhone: biz.phone,
    businessContactEmail: biz.contact_email,
  }).catch(() => {})

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
  if (!UUID_RE.test(bookingId)) return

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
