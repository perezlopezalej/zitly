'use client'

import { useActionState } from 'react'
import { changePasswordAction, type AuthState } from '@/app/actions/auth'
import { ErrorAlert } from '@/components/ErrorAlert'

const inputClass =
  'block w-full rounded-lg border border-brand-border bg-white px-3 py-2 text-sm text-brand-ink placeholder-brand-muted focus:border-brand-green focus:outline-none focus:ring-2 focus:ring-brand-green-subtle transition-colors'

export default function PasswordForm() {
  const [state, action, pending] = useActionState<AuthState, FormData>(
    changePasswordAction,
    undefined,
  )

  return (
    <form action={action} className="space-y-4">
      {state?.error   && <ErrorAlert message={state.error} />}
      {state?.success && (
        <div className="rounded-md bg-green-50 border border-green-200 p-3">
          <p className="text-sm text-green-700">{state.success}</p>
        </div>
      )}

      <div>
        <label htmlFor="currentPassword" className="block text-sm font-medium text-brand-ink mb-1">
          Contraseña actual
        </label>
        <input
          id="currentPassword" name="currentPassword"
          type="password" required autoComplete="current-password"
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="newPassword" className="block text-sm font-medium text-brand-ink mb-1">
          Nueva contraseña
        </label>
        <input
          id="newPassword" name="newPassword"
          type="password" required minLength={8}
          autoComplete="new-password"
          placeholder="Mínimo 8 caracteres, mayúscula y número"
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-brand-ink mb-1">
          Confirmar nueva contraseña
        </label>
        <input
          id="confirmPassword" name="confirmPassword"
          type="password" required autoComplete="new-password"
          className={inputClass}
        />
      </div>

      <div className="pt-2">
        <button
          type="submit" disabled={pending}
          className="px-5 py-2 rounded-lg text-sm font-medium text-white bg-brand-green hover:bg-brand-green-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-green disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {pending ? 'Actualizando…' : 'Cambiar contraseña'}
        </button>
      </div>
    </form>
  )
}
