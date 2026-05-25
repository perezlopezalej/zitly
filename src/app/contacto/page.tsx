import type { Metadata } from 'next'
import { Navigation } from '@/components/landing/navigation'
import { FooterSection } from '@/components/landing/footer-section'
import ContactForm from './ContactForm'

export const metadata: Metadata = {
  title: 'Contacto — Zitly',
  description: 'Contáctanos. Somos un equipo pequeño y respondemos en menos de 24 horas.',
}

export default function ContactoPage() {
  return (
    <>
      <Navigation />

      <main className="relative bg-background overflow-hidden">
        {/* Grid lines — same as hero */}
        <div className="absolute inset-0 opacity-30 pointer-events-none" aria-hidden="true">
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

        <div className="relative z-10 max-w-[1400px] mx-auto px-6 lg:px-12 pt-36 pb-24 lg:pt-44 lg:pb-32">
          {/* Header */}
          <div className="mb-16 lg:mb-24">
            <span className="inline-flex items-center gap-3 text-sm font-mono text-muted-foreground mb-6">
              <span className="w-8 h-px bg-foreground/30" />
              Contacto
            </span>
            <h1 className="font-display text-[clamp(3rem,6vw,6rem)] leading-[0.9] tracking-tight text-foreground">
              Hablemos.
            </h1>
          </div>

          {/* Two columns */}
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-24">
            {/* Left: info */}
            <div>
              <p className="text-lg text-muted-foreground leading-relaxed mb-12 max-w-md">
                Somos un equipo pequeño.<br />
                Respondemos en menos de 24 horas.
              </p>

              <div className="space-y-0">
                <div className="border-t border-foreground/10 py-6">
                  <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-2">
                    Email de soporte
                  </p>
                  <a
                    href="mailto:soporte@zitly.app"
                    className="text-lg font-medium text-foreground hover:text-primary transition-colors"
                  >
                    soporte@zitly.app
                  </a>
                </div>

                <div className="border-t border-foreground/10 py-6">
                  <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-2">
                    LinkedIn
                  </p>
                  <a
                    href="https://www.linkedin.com/in/alejandro-alejandro-perez-dev/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-lg font-medium text-foreground hover:text-primary transition-colors inline-flex items-center gap-2 group"
                  >
                    Alejandro Pérez López
                    <span className="opacity-40 group-hover:opacity-100 transition-opacity">↗</span>
                  </a>
                </div>

                <div className="border-t border-foreground/10" />
              </div>
            </div>

            {/* Right: form */}
            <div>
              <ContactForm />
            </div>
          </div>
        </div>
      </main>

      <FooterSection />
    </>
  )
}
