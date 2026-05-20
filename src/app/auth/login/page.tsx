'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { loginAction, type AuthState } from '@/app/actions/auth'
import { ErrorAlert } from '@/components/ErrorAlert'

export default function LoginPage() {
  const [state, action, pending] = useActionState<AuthState, FormData>(
    loginAction,
    undefined,
  )

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-cream py-12 px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Zitly</h1>
          <p className="mt-2 text-sm text-gray-500">
            Sistema de reservas para tu negocio
          </p>
          <h2 className="mt-6 text-xl font-semibold text-gray-800">
            Inicia sesión
          </h2>
        </div>

        <form action={action} className="space-y-5">
          {state?.error && <ErrorAlert message={state.error} />}

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-brand-ink shadow-sm placeholder-brand-muted focus:border-brand-green focus:outline-none focus:ring-1 focus:ring-brand-green"
              placeholder="tu@email.com"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Contraseña
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-brand-ink shadow-sm placeholder-brand-muted focus:border-brand-green focus:outline-none focus:ring-1 focus:ring-brand-green"
              placeholder="Tu contraseña"
            />
          </div>

          <button
            type="submit"
            disabled={pending}
            className="w-full flex justify-center py-2.5 px-4 rounded-md text-sm font-medium text-white bg-brand-green hover:bg-brand-green-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-green disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {pending ? 'Iniciando sesión…' : 'Iniciar sesión'}
          </button>

          <p className="text-center text-sm text-gray-600">
            ¿No tienes cuenta?{' '}
            <Link
              href="/auth/register"
              className="font-medium text-brand-green hover:text-brand-green-dark"
            >
              Regístrate
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}
