import Link from 'next/link'
import { createSupabaseServerClient } from '@/lib/supabase'

export default async function NotFound() {
  let isLoggedIn = false
  try {
    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    isLoggedIn = !!user
  } catch {
    // Supabase unavailable — show default page without dashboard link
  }

  return (
    <main className="relative min-h-screen bg-background flex flex-col items-center justify-center px-6 py-16 text-center overflow-hidden">
      {/* Grid lines — same as hero */}
      <div className="absolute inset-0 opacity-30 pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <div
            key={`h-${i}`}
            className="absolute h-px bg-foreground/10"
            style={{ top: `${12.5 * (i + 1)}%`, left: 0, right: 0 }}
          />
        ))}
        {[...Array(12)].map((_, i) => (
          <div
            key={`v-${i}`}
            className="absolute w-px bg-foreground/10"
            style={{ left: `${8.33 * (i + 1)}%`, top: 0, bottom: 0 }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-lg w-full">
        <span className="inline-flex items-center gap-3 font-mono text-sm text-muted-foreground mb-8">
          <span className="w-8 h-px bg-foreground/30" />
          Error 404
        </span>

        <h1 className="font-display text-[clamp(2.5rem,6vw,4.5rem)] leading-tight text-foreground mb-4">
          Esta página<br />no existe.
        </h1>

        <p className="text-muted-foreground text-lg leading-relaxed mb-10 max-w-sm mx-auto">
          La URL puede haber cambiado o el enlace ya no está disponible.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-6 h-12 inline-flex items-center justify-center text-sm font-medium transition-colors"
          >
            Volver al inicio
          </Link>
          {isLoggedIn && (
            <Link
              href="/dashboard"
              className="border border-foreground/15 text-foreground/70 hover:text-foreground hover:bg-foreground/5 rounded-full px-6 h-12 inline-flex items-center justify-center text-sm font-medium transition-colors"
            >
              Ir al dashboard
            </Link>
          )}
        </div>
      </div>
    </main>
  )
}
