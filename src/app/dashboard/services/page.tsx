import { createSupabaseServerClient } from '@/lib/supabase'
import { redirect } from 'next/navigation'
import ServicesClient from './ServicesClient'

export default async function ServicesPage() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const { data: business } = await supabase
    .from('businesses')
    .select('id')
    .eq('owner_id', user.id)
    .single()

  const { data: services } = await supabase
    .from('services')
    .select('id, name, description, duration_minutes, price')
    .eq('business_id', business?.id ?? '')
    .order('created_at', { ascending: false })

  return <ServicesClient services={services ?? []} />
}
