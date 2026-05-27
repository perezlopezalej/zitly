'use client'

import { useActionState, useState } from 'react'
import Link from 'next/link'
import { Turnstile } from '@marsidev/react-turnstile'
import { loginAction } from '@/app/actions/auth'
import type { AuthState } from '@/types'
import { ErrorAlert } from '@/components/ErrorAlert'

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? ''

export default function LoginForm() {
  const [state, action, pending] = useActionState<AuthState, FormData>(
    loginAction,
    undefined,
  )
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)

  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="captchaToken" value={captchaToken ?? ''} />
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

      <div>
        <div className="flex items-center justify-between mb-1">
          <label
            htmlFor="password"
            className="block text-sm font-medium text-brand-ink"
          >
            Contraseña
          </label>
          <Link
            href="/auth/reset-password"
            className="text-xs text-brand-muted hover:text-brand-green transition-colors"
          >
            ¿Olvidaste tu contraseña?
          </Link>
        </div>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          placeholder="Tu contraseña"
          className="block w-full rounded-lg border border-brand-border bg-white px-3 py-2.5 text-base text-brand-ink placeholder-brand-muted focus:border-brand-green focus:outline-none focus:ring-2 focus:ring-brand-green-subtle transition-colors"
        />
      </div>

      <Turnstile
        siteKey={SITE_KEY}
        onSuccess={setCaptchaToken}
        onExpire={() => setCaptchaToken(null)}
        options={{ theme: 'light' }}
      />

      <button
        type="submit"
        disabled={pending || !captchaToken}
        className="w-full py-2.5 px-4 rounded-lg text-sm font-medium text-white bg-brand-green hover:bg-brand-green-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-green disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {pending ? 'Iniciando sesión…' : 'Iniciar sesión'}
      </button>

      <p className="text-center text-sm text-brand-muted pt-1">
        ¿No tienes cuenta?{' '}
        <Link
          href="/auth/register"
          className="font-medium text-brand-green hover:text-brand-green-dark transition-colors"
        >
          Regístrate gratis
        </Link>
      </p>
    </form>
  )
}
