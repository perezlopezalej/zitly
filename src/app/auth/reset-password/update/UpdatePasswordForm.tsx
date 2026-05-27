'use client'

import { useActionState } from 'react'
import { updatePasswordAction } from '@/app/actions/auth'
import type { AuthState } from '@/types'
import { ErrorAlert } from '@/components/ErrorAlert'

export default function UpdatePasswordForm({ code }: { code: string }) {
  const [state, action, pending] = useActionState<AuthState, FormData>(
    updatePasswordAction,
    undefined,
  )

  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="code" value={code} />
      {state?.error && <ErrorAlert message={state.error} />}

      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-brand-ink mb-1"
        >
          Nueva contraseña
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          placeholder="Mínimo 8 caracteres, mayúscula y número"
          className="block w-full rounded-lg border border-brand-border bg-white px-3 py-2.5 text-base text-brand-ink placeholder-brand-muted focus:border-brand-green focus:outline-none focus:ring-2 focus:ring-brand-green-subtle transition-colors"
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-full py-2.5 px-4 rounded-lg text-sm font-medium text-white bg-brand-green hover:bg-brand-green-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-green disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {pending ? 'Guardando…' : 'Establecer nueva contraseña'}
      </button>
    </form>
  )
}
