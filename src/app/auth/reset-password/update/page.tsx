import { redirect } from 'next/navigation'
import AuthShell from '@/app/auth/AuthShell'
import UpdatePasswordForm from './UpdatePasswordForm'

export default async function UpdatePasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>
}) {
  const { code } = await searchParams

  if (!code) {
    redirect('/auth/reset-password')
  }

  return (
    <AuthShell
      panelContent={
        <>
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-brand-green-light mb-5">
            Nueva contraseña
          </p>
          <h2 className="font-display text-4xl xl:text-5xl font-bold italic leading-snug mb-6">
            Casi listo. Elige una contraseña segura.
          </h2>
          <p className="text-brand-green-light text-sm leading-relaxed max-w-xs">
            Tu nueva contraseña debe tener al menos 8 caracteres, una mayúscula
            y un número.
          </p>
        </>
      }
    >
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold italic text-brand-ink mb-2">
          Establece tu nueva contraseña
        </h1>
        <p className="text-sm text-brand-muted">
          Elige una contraseña segura para tu cuenta
        </p>
      </div>

      <UpdatePasswordForm code={code} />
    </AuthShell>
  )
}
