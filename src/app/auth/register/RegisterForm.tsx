'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { registerAction, type AuthState } from '@/app/actions/auth'
import { ErrorAlert } from '@/components/ErrorAlert'

export default function RegisterForm() {
  const [state, action, pending] = useActionState<AuthState, FormData>(
    registerAction,
    undefined,
  )

  return (
    <form action={action} className="space-y-5">
      {state?.error && <ErrorAlert message={state.error} />}

      <div>
        <label
          htmlFor="businessName"
          className="block text-sm font-medium text-brand-ink mb-1"
        >
          Nombre del negocio
        </label>
        <input
          id="businessName"
          name="businessName"
          type="text"
          required
          autoComplete="organization"
          placeholder="Mi Negocio"
          className="block w-full rounded-lg border border-brand-border bg-white px-3 py-2.5 text-base text-brand-ink placeholder-brand-muted focus:border-brand-green focus:outline-none focus:ring-2 focus:ring-brand-green-subtle transition-colors"
        />
      </div>

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

      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-brand-ink mb-1"
        >
          Contraseña
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
        {pending ? 'Creando cuenta…' : 'Crear cuenta gratis'}
      </button>

      <p className="text-center text-sm text-brand-muted pt-1">
        ¿Ya tienes cuenta?{' '}
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
