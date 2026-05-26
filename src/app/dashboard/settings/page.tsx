import { createSupabaseServerClient } from '@/lib/supabase'
import { redirect } from 'next/navigation'
import BusinessForm from './BusinessForm'
import ScheduleForm from './ScheduleForm'
import PasswordForm from './PasswordForm'

export default async function SettingsPage() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: business } = await supabase
    .from('businesses')
    .select('id, name, category, address, phone, contact_email, opening_time, closing_time, active_days')
    .eq('owner_id', user.id)
    .single()

  if (!business) redirect('/auth/login')

  const biz = business as {
    id: string
    name: string
    category: string | null
    address: string | null
    phone: string | null
    contact_email: string | null
    opening_time: string | null
    closing_time: string | null
    active_days: string[] | null
  }

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-brand-ink">Ajustes</h1>
        <p className="text-sm text-brand-muted mt-1">
          Gestiona los datos y configuración de tu negocio
        </p>
      </div>

      <section className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-base font-semibold text-brand-ink mb-5">Datos del negocio</h2>
        <BusinessForm initialData={biz} />
      </section>

      <section className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-base font-semibold text-brand-ink mb-5">Horario de atención</h2>
        <ScheduleForm initialData={biz} />
      </section>

      <section className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-base font-semibold text-brand-ink mb-5">Seguridad</h2>
        <PasswordForm />
      </section>
    </div>
  )
}
