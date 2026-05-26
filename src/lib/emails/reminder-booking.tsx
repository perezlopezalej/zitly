export type ReminderEmailProps = {
  clientName: string
  businessName: string
  serviceName: string
  date: string       // ISO: YYYY-MM-DD
  time: string       // HH:MM
  employeeName: string | null
}

function formatDate(iso: string): string {
  const [year, month, day] = iso.split('-').map(Number)
  return new Date(year, month - 1, day).toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <tr>
      <td style={{ padding: '10px 0', borderBottom: '1px solid #E5E2DC', fontSize: '14px', color: '#9CA89E', width: '40%' }}>
        {label}
      </td>
      <td style={{ padding: '10px 0', borderBottom: '1px solid #E5E2DC', fontSize: '14px', color: '#16130E', fontWeight: 600 }}>
        {value}
      </td>
    </tr>
  )
}

export function ReminderEmail({ clientName, businessName, serviceName, date, time, employeeName }: ReminderEmailProps) {
  return (
    <html lang="es">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body style={{ margin: 0, padding: 0, backgroundColor: '#F6F4EF', fontFamily: 'Arial, Helvetica, sans-serif' }}>
        <table width="100%" cellPadding={0} cellSpacing={0} style={{ backgroundColor: '#F6F4EF', padding: '40px 16px' }}>
          <tbody>
            <tr>
              <td align="center">
                <table width="100%" cellPadding={0} cellSpacing={0} style={{ maxWidth: '560px', backgroundColor: '#ffffff', borderRadius: '8px', overflow: 'hidden', border: '1px solid #E5E2DC' }}>
                  <tbody>
                    <tr>
                      <td style={{ backgroundColor: '#2C5F3F', padding: '32px 40px' }}>
                        <p style={{ margin: '0 0 4px', fontSize: '24px', fontFamily: 'Georgia, serif', color: '#ffffff', letterSpacing: '-0.5px' }}>
                          Zitly
                        </p>
                        <p style={{ margin: 0, fontSize: '13px', color: 'rgba(255,255,255,0.65)' }}>
                          Recordatorio de cita
                        </p>
                      </td>
                    </tr>

                    <tr>
                      <td style={{ padding: '40px 40px 32px' }}>
                        <h1 style={{ margin: '0 0 8px', fontSize: '26px', fontFamily: 'Georgia, serif', color: '#16130E', lineHeight: '1.2', letterSpacing: '-0.5px' }}>
                          Tu cita es mañana
                        </h1>
                        <p style={{ margin: '0 0 32px', fontSize: '15px', color: '#5C6E62', lineHeight: '1.6' }}>
                          Hola <strong style={{ color: '#16130E' }}>{clientName}</strong>, te recordamos que tienes una cita confirmada en{' '}
                          <strong style={{ color: '#16130E' }}>{businessName}</strong> mañana.
                        </p>

                        <table width="100%" cellPadding={0} cellSpacing={0} style={{ marginBottom: '32px' }}>
                          <tbody>
                            <Row label="Servicio" value={serviceName} />
                            <Row label="Fecha" value={formatDate(date)} />
                            <Row label="Hora" value={time} />
                            {employeeName && <Row label="Profesional" value={employeeName} />}
                          </tbody>
                        </table>

                        <p style={{ margin: 0, fontSize: '14px', color: '#9CA89E', lineHeight: '1.6', backgroundColor: '#F6F4EF', borderRadius: '6px', padding: '14px 16px' }}>
                          Si necesitas cancelar o cambiar la cita, contacta directamente con {businessName}.
                        </p>
                      </td>
                    </tr>

                    <tr>
                      <td style={{ padding: '0 40px' }}>
                        <hr style={{ border: 'none', borderTop: '1px solid #E5E2DC', margin: 0 }} />
                      </td>
                    </tr>

                    <tr>
                      <td style={{ padding: '24px 40px 32px' }}>
                        <p style={{ margin: 0, fontSize: '12px', color: '#9CA89E', lineHeight: '1.6' }}>
                          Este email fue generado automáticamente por{' '}
                          <a href="https://zitly.es" style={{ color: '#2C5F3F', textDecoration: 'none' }}>
                            Zitly
                          </a>
                          . Si crees que es un error, escríbenos a{' '}
                          <a href="mailto:soporte@zitly.app" style={{ color: '#2C5F3F', textDecoration: 'none' }}>
                            soporte@zitly.app
                          </a>
                          .
                        </p>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>
          </tbody>
        </table>
      </body>
    </html>
  )
}
