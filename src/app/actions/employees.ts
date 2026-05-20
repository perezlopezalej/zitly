'use server'

import { createSupabaseServerClient } from '@/lib/supabase'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

async function getBusiness() {
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

  if (!business) throw new Error('Negocio no encontrado')
  return { supabase, businessId: business.id as string }
}

export async function createEmployeeAction(formData: FormData) {
  const name = (formData.get('name') as string)?.trim()

  if (!name || name.length < 1 || name.length > 100) {
    return
  }

  const { supabase, businessId } = await getBusiness()

  await supabase.from('employees').insert({
    business_id: businessId,
    name,
  })

  revalidatePath('/dashboard/employees')
}

export async function deleteEmployeeAction(formData: FormData) {
  const { supabase, businessId } = await getBusiness()
  const id = formData.get('id') as string

  await supabase
    .from('employees')
    .delete()
    .eq('id', id)
    .eq('business_id', businessId)

  revalidatePath('/dashboard/employees')
}
