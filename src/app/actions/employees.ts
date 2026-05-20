'use server'

import { getBusiness } from '@/lib/actions'
import { validateLength } from '@/lib/validation'
import { revalidatePath } from 'next/cache'

export async function createEmployeeAction(formData: FormData) {
  const name = (formData.get('name') as string)?.trim()

  if (!name || !validateLength(name, 1, 100)) {
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
