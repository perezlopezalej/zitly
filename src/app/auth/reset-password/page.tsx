import AuthShell from '@/app/auth/AuthShell'
import ResetPasswordForm from './ResetPasswordForm'

export default function ResetPasswordPage() {
  return (
    <AuthShell
      panelContent={
        <>
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-brand-green-light mb-5">
            Recuperación de acceso
          </p>
          <h2 className="font-display text-4xl xl:text-5xl font-bold italic leading-snug mb-6">
            Recupera el acceso a tu cuenta.
          </h2>
          <p className="text-brand-green-light text-sm leading-relaxed max-w-xs">
            Te enviaremos un enlace seguro para que puedas establecer una nueva
            contraseña.
          </p>
        </>
      }
    >
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold italic text-brand-ink mb-2">
          ¿Olvidaste tu contraseña?
        </h1>
        <p className="text-sm text-brand-muted">
          Introduce tu email y te enviaremos un enlace de recuperación
        </p>
      </div>

      <ResetPasswordForm />
    </AuthShell>
  )
}
