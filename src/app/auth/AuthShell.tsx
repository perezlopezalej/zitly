import Link from 'next/link'
import { playfair, dmSans } from '@/lib/fonts'

export default function AuthShell({
  panelContent,
  children,
}: {
  panelContent: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div
      className={`${playfair.variable} ${dmSans.variable} min-h-screen flex`}
      style={{ fontFamily: 'var(--font-dm-sans)' }}
    >
      {/* ── Left panel: brand ─────────────────────────────────────────────── */}
      <div className="hidden md:flex md:w-[52%] bg-brand-green flex-col justify-between p-12 xl:p-16 text-white">
        <Link
          href="/"
          className="font-display text-2xl font-bold italic tracking-tight text-white w-fit"
        >
          Zitly
        </Link>

        <div>{panelContent}</div>

        <p className="text-xs text-brand-green-light opacity-60">
          © {new Date().getFullYear()} Zitly · Todos los derechos reservados
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

            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
