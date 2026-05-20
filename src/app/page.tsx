import Link from 'next/link'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Nav */}
      <header className="border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <span className="text-xl font-bold text-indigo-600 tracking-tight">Zitly</span>
          <div className="flex items-center gap-3">
            <Link
              href="/auth/login"
              className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              Iniciar sesión
            </Link>
            <Link
              href="/auth/register"
              className="text-sm font-medium px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Empieza gratis
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="bg-linear-to-b from-indigo-50 to-white py-24 px-6">
          <div className="max-w-3xl mx-auto text-center">
            <span className="inline-block text-xs font-semibold uppercase tracking-widest text-indigo-500 bg-indigo-50 border border-indigo-100 rounded-full px-3 py-1 mb-6">
              Reservas online para tu negocio
            </span>
            <h1 className="text-5xl sm:text-6xl font-extrabold text-gray-900 leading-tight tracking-tight mb-6">
              Tus clientes reservan.<br />
              <span className="text-indigo-600">Tú te despreocupas.</span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-500 max-w-xl mx-auto mb-10 leading-relaxed">
              Zitly es la plataforma más sencilla para gestionar citas y reservas en negocios de servicios. Sin complicaciones, sin apps que instalar.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/auth/register"
                className="px-7 py-3.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors shadow-sm text-base"
              >
                Empieza gratis →
              </Link>
              <Link
                href="/auth/login"
                className="px-7 py-3.5 bg-white text-gray-700 font-semibold rounded-xl border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-colors text-base"
              >
                Ver demo
              </Link>
            </div>
            <p className="mt-5 text-xs text-gray-400">Sin tarjeta de crédito · Configuración en 2 minutos</p>
          </div>
        </section>

        {/* Features */}
        <section className="py-20 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-3">Todo lo que necesitas</h2>
              <p className="text-gray-500 text-base max-w-md mx-auto">
                Una sola herramienta para gestionar todo tu negocio de citas.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <FeatureCard
                icon={
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                }
                title="Reservas 24/7"
                description="Tus clientes reservan cuando quieren, desde cualquier dispositivo, sin llamadas ni mensajes."
              />
              <FeatureCard
                icon={
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                }
                title="Gestión de empleados"
                description="Asigna servicios a cada profesional. Tus clientes eligen con quién quieren su cita."
              />
              <FeatureCard
                icon={
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                }
                title="Panel de control"
                description="Confirma, cancela y consulta todas tus reservas desde un panel claro y ordenado."
              />
            </div>
          </div>
        </section>

        {/* Business types */}
        <section className="bg-gray-50 py-20 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-3">Pensado para tu sector</h2>
              <p className="text-gray-500 text-base max-w-md mx-auto">
                Si ofreces servicios con cita, Zitly es para ti.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <BusinessType emoji="✂️" label="Peluquerías y barberías" />
              <BusinessType emoji="🏥" label="Clínicas y consultas médicas" />
              <BusinessType emoji="💪" label="Fisioterapeutas" />
              <BusinessType emoji="🔧" label="Talleres y reparaciones" />
            </div>
          </div>
        </section>

        {/* CTA bottom */}
        <section className="py-20 px-6">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Empieza hoy, gratis
            </h2>
            <p className="text-gray-500 mb-8">
              Crea tu negocio en Zitly en menos de 2 minutos y comparte tu enlace de reservas.
            </p>
            <Link
              href="/auth/register"
              className="inline-block px-8 py-4 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors shadow-sm text-base"
            >
              Crear mi cuenta gratis →
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-sm font-bold text-indigo-600">Zitly</span>
          <p className="text-xs text-gray-400">
            © {new Date().getFullYear()} Zitly · Sistema de reservas para negocios de servicios
          </p>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="w-11 h-11 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
    </div>
  )
}

function BusinessType({ emoji, label }: { emoji: string; label: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col items-center text-center gap-3 hover:border-indigo-300 hover:shadow-sm transition-all">
      <span className="text-3xl">{emoji}</span>
      <span className="text-sm font-medium text-gray-700 leading-snug">{label}</span>
    </div>
  )
}
