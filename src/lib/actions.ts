import { createSupabaseServerClient } from '@/lib/supabase'
import { redirect } from 'next/navigation'

export async function getBusiness() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: business } = await supabase
    .from('businesses')
    .select('id, name')
    .eq('owner_id', user.id)
    .single()

  if (!business) throw new Error('Negocio no encontrado')
  return {
    supabase,
    businessId: business.id as string,
    businessName: business.name as string,
  }
}
