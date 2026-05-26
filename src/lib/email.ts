import { Resend } from 'resend'
import { createElement } from 'react'
import { RegisterEmail } from './emails/confirmation-register'
import { BookingEmail } from './emails/confirmation-booking'
import type { BookingEmailProps } from './emails/confirmation-booking'
import { ReminderEmail } from './emails/reminder-booking'
import type { ReminderEmailProps } from './emails/reminder-booking'

const FROM = 'onboarding@resend.dev'

function getResend(): Resend | null {
  const key = process.env.RESEND_API_KEY
  if (!key) return null
  return new Resend(key)
}

export async function sendWelcomeEmail(to: string, businessName: string): Promise<void> {
  const resend = getResend()
  if (!resend) return

  await resend.emails.send({
    from: FROM,
    to,
    subject: 'Bienvenido a Zitly 🎉',
    react: createElement(RegisterEmail, { businessName }),
  })
}

export async function sendBookingConfirmationEmail(
  to: string,
  props: BookingEmailProps,
): Promise<void> {
  const resend = getResend()
  if (!resend) return

  await resend.emails.send({
    from: FROM,
    to,
    subject: 'Hemos recibido tu reserva',
    react: createElement(BookingEmail, props),
  })
}

export async function sendReminderEmail(
  to: string,
  props: ReminderEmailProps,
): Promise<void> {
  const resend = getResend()
  if (!resend) return

  await resend.emails.send({
    from: FROM,
    to,
    subject: 'Recordatorio: tu cita es mañana',
    react: createElement(ReminderEmail, props),
  })
}
