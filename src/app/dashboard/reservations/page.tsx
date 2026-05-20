import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase'
import { updateBookingStatusAction } from '@/app/actions/booking'
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

export default async function ReservationsPage() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const { data: business } = await supabase
    .from('businesses')
    .select('id, name')
    .eq('owner_id', user.id)
    .single()

  if (!business) {
    return (
      <div className="p-8 text-sm text-gray-500">
        No se encontró ningún negocio asociado a tu cuenta.
      </div>
    )
  }

  const { data: rawBookings } = await supabase
    .from('bookings')
    .select(
      'id, date, time, status, client_name, client_email, notes, services(name), employees(name)',
    )
    .eq('business_id', business.id)
    .order('date', { ascending: false })
    .order('time', { ascending: false })

  const bookings = (rawBookings ?? []) as Booking[]

  return (
    <div className="p-6 sm:p-8">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Reservas</h1>
        <p className="text-sm text-gray-500 mt-0.5">{business.name}</p>
      </div>

      {bookings.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <p className="text-gray-400 text-sm">Aún no hay reservas.</p>
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
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLOR[booking.status]}`}
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
                      {booking.services?.[0]?.name ?? '—'}
                    </span>
                    <span>
                      <span className="text-gray-400">Profesional:</span>{' '}
                      {booking.employees?.[0]?.name ?? 'Sin asignar'}
                    </span>
                    <span>
                      <span className="text-gray-400">Fecha:</span>{' '}
                      {new Date(booking.date + 'T00:00:00').toLocaleDateString(
                        'es-ES',
                        {
                          weekday: 'short',
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        },
                      )}
                    </span>
                    <span>
                      <span className="text-gray-400">Hora:</span>{' '}
                      {booking.time.slice(0, 5)}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                {(booking.status === 'pending' ||
                  booking.status === 'confirmed') && (
                  <div className="flex gap-2 shrink-0">
                    {booking.status === 'pending' && (
                      <form action={updateBookingStatusAction}>
                        <input type="hidden" name="bookingId" value={booking.id} />
                        <input type="hidden" name="status" value="confirmed" />
                        <button
                          type="submit"
                          className="px-3 py-1.5 text-xs font-medium rounded-lg bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 transition-colors"
                        >
                          Confirmar
                        </button>
                      </form>
                    )}
                    <form action={updateBookingStatusAction}>
                      <input type="hidden" name="bookingId" value={booking.id} />
                      <input type="hidden" name="status" value="cancelled" />
                      <button
                        type="submit"
                        className="px-3 py-1.5 text-xs font-medium rounded-lg bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 transition-colors"
                      >
                        Cancelar
                      </button>
                    </form>
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
