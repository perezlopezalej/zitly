export type RegisterEmailProps = {
  businessName: string
}

export function RegisterEmail({ businessName }: RegisterEmailProps) {
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
                  {/* Header */}
                  <tbody>
                    <tr>
                      <td style={{ backgroundColor: '#2C5F3F', padding: '32px 40px' }}>
                        <p style={{ margin: 0, fontSize: '24px', fontFamily: 'Georgia, serif', color: '#ffffff', letterSpacing: '-0.5px' }}>
                          Zitly
                        </p>
                      </td>
                    </tr>

                    {/* Body */}
                    <tr>
                      <td style={{ padding: '40px 40px 32px' }}>
                        <h1 style={{ margin: '0 0 8px', fontSize: '28px', fontFamily: 'Georgia, serif', color: '#16130E', lineHeight: '1.2', letterSpacing: '-0.5px' }}>
                          Bienvenido a Zitly
                        </h1>
                        <p style={{ margin: '0 0 24px', fontSize: '16px', color: '#5C6E62', lineHeight: '1.6' }}>
                          Tu negocio <strong style={{ color: '#16130E' }}>{businessName}</strong> ya tiene su página de reservas lista.
                        </p>
                        <p style={{ margin: '0 0 32px', fontSize: '15px', color: '#5C6E62', lineHeight: '1.6' }}>
                          Desde el dashboard puedes añadir tus servicios, configurar tu equipo y compartir tu enlace de reservas con tus clientes.
                        </p>

                        {/* CTA Button */}
                        <table cellPadding={0} cellSpacing={0}>
                          <tbody>
                            <tr>
                              <td style={{ borderRadius: '100px', backgroundColor: '#2C5F3F' }}>
                                <a
                                  href="https://zitly.es/dashboard"
                                  style={{ display: 'inline-block', padding: '12px 28px', fontSize: '14px', fontWeight: 600, color: '#ffffff', textDecoration: 'none', borderRadius: '100px' }}
                                >
                                  Ir al dashboard →
                                </a>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </td>
                    </tr>

                    {/* Divider */}
                    <tr>
                      <td style={{ padding: '0 40px' }}>
                        <hr style={{ border: 'none', borderTop: '1px solid #E5E2DC', margin: 0 }} />
                      </td>
                    </tr>

                    {/* Footer */}
                    <tr>
                      <td style={{ padding: '24px 40px 32px' }}>
                        <p style={{ margin: 0, fontSize: '12px', color: '#9CA89E', lineHeight: '1.6' }}>
                          Si tienes alguna duda, escríbenos a{' '}
                          <a href="mailto:soporte@zitly.app" style={{ color: '#2C5F3F', textDecoration: 'none' }}>
                            soporte@zitly.app
                          </a>
                          . Respondemos en menos de 24 horas.
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
