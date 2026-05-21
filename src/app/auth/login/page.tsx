import AuthShell from '@/app/auth/AuthShell'
import LoginForm from './LoginForm'

export default function LoginPage() {
  return (
    <AuthShell
      panelContent={
        <>
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-brand-green-light mb-5">
            Sistema de reservas
          </p>
          <h2 className="font-display text-4xl xl:text-5xl font-bold italic leading-snug mb-6">
            Gestiona tus citas.<br />Sin fricción.
          </h2>
          <p className="text-brand-green-light text-sm leading-relaxed max-w-xs">
            Miles de negocios confían en Zitly para automatizar sus reservas y
            centrarse en lo que importa: sus clientes.
          </p>
        </>
      }
    >
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold italic text-brand-ink mb-2">
          Bienvenido de nuevo
        </h1>
        <p className="text-sm text-brand-muted">
          Accede a tu panel de control
        </p>
      </div>

      <LoginForm />
    </AuthShell>
  )
}
