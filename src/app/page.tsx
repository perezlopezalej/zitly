import Link from 'next/link'
import { Playfair_Display, DM_Sans } from 'next/font/google'

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  weight: ['300', '400', '500', '600'],
  display: 'swap',
})

export default function LandingPage() {
  return (
    <div
      className={`${playfair.variable} ${dmSans.variable} min-h-screen bg-[#F6F4EF] text-[#16130E]`}
      style={{ fontFamily: 'var(--font-dm-sans)' }}
    >
      <style>{`
        .font-display { font-family: var(--font-playfair); }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .anim-0 { animation: fadeUp 0.65s ease both; }
        .anim-1 { animation: fadeUp 0.65s 0.12s ease both; }
        .anim-2 { animation: fadeUp 0.65s 0.24s ease both; }
        .anim-3 { animation: fadeUp 0.65s 0.38s ease both; }
      `}</style>

      {/* ── Nav ────────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-[#F6F4EF]/90 backdrop-blur-sm border-b border-[#E0DDD6]">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <span className="font-display text-xl font-bold italic tracking-tight">Zitly</span>
          <nav className="flex items-center gap-6">
            <Link
              href="/auth/login"
              className="text-sm text-[#74706A] hover:text-[#16130E] transition-colors"
            >
              Iniciar sesión
            </Link>
            <Link
              href="/auth/register"
              className="text-sm font-medium px-4 py-2 bg-[#2C5F3F] text-white rounded-lg hover:bg-[#234D32] transition-colors"
            >
              Empieza gratis
            </Link>
          </nav>
        </div>
      </header>

      <main>
        {/* ── Hero ───────────────────────────────────────────────────────────── */}
        <section className="pt-28 pb-24 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <p className="anim-0 text-[10px] font-semibold tracking-[0.22em] uppercase text-[#74706A] mb-10">
              Sistema de reservas · España
            </p>
            <h1 className="anim-1 font-display text-6xl sm:text-7xl lg:text-[86px] font-bold leading-[1.04] tracking-tight mb-10">
              Tu agenda,{' '}
              <em className="not-italic text-[#2C5F3F]">siempre</em>
              <br />disponible.
            </h1>
            <p className="anim-2 text-lg text-[#74706A] max-w-md mx-auto leading-relaxed mb-12">
              Zitly es la plataforma más sencilla para gestionar citas en
              negocios de servicios. Sin complicaciones, sin apps extra.
            </p>
            <div className="anim-3 flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/auth/register"
                className="inline-flex items-center justify-center px-7 py-3.5 bg-[#16130E] text-white text-sm font-medium rounded-lg hover:bg-[#2C5F3F] transition-colors"
              >
                Empieza gratis →
              </Link>
              <Link
                href="/auth/login"
                className="inline-flex items-center justify-center px-7 py-3.5 border border-[#D6D3CC] text-[#16130E] text-sm font-medium rounded-lg hover:border-[#16130E] transition-colors bg-transparent"
              >
                Iniciar sesión
              </Link>
            </div>
            <p className="mt-7 text-xs text-[#A09C96]">
              Sin tarjeta de crédito · Configuración en 2 minutos
            </p>
          </div>

          {/* Stats strip */}
          <div className="max-w-xl mx-auto mt-20 grid grid-cols-3 divide-x divide-[#E0DDD6] border border-[#E0DDD6] rounded-2xl overflow-hidden bg-white">
            <StatItem value="2 min" label="para configurar" />
            <StatItem value="0 €" label="para empezar" />
            <StatItem value="24 / 7" label="reservas online" />
          </div>
        </section>

        {/* ── Features ───────────────────────────────────────────────────────── */}
        <section className="py-24 px-6 border-t border-[#E0DDD6]">
          <div className="max-w-6xl mx-auto">
            <div className="mb-16">
              <p className="text-[10px] font-semibold tracking-[0.22em] uppercase text-[#74706A] mb-4">
                Por qué Zitly
              </p>
              <h2 className="font-display text-4xl sm:text-5xl font-bold leading-tight">
                Todo lo que necesitas,<br />nada que no uses.
              </h2>
            </div>

            <div className="divide-y divide-[#E0DDD6] border-t border-[#E0DDD6]">
              <FeatureRow
                number="01"
                title="Reservas 24 horas"
                description="Tus clientes reservan cuando quieren — de madrugada, en domingo, desde el móvil. Sin llamadas, sin WhatsApps, sin perder una cita."
              />
              <FeatureRow
                number="02"
                title="Gestión de equipo"
                description="Asigna servicios a cada profesional. Tus clientes eligen con quién quieren su cita y en qué horario les va mejor."
              />
              <FeatureRow
                number="03"
                title="Panel unificado"
                description="Todas tus reservas en un solo lugar. Confirma, cancela y consulta con un clic. Sin hojas de papel ni agendas físicas."
              />
            </div>
          </div>
        </section>

        {/* ── Business types ─────────────────────────────────────────────────── */}
        <section className="py-24 px-6 bg-[#EDEAE3] border-t border-[#E0DDD6]">
          <div className="max-w-6xl mx-auto">
            <div className="mb-14 text-center">
              <p className="text-[10px] font-semibold tracking-[0.22em] uppercase text-[#74706A] mb-4">
                Tu sector
              </p>
              <h2 className="font-display text-4xl sm:text-5xl font-bold leading-tight">
                Pensado para quien<br />trabaja con citas.
              </h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <BusinessType label="Peluquerías" sublabel="y barberías" />
              <BusinessType label="Clínicas" sublabel="y consultas" />
              <BusinessType label="Fisioterapia" sublabel="y osteopatía" />
              <BusinessType label="Talleres" sublabel="y reparaciones" />
              <BusinessType label="Estética" sublabel="y bienestar" />
              <BusinessType label="Psicología" sublabel="y terapia" />
            </div>
          </div>
        </section>

        {/* ── Pricing ────────────────────────────────────────────────────────── */}
        <section className="py-24 px-6 border-t border-[#E0DDD6]">
          <div className="max-w-6xl mx-auto">
            <div className="mb-16 text-center">
              <p className="text-[10px] font-semibold tracking-[0.22em] uppercase text-[#74706A] mb-4">
                Precios
              </p>
              <h2 className="font-display text-4xl sm:text-5xl font-bold leading-tight">
                Transparente desde<br />el primer día.
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 max-w-4xl mx-auto">
              <PricingCard
                name="Gratuito"
                price="0 €"
                period="para siempre"
                features={[
                  '1 negocio',
                  'Hasta 30 reservas / mes',
                  '1 empleado',
                  'Página de reservas',
                ]}
                cta="Empieza gratis"
                href="/auth/register"
                featured={false}
              />
              <PricingCard
                name="Profesional"
                price="19 €"
                period="al mes"
                features={[
                  '1 negocio',
                  'Reservas ilimitadas',
                  'Hasta 5 empleados',
                  'Soporte prioritario',
                ]}
                cta="Empezar prueba"
                href="/auth/register"
                featured={true}
              />
              <PricingCard
                name="Equipos"
                price="39 €"
                period="al mes"
                features={[
                  'Negocios ilimitados',
                  'Reservas ilimitadas',
                  'Empleados ilimitados',
                  'Estadísticas avanzadas',
                ]}
                cta="Contactar"
                href="/auth/register"
                featured={false}
              />
            </div>
          </div>
        </section>

        {/* ── CTA final ──────────────────────────────────────────────────────── */}
        <section className="py-28 px-6 bg-[#16130E]">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-[10px] font-semibold tracking-[0.22em] uppercase text-[#74706A] mb-8">
              Empieza hoy
            </p>
            <h2 className="font-display text-5xl sm:text-6xl font-bold text-white leading-[1.08] mb-10">
              Tu primera reserva<br />en menos de 2 minutos.
            </h2>
            <Link
              href="/auth/register"
              className="inline-flex items-center px-8 py-4 bg-[#2C5F3F] text-white text-sm font-semibold rounded-lg hover:bg-[#234D32] transition-colors"
            >
              Crear mi cuenta gratis →
            </Link>
            <p className="mt-6 text-sm text-[#4A4641]">
              Sin compromiso · Sin tarjeta de crédito
            </p>
          </div>
        </section>
      </main>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <footer className="bg-[#16130E] border-t border-[#272420] py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="font-display text-base font-bold italic text-white">Zitly</span>
          <p className="text-xs text-[#4A4641]">
            © {new Date().getFullYear()} Zitly · Sistema de reservas para negocios de servicios en España
          </p>
        </div>
      </footer>
    </div>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────

function StatItem({ value, label }: { value: string; label: string }) {
  return (
    <div className="py-6 px-4 text-center">
      <p className="font-display text-2xl font-bold text-[#16130E]">{value}</p>
      <p className="text-xs text-[#74706A] mt-1">{label}</p>
    </div>
  )
}

function FeatureRow({
  number,
  title,
  description,
}: {
  number: string
  title: string
  description: string
}) {
  return (
    <div className="py-12 grid grid-cols-1 sm:grid-cols-[72px_1fr_2fr] gap-5 items-start">
      <p className="text-sm font-medium text-[#A09C96] tabular-nums pt-1">{number}</p>
      <h3 className="font-display text-2xl font-bold text-[#16130E] leading-snug">{title}</h3>
      <p className="text-[#74706A] leading-relaxed max-w-lg">{description}</p>
    </div>
  )
}

function BusinessType({ label, sublabel }: { label: string; sublabel: string }) {
  return (
    <div className="bg-white border border-[#E0DDD6] rounded-xl p-5 text-center hover:border-[#2C5F3F] hover:shadow-sm transition-all cursor-default">
      <p className="font-medium text-[#16130E] text-sm leading-snug">{label}</p>
      <p className="text-xs text-[#A09C96] mt-1 leading-snug">{sublabel}</p>
    </div>
  )
}

function PricingCard({
  name,
  price,
  period,
  features,
  cta,
  href,
  featured,
}: {
  name: string
  price: string
  period: string
  features: string[]
  cta: string
  href: string
  featured: boolean
}) {
  return (
    <div
      className={`rounded-2xl border p-7 flex flex-col ${
        featured
          ? 'border-[#2C5F3F] bg-[#2C5F3F] text-white shadow-xl'
          : 'border-[#E0DDD6] bg-white text-[#16130E]'
      }`}
    >
      <p
        className={`text-[10px] font-semibold uppercase tracking-[0.18em] mb-6 ${
          featured ? 'text-[#A3C4B0]' : 'text-[#74706A]'
        }`}
      >
        {name}
      </p>
      <div className="mb-8">
        <span className="font-display text-4xl font-bold">{price}</span>
        <span
          className={`text-sm ml-2 ${featured ? 'text-[#A3C4B0]' : 'text-[#74706A]'}`}
        >
          {period}
        </span>
      </div>
      <ul className="space-y-3 mb-8 flex-1">
        {features.map((f) => (
          <li
            key={f}
            className={`text-sm flex items-center gap-2.5 ${
              featured ? 'text-[#D4E8DC]' : 'text-[#74706A]'
            }`}
          >
            <span
              className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold ${
                featured
                  ? 'bg-white/20 text-white'
                  : 'bg-[#F0EDE7] text-[#2C5F3F]'
              }`}
            >
              ✓
            </span>
            {f}
          </li>
        ))}
      </ul>
      <Link
        href={href}
        className={`text-center py-2.5 px-5 rounded-lg text-sm font-medium transition-colors ${
          featured
            ? 'bg-white text-[#2C5F3F] hover:bg-[#F0EDE7]'
            : 'border border-[#E0DDD6] text-[#16130E] hover:border-[#2C5F3F] hover:text-[#2C5F3F]'
        }`}
      >
        {cta}
      </Link>
    </div>
  )
}
