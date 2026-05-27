'use client'

import { useActionState, useState } from 'react'
import Link from 'next/link'
import { Turnstile } from '@marsidev/react-turnstile'
import { registerAction } from '@/app/actions/auth'
import type { AuthState } from '@/types'
import { ErrorAlert } from '@/components/ErrorAlert'

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? ''

export default function RegisterForm() {
  const [state, action, pending] = useActionState<AuthState, FormData>(
    registerAction,
    undefined,
  )
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)

  if (state?.success) {
    return (
      <div className="rounded-md bg-green-50 border border-green-200 p-4">
        <p className="text-sm text-green-700">{state.success}</p>
      </div>
    )
  }

  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="captchaToken" value={captchaToken ?? ''} />
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

      <div className="flex items-start gap-3">
        <input
          id="terms"
          name="terms"
          type="checkbox"
          required
          className="mt-0.5 h-4 w-4 shrink-0 rounded border-brand-border text-brand-green focus:ring-2 focus:ring-brand-green focus:ring-offset-0 cursor-pointer"
        />
        <label htmlFor="terms" className="text-sm text-brand-muted leading-relaxed">
          Acepto los{' '}
          <Link href="/terminos" className="text-brand-green hover:underline font-medium">
            Términos de uso
          </Link>
          {' '}y la{' '}
          <Link href="/privacidad" className="text-brand-green hover:underline font-medium">
            Política de privacidad
          </Link>
        </label>
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
