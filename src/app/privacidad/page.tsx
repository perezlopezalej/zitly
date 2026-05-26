import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Política de Privacidad — Zitly',
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

export default function PrivacidadPage() {
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
            Política de Privacidad
          </h1>
          <p className="text-sm text-muted-foreground font-mono">
            Última actualización: 25 de mayo de 2026
          </p>
        </div>

        <div className="space-y-0">
          <Section title="Responsable del tratamiento">
            <p>
              <strong className="text-foreground font-medium">Alejandro Pérez López</strong>, en calidad de
              titular de Zitly, es el responsable del tratamiento de los datos personales recogidos a través
              de esta plataforma.
            </p>
            <p>
              Contacto:{' '}
              <a href="mailto:soporte@zitly.app" className="text-primary hover:underline underline-offset-2">
                soporte@zitly.app
              </a>
            </p>
          </Section>

          <Section title="Datos que recogemos">
            <p>Tratamos únicamente los datos necesarios para prestar el servicio:</p>
            <ul className="space-y-2 mt-2">
              <Li>Dirección de email y contraseña (autenticación)</Li>
              <Li>Nombre del negocio</Li>
              <Li>Datos de reservas gestionadas: nombre del cliente, servicio, fecha y hora</Li>
            </ul>
          </Section>

          <Section title="Finalidad del tratamiento">
            <p>
              Los datos se utilizan exclusivamente para la gestión y operación del servicio de
              reservas online que ofrece Zitly a negocios de servicios.
            </p>
          </Section>

          <Section title="Base legal">
            <ul className="space-y-2">
              <Li>
                <strong className="text-foreground font-medium">Consentimiento del usuario</strong>{' '}
                (art. 6.1.a RGPD) — al registrarse y aceptar esta política.
              </Li>
              <Li>
                <strong className="text-foreground font-medium">Ejecución del contrato</strong>{' '}
                (art. 6.1.b RGPD) — para proveer las funcionalidades contratadas.
              </Li>
            </ul>
          </Section>

          <Section title="Conservación de datos">
            <p>
              Los datos se conservan mientras la cuenta esté activa. Tras la baja del servicio,
              los datos se eliminarán en un plazo máximo de 30 días, salvo obligación legal en contrario.
            </p>
          </Section>

          <Section title="Destinatarios">
            <p>
              No cedemos datos a terceros con fines comerciales. Únicamente los compartimos con los
              siguientes encargados del tratamiento, con quienes se han suscrito los acuerdos de
              protección de datos correspondientes:
            </p>
            <ul className="space-y-2 mt-2">
              <Li>
                <strong className="text-foreground font-medium">Supabase Inc.</strong> — almacenamiento de datos y autenticación.
              </Li>
              <Li>
                <strong className="text-foreground font-medium">Vercel Inc.</strong> — alojamiento de la aplicación, acogida al EU-US Data Privacy Framework.
              </Li>
              <Li>
                <strong className="text-foreground font-medium">Resend Inc.</strong> — envío de emails transaccionales (confirmaciones de reserva y bienvenida).
              </Li>
            </ul>
          </Section>

          <Section title="Tus derechos (RGPD)">
            <p>Puedes ejercer en cualquier momento los siguientes derechos:</p>
            <ul className="space-y-2 mt-2">
              <Li>Acceso a tus datos personales</Li>
              <Li>Rectificación de datos inexactos</Li>
              <Li>Supresión («derecho al olvido»)</Li>
              <Li>Portabilidad de tus datos</Li>
              <Li>Oposición y limitación del tratamiento</Li>
            </ul>
            <p className="mt-3">
              Para ejercer estos derechos, escríbenos a{' '}
              <a href="mailto:soporte@zitly.app" className="text-primary hover:underline underline-offset-2">
                soporte@zitly.app
              </a>
              . También puedes presentar una reclamación ante la Agencia Española de Protección de
              Datos en{' '}
              <a
                href="https://www.aepd.es"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline underline-offset-2"
              >
                www.aepd.es
              </a>
              .
            </p>
          </Section>

          <Section title="Cookies">
            <p>
              Zitly utiliza únicamente cookies técnicas estrictamente necesarias para gestionar la
              sesión del usuario. No se emplean cookies de seguimiento ni publicidad.
            </p>
          </Section>
        </div>
      </main>
    </div>
  )
}
