'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { registerAction, type AuthState } from '@/app/actions/auth'

export default function RegisterPage() {
  const [state, action, pending] = useActionState<AuthState, FormData>(
    registerAction,
    undefined,
  )

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Zitly</h1>
          <p className="mt-2 text-sm text-gray-500">
            Sistema de reservas para tu negocio
          </p>
          <h2 className="mt-6 text-xl font-semibold text-gray-800">
            Crea tu cuenta
          </h2>
        </div>

        <form action={action} className="space-y-5">
          {state?.error && (
            <div className="rounded-md bg-red-50 border border-red-200 p-4">
              <p className="text-sm text-red-700">{state.error}</p>
            </div>
          )}

          <div>
            <label
              htmlFor="businessName"
              className="block text-sm font-medium text-gray-700"
            >
              Nombre del negocio
            </label>
            <input
              id="businessName"
              name="businessName"
              type="text"
              required
              autoComplete="organization"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              placeholder="Mi Negocio"
            />
          </div>

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
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
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
              minLength={6}
              autoComplete="new-password"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              placeholder="Mínimo 6 caracteres"
            />
          </div>

          <button
            type="submit"
            disabled={pending}
            className="w-full flex justify-center py-2.5 px-4 rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {pending ? 'Creando cuenta…' : 'Crear cuenta'}
          </button>

          <p className="text-center text-sm text-gray-600">
            ¿Ya tienes cuenta?{' '}
            <Link
              href="/auth/login"
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              Inicia sesión
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}
