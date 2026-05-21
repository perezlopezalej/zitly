import { getBusiness } from '@/lib/actions'
import ServicesClient from './ServicesClient'

export default async function ServicesPage() {
  const { supabase, businessId } = await getBusiness()

  const { data: services } = await supabase
    .from('services')
    .select('id, name, description, duration_minutes, price')
    .eq('business_id', businessId)
    .order('created_at', { ascending: false })

  return <ServicesClient services={services ?? []} />
}
