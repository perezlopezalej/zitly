import Link from 'next/link'

export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900">Bienvenido a Zitly</h1>
      <p className="mt-1 text-gray-500">
        Gestiona tu negocio desde el panel lateral.
      </p>

      <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          href="/dashboard/services"
          className="block bg-white rounded-xl border border-gray-200 p-5 hover:border-indigo-300 hover:shadow-sm transition-all"
        >
          <p className="text-xs font-medium text-indigo-600 uppercase tracking-wide">Gestionar</p>
          <p className="mt-1 text-lg font-semibold text-gray-900">Servicios</p>
          <p className="mt-1 text-sm text-gray-500">Añade y edita los servicios que ofreces.</p>
        </Link>

        <Link
          href="/dashboard/employees"
          className="block bg-white rounded-xl border border-gray-200 p-5 hover:border-indigo-300 hover:shadow-sm transition-all"
        >
          <p className="text-xs font-medium text-indigo-600 uppercase tracking-wide">Gestionar</p>
          <p className="mt-1 text-lg font-semibold text-gray-900">Empleados</p>
          <p className="mt-1 text-sm text-gray-500">Administra el equipo de tu negocio.</p>
        </Link>

        <Link
          href="/dashboard/reservations"
          className="block bg-white rounded-xl border border-gray-200 p-5 hover:border-indigo-300 hover:shadow-sm transition-all"
        >
          <p className="text-xs font-medium text-indigo-600 uppercase tracking-wide">Ver</p>
          <p className="mt-1 text-lg font-semibold text-gray-900">Reservas</p>
          <p className="mt-1 text-sm text-gray-500">Consulta y gestiona las citas pendientes.</p>
        </Link>
      </div>
    </div>
  )
}
