'use server'

import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase'
import { sendReminderEmail } from '@/lib/email'

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createSupabaseAdminClient()

  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const tomorrowISO = tomorrow.toISOString().split('T')[0]

  const { data: bookings, error } = await supabase
    .from('bookings')
    .select('date, time, client_name, client_email, service_name, employees(name), businesses(name)')
    .eq('date', tomorrowISO)
    .eq('status', 'confirmed')
    .not('client_email', 'is', null)

  if (error) {
    console.error('[cron/reminders]', error)
    return NextResponse.json({ error: 'Error consultando reservas' }, { status: 500 })
  }

  let sent = 0
  for (const b of bookings ?? []) {
    if (!b.client_email) continue
    const biz = (b as unknown as { businesses: { name: string } | null }).businesses
    const emp = (b as unknown as { employees: { name: string } | null }).employees
    await sendReminderEmail(b.client_email, {
      clientName: b.client_name ?? 'Cliente',
      businessName: biz?.name ?? '',
      serviceName: b.service_name ?? '',
      date: b.date,
      time: b.time,
      employeeName: emp?.name ?? null,
    }).catch(() => {})
    sent++
  }

  return NextResponse.json({ ok: true, sent })
}
