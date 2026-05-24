import Link from 'next/link'
import { isRedirectError } from 'next/dist/client/components/redirect-error'
import { getBusiness } from '@/lib/actions'
import { ConfirmButton, CancelButton } from './ReservationActionButtons'
import type { BookingStatus, Booking } from '@/types'

const STATUS_LABEL: Record<BookingStatus, string> = {
  pending: 'Pendiente',
  confirmed: 'Confirmada',
  cancelled: 'Cancelada',
  completed: 'Completada',
}

const STATUS_COLOR: Record<BookingStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-700',
  completed: 'bg-gray-100 text-gray-600',
}

const VALID_STATUSES: BookingStatus[] = ['pending', 'confirmed', 'cancelled', 'completed']
const VALID_DATES = ['today', 'week', 'month'] as const
type DateFilter = (typeof VALID_DATES)[number] | ''

function getDateRange(dateFilter: DateFilter): { gte?: string; lte?: string } {
  const now = new Date()
  const today = now.toISOString().split('T')[0]

  if (dateFilter === 'today') {
    return { gte: today, lte: today }
  }
  if (dateFilter === 'week') {
    const day = now.getDay()
    const monday = new Date(now)
    monday.setDate(now.getDate() - (day === 0 ? 6 : day - 1))
    const sunday = new Date(monday)
    sunday.setDate(monday.getDate() + 6)
    return {
      gte: monday.toISOString().split('T')[0],
      lte: sunday.toISOString().split('T')[0],
    }
  }
  if (dateFilter === 'month') {
    const first = new Date(now.getFullYear(), now.getMonth(), 1)
    const last = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    return {
      gte: first.toISOString().split('T')[0],
      lte: last.toISOString().split('T')[0],
    }
  }
  return {}
}

function buildHref(status: string, date: string): string {
  const params = new URLSearchParams()
  if (status) params.set('status', status)
  if (date) params.set('date', date)
  const str = params.toString()
  return `/dashboard/reservations${str ? `?${str}` : ''}`
}

type PageProps = {
  searchParams: Promise<{ status?: string; date?: string }>
}

export default async function ReservationsPage({ searchParams }: PageProps) {
  const { status: rawStatus, date: rawDate } = await searchParams

  const validStatus: BookingStatus | '' = VALID_STATUSES.includes(rawStatus as BookingStatus)
    ? (rawStatus as BookingStatus)
    : ''
  const validDate: DateFilter = (VALID_DATES as readonly string[]).includes(rawDate ?? '')
    ? (rawDate as DateFilter)
    : ''

  const businessResult = await getBusiness().catch((e: unknown) => {
    if (isRedirectError(e)) throw e
    return null
  })

  if (!businessResult) {
    return (
      <div className="p-8 text-sm text-gray-500">
        No se encontró ningún negocio asociado a tu cuenta.
      </div>
    )
  }

  const { supabase, businessId, businessName } = businessResult

  let query = supabase
    .from('bookings')
    .select(
      'id, date, time, status, client_name, client_email, services(name), employees(name)',
    )
    .eq('business_id', businessId)

  if (validStatus) query = query.eq('status', validStatus)

  const dateRange = getDateRange(validDate)
  if (dateRange.gte) query = query.gte('date', dateRange.gte)
  if (dateRange.lte) query = query.lte('date', dateRange.lte)

  query = query.order('date', { ascending: false }).order('time', { ascending: false })

  const { data: rawBookings } = await query
  const bookings = (rawBookings ?? []) as unknown as Booking[]

  const hasActiveFilter = !!validStatus || !!validDate

  return (
    <div className="p-6 sm:p-8">
      <div className="mb-5">
        <h1 className="text-xl font-semibold text-gray-900">Reservas</h1>
        <p className="text-sm text-gray-500 mt-0.5">{businessName}</p>
      </div>

      {/* Filters */}
      <div className="mb-5 flex flex-col sm:flex-row sm:items-center gap-3 flex-wrap">
        <div className="flex flex-wrap gap-1.5">
          <FilterPill href={buildHref('', validDate)} active={!validStatus}>
            Todas
          </FilterPill>
          <FilterPill href={buildHref('pending', validDate)} active={validStatus === 'pending'}>
            Pendientes
          </FilterPill>
          <FilterPill href={buildHref('confirmed', validDate)} active={validStatus === 'confirmed'}>
            Confirmadas
          </FilterPill>
          <FilterPill href={buildHref('cancelled', validDate)} active={validStatus === 'cancelled'}>
            Canceladas
          </FilterPill>
        </div>

        <div className="hidden sm:block h-4 w-px bg-brand-border" />

        <div className="flex flex-wrap gap-1.5">
          <FilterPill href={buildHref(validStatus, '')} active={!validDate}>
            Todas las fechas
          </FilterPill>
          <FilterPill href={buildHref(validStatus, 'today')} active={validDate === 'today'}>
            Hoy
          </FilterPill>
          <FilterPill href={buildHref(validStatus, 'week')} active={validDate === 'week'}>
            Esta semana
          </FilterPill>
          <FilterPill href={buildHref(validStatus, 'month')} active={validDate === 'month'}>
            Este mes
          </FilterPill>
        </div>
      </div>

      {bookings.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <p className="text-gray-400 text-sm">
            {hasActiveFilter
              ? 'No hay reservas con estos filtros.'
              : 'Aún no hay reservas.'}
          </p>
          {hasActiveFilter && (
            <Link
              href="/dashboard/reservations"
              className="mt-2 inline-block text-xs text-brand-green hover:underline"
            >
              Quitar filtros
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {bookings.map((booking) => (
            <div
              key={booking.id}
              className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5"
            >
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                {/* Info */}
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium text-gray-900 truncate">
                      {booking.client_name ?? '—'}
                    </p>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLOR[booking.status] ?? 'bg-gray-100 text-gray-600'}`}
                    >
                      {STATUS_LABEL[booking.status]}
                    </span>
                  </div>

                  <p className="text-sm text-gray-500 truncate">
                    {booking.client_email ?? '—'}
                  </p>

                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600 pt-1">
                    <span>
                      <span className="text-gray-400">Servicio:</span>{' '}
                      {booking.services?.name ?? '—'}
                    </span>
                    <span>
                      <span className="text-gray-400">Profesional:</span>{' '}
                      {booking.employees?.name ?? 'Sin asignar'}
                    </span>
                    <span>
                      <span className="text-gray-400">Fecha:</span>{' '}
                      {new Date(booking.date + 'T00:00:00').toLocaleDateString('es-ES', {
                        weekday: 'short',
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                    <span>
                      <span className="text-gray-400">Hora:</span>{' '}
                      {booking.time.slice(0, 5)}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                {(booking.status === 'pending' || booking.status === 'confirmed') && (
                  <div className="flex gap-2 shrink-0">
                    {booking.status === 'pending' && (
                      <ConfirmButton bookingId={booking.id} />
                    )}
                    <CancelButton bookingId={booking.id} />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function FilterPill({
  href,
  active,
  children,
}: {
  href: string
  active: boolean
  children: React.ReactNode
}) {
  return (
    <Link
      href={href}
      className={`px-3 py-3 rounded-full text-xs font-medium transition-colors ${
        active
          ? 'bg-brand-green text-white'
          : 'bg-gray-100 text-brand-muted hover:bg-gray-200'
      }`}
    >
      {children}
    </Link>
  )
}
