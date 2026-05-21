import AuthShell from '@/app/auth/AuthShell'
import RegisterForm from './RegisterForm'

export default function RegisterPage() {
  return (
    <AuthShell
      panelContent={
        <>
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-brand-green-light mb-5">
            Para negocios de servicios
          </p>
          <h2 className="font-display text-4xl xl:text-5xl font-bold italic leading-snug mb-6">
            Tu agenda,<br />siempre llena.
          </h2>
          <ul className="space-y-3 text-brand-green-light text-sm">
            <li className="flex items-start gap-2.5">
              <span className="mt-0.5 text-brand-green-light">✓</span>
              Página de reservas pública lista en minutos
            </li>
            <li className="flex items-start gap-2.5">
              <span className="mt-0.5 text-brand-green-light">✓</span>
              Gestión de servicios, empleados y citas
            </li>
            <li className="flex items-start gap-2.5">
              <span className="mt-0.5 text-brand-green-light">✓</span>
              Sin comisiones · Plan gratuito disponible
            </li>
          </ul>
        </>
      }
    >
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold italic text-brand-ink mb-2">
          Crea tu cuenta
        </h1>
        <p className="text-sm text-brand-muted">
          Gratis · Sin tarjeta de crédito
        </p>
      </div>

      <RegisterForm />
    </AuthShell>
  )
}
