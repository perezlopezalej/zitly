'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { Playfair_Display, DM_Sans } from 'next/font/google'
import { loginAction, type AuthState } from '@/app/actions/auth'
import { ErrorAlert } from '@/components/ErrorAlert'

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  weight: ['300', '400', '500', '600'],
  display: 'swap',
})

export default function LoginPage() {
  const [state, action, pending] = useActionState<AuthState, FormData>(
    loginAction,
    undefined,
  )

  return (
    <div
      className={`${playfair.variable} ${dmSans.variable} min-h-screen flex`}
      style={{ fontFamily: 'var(--font-dm-sans)' }}
    >
      <style>{`.font-display { font-family: var(--font-playfair); }`}</style>

      {/* ── Left panel: brand ─────────────────────────────────────────────── */}
      <div className="hidden md:flex md:w-[52%] bg-brand-green flex-col justify-between p-12 xl:p-16 text-white">
        <Link
          href="/"
          className="font-display text-2xl font-bold italic tracking-tight text-white w-fit"
        >
          Zitly
        </Link>

        <div>
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-brand-green-light mb-5">
            Sistema de reservas
          </p>
          <h2 className="font-display text-4xl xl:text-5xl font-bold italic leading-snug mb-6">
            Gestiona tus citas.<br />Sin fricción.
          </h2>
          <p className="text-brand-green-light text-sm leading-relaxed max-w-xs">
            Miles de negocios confían en Zitly para automatizar sus reservas y
            centrarse en lo que importa: sus clientes.
          </p>
        </div>

        <p className="text-xs text-brand-green-light opacity-60">
          © 2026 Zitly · Todos los derechos reservados
        </p>
      </div>

      {/* ── Right panel: form ─────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col bg-brand-cream">
        {/* Mobile header */}
        <div className="md:hidden flex items-center justify-between px-6 h-16 border-b border-brand-border">
          <Link
            href="/"
            className="font-display text-xl font-bold italic text-brand-ink"
          >
            Zitly
          </Link>
          <Link
            href="/"
            className="text-sm text-brand-muted hover:text-brand-ink transition-colors"
          >
            ← Inicio
          </Link>
        </div>

        {/* Form area */}
        <div className="flex-1 flex flex-col justify-center px-8 py-12 sm:px-12">
          <div className="w-full max-w-sm mx-auto">
            {/* Desktop back link */}
            <Link
              href="/"
              className="hidden md:inline-flex items-center gap-1 text-sm text-brand-muted hover:text-brand-ink transition-colors mb-10"
            >
              ← Volver al inicio
            </Link>

            <div className="mb-8">
              <h1 className="font-display text-3xl font-bold italic text-brand-ink mb-2">
                Bienvenido de nuevo
              </h1>
              <p className="text-sm text-brand-muted">
                Accede a tu panel de control
              </p>
            </div>

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
                  className="block w-full rounded-lg border border-brand-border bg-white px-3 py-2.5 text-sm text-brand-ink placeholder-brand-muted focus:border-brand-green focus:outline-none focus:ring-2 focus:ring-brand-green-subtle transition-colors"
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
                  autoComplete="current-password"
                  placeholder="Tu contraseña"
                  className="block w-full rounded-lg border border-brand-border bg-white px-3 py-2.5 text-sm text-brand-ink placeholder-brand-muted focus:border-brand-green focus:outline-none focus:ring-2 focus:ring-brand-green-subtle transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={pending}
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
          </div>
        </div>
      </div>
    </div>
  )
}
