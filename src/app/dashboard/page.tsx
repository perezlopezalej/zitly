import Link from 'next/link'
import { getBusiness } from '@/lib/actions'
import { todayISO } from '@/lib/format'

function monthRange() {
  const now = new Date()
  const y = now.getFullYear()
  const m = now.getMonth()
  return {
    start: new Date(y, m, 1).toISOString().split('T')[0],
    end: new Date(y, m + 1, 0).toISOString().split('T')[0],
  }
}

type UpcomingBooking = {
  id: string
  time: string
  client_name: string | null
  services: { name: string } | null
}

export default async function DashboardPage() {
  const { supabase, businessId, businessName } = await getBusiness()

  const today = todayISO()
  const { start: monthStart, end: monthEnd } = monthRange()

  const [
    { count: todayCount },
    { count: pendingCount },
    { count: monthCount },
    { data: upcomingRaw },
  ] = await Promise.all([
    supabase
      .from('bookings')
      .select('*', { count: 'exact', head: true })
      .eq('business_id', businessId)
      .eq('date', today)
      .neq('status', 'cancelled'),
    supabase
      .from('bookings')
      .select('*', { count: 'exact', head: true })
      .eq('business_id', businessId)
      .eq('status', 'pending'),
    supabase
      .from('bookings')
      .select('*', { count: 'exact', head: true })
      .eq('business_id', businessId)
      .gte('date', monthStart)
      .lte('date', monthEnd)
      .neq('status', 'cancelled'),
    supabase
      .from('bookings')
      .select('id, time, client_name, services(name)')
      .eq('business_id', businessId)
      .eq('date', today)
      .neq('status', 'cancelled')
      .order('time', { ascending: true })
      .limit(3),
  ])

  const upcoming = (upcomingRaw ?? []) as unknown as UpcomingBooking[]

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-brand-ink">
          {businessName}
        </h1>
        <p className="mt-1 text-sm text-brand-muted">
          Aquí tienes el resumen de hoy
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard
          label="Reservas hoy"
          value={todayCount ?? 0}
          href="/dashboard/reservations"
          accent
        />
        <StatCard
          label="Pendientes de confirmar"
          value={pendingCount ?? 0}
          href="/dashboard/reservations"
        />
        <StatCard
          label="Total del mes"
          value={monthCount ?? 0}
          href="/dashboard/reservations"
        />
      </div>

      {/* Upcoming bookings today */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-700">
            Próximas citas de hoy
          </h2>
          <Link
            href="/dashboard/reservations"
            className="text-xs text-brand-green hover:underline"
          >
            Ver todas →
          </Link>
        </div>

        {upcoming.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-6 text-sm text-brand-muted text-center">
            No hay citas para hoy
          </div>
        ) : (
          <div className="space-y-2">
            {upcoming.map((b) => (
              <div
                key={b.id}
                className="bg-white rounded-xl border border-gray-200 px-5 py-3.5 flex items-center gap-4"
              >
                <span className="text-sm font-semibold text-brand-green tabular-nums shrink-0 w-12">
                  {b.time.slice(0, 5)}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-brand-ink truncate">
                    {b.client_name ?? '—'}
                  </p>
                  <p className="text-xs text-brand-muted truncate">
                    {b.services?.name ?? '—'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <QuickLink
          href="/dashboard/services"
          action="Gestionar"
          label="Servicios"
          description="Añade y edita los servicios que ofreces."
        />
        <QuickLink
          href="/dashboard/employees"
          action="Gestionar"
          label="Empleados"
          description="Administra el equipo de tu negocio."
        />
        <QuickLink
          href="/dashboard/reservations"
          action="Ver"
          label="Reservas"
          description="Consulta y gestiona las citas pendientes."
        />
      </div>
    </div>
  )
}

function StatCard({
  label,
  value,
  href,
  accent,
}: {
  label: string
  value: number
  href: string
  accent?: boolean
}) {
  return (
    <Link
      href={href}
      className="block bg-white rounded-xl border border-gray-200 p-5 hover:border-brand-green hover:shadow-sm transition-all"
    >
      <p className="text-xs font-medium text-brand-muted uppercase tracking-wide">
        {label}
      </p>
      <p
        className={`mt-2 text-3xl font-bold tabular-nums ${
          accent ? 'text-brand-green' : 'text-brand-ink'
        }`}
      >
        {value}
      </p>
    </Link>
  )
}

function QuickLink({
  href,
  action,
  label,
  description,
}: {
  href: string
  action: string
  label: string
  description: string
}) {
  return (
    <Link
      href={href}
      className="block bg-white rounded-xl border border-gray-200 p-5 hover:border-brand-green hover:shadow-sm transition-all"
    >
      <p className="text-xs font-medium text-brand-green uppercase tracking-wide">
        {action}
      </p>
      <p className="mt-1 text-lg font-semibold text-gray-900">{label}</p>
      <p className="mt-1 text-sm text-gray-500">{description}</p>
    </Link>
  )
}
