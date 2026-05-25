import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Términos de Uso — Zitly',
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-foreground/10 pt-10 pb-2">
      <h2 className="font-display text-2xl text-foreground mb-4">{title}</h2>
      <div className="space-y-3 text-muted-foreground leading-relaxed">{children}</div>
    </section>
  )
}

function Li({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex gap-3">
      <span className="text-primary shrink-0 mt-0.5">—</span>
      <span>{children}</span>
    </li>
  )
}

export default function TerminosPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-foreground/10 sticky top-0 bg-background/80 backdrop-blur-md z-10">
        <div className="max-w-3xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="font-display text-xl text-foreground">
            Zitly
          </Link>
          <Link
            href="/"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5"
          >
            ← Volver al inicio
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-16 lg:py-24">
        <div className="mb-14">
          <span className="inline-flex items-center gap-3 text-xs font-mono text-muted-foreground mb-5">
            <span className="w-6 h-px bg-foreground/30" />
            Legal
          </span>
          <h1 className="font-display text-4xl lg:text-5xl text-foreground leading-tight mb-3">
            Términos de Uso
          </h1>
          <p className="text-sm text-muted-foreground font-mono">
            Última actualización: 25 de mayo de 2026
          </p>
        </div>

        <div className="space-y-0">
          <Section title="Objeto del servicio">
            <p>
              Zitly es una plataforma SaaS de gestión de reservas online dirigida a negocios de
              servicios. Al crear una cuenta, el usuario acepta los presentes términos y se compromete
              a hacer un uso lícito del servicio.
            </p>
          </Section>

          <Section title="Uso permitido">
            <p>El servicio está destinado exclusivamente a:</p>
            <ul className="space-y-2 mt-2">
              <Li>Negocios de servicios establecidos y que operen de forma legal en España.</Li>
              <Li>Uso personal y profesional del titular de la cuenta.</Li>
            </ul>
            <p className="mt-3">Queda expresamente prohibido:</p>
            <ul className="space-y-2 mt-2">
              <Li>El uso fraudulento, la suplantación de identidad o cualquier actividad ilegal.</Li>
              <Li>El acceso automatizado no autorizado a la plataforma (scraping, bots).</Li>
              <Li>La reventa o sublicencia del servicio a terceros.</Li>
            </ul>
          </Section>

          <Section title="Responsabilidad">
            <p>
              Zitly proporciona la infraestructura técnica para gestionar reservas. No actúa como
              parte en la relación entre el negocio y sus clientes finales.
            </p>
            <p>
              Zitly no se hace responsable de:
            </p>
            <ul className="space-y-2 mt-2">
              <Li>Reservas no atendidas o canceladas por el negocio.</Li>
              <Li>Errores en los horarios o servicios configurados por el propio usuario.</Li>
              <Li>Pérdida de beneficio derivada de interrupciones del servicio.</Li>
            </ul>
            <p className="mt-3">
              Nos comprometemos a mantener una disponibilidad razonable del servicio y a comunicar
              con antelación cualquier mantenimiento programado.
            </p>
          </Section>

          <Section title="Plan gratuito y precios">
            <p>
              Zitly ofrece actualmente un plan gratuito. Este plan puede ser modificado, limitado o
              discontinuado mediante preaviso de{' '}
              <strong className="text-foreground font-medium">30 días naturales</strong>, comunicado
              por email a la dirección registrada en la cuenta.
            </p>
            <p>
              Cualquier cambio en la estructura de precios se notificará con la misma antelación.
              El uso continuado del servicio tras dicho plazo implica la aceptación de las nuevas
              condiciones.
            </p>
          </Section>

          <Section title="Propiedad intelectual">
            <p>
              El software, diseño, marca y contenidos de Zitly son propiedad de{' '}
              <strong className="text-foreground font-medium">Alejandro Pérez López</strong>. Queda
              prohibida su reproducción, distribución o modificación sin autorización expresa.
            </p>
            <p>
              Los datos introducidos por el usuario (información de su negocio, servicios y reservas)
              son de su exclusiva propiedad.
            </p>
          </Section>

          <Section title="Modificaciones de los términos">
            <p>
              Zitly se reserva el derecho de actualizar estos términos. Los cambios se comunicarán
              por email con un mínimo de{' '}
              <strong className="text-foreground font-medium">15 días de antelación</strong>.
            </p>
          </Section>

          <Section title="Ley aplicable y jurisdicción">
            <p>
              Los presentes términos se rigen por la{' '}
              <strong className="text-foreground font-medium">legislación española</strong>. Para
              cualquier controversia derivada del uso del servicio, las partes se someten a los
              juzgados y tribunales de la ciudad de Madrid, con renuncia expresa a cualquier otro
              fuero que pudiera corresponderles.
            </p>
          </Section>

          <Section title="Contacto">
            <p>
              Para cualquier consulta sobre estos términos, contacta en{' '}
              <a href="mailto:soporte@zitly.app" className="text-primary hover:underline underline-offset-2">
                soporte@zitly.app
              </a>
              .
            </p>
          </Section>
        </div>
      </main>
    </div>
  )
}
