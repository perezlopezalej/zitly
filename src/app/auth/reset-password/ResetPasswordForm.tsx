'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { resetPasswordAction, type AuthState } from '@/app/actions/auth'
import { ErrorAlert } from '@/components/ErrorAlert'

export default function ResetPasswordForm() {
  const [state, action, pending] = useActionState<AuthState, FormData>(
    resetPasswordAction,
    undefined,
  )

  if (state?.success) {
    return (
      <div className="rounded-md bg-green-50 border border-green-200 p-4">
        <p className="text-sm text-green-700">{state.success}</p>
        <Link
          href="/auth/login"
          className="mt-3 inline-block text-sm font-medium text-brand-green hover:text-brand-green-dark transition-colors"
        >
          ← Volver al inicio de sesión
        </Link>
      </div>
    )
  }

  return (
    <form action={action} className="space-y-5">
      {state?.error && <ErrorAlert message={state.error} />}

      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-brand-ink mb-1"
        >
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="tu@email.com"
          className="block w-full rounded-lg border border-brand-border bg-white px-3 py-2.5 text-base text-brand-ink placeholder-brand-muted focus:border-brand-green focus:outline-none focus:ring-2 focus:ring-brand-green-subtle transition-colors"
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-full py-2.5 px-4 rounded-lg text-sm font-medium text-white bg-brand-green hover:bg-brand-green-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-green disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {pending ? 'Enviando…' : 'Enviar enlace de recuperación'}
      </button>

      <p className="text-center text-sm text-brand-muted pt-1">
        ¿Recuerdas tu contraseña?{' '}
        <Link
          href="/auth/login"
          className="font-medium text-brand-green hover:text-brand-green-dark transition-colors"
        >
          Inicia sesión
        </Link>
      </p>
    </form>
  )
}
