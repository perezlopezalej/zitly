'use server'

import { createSupabaseServerClient } from '@/lib/supabase'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export type ActionResult = { error: string } | undefined

async function getBusiness() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError) {
    console.error('[getBusiness] auth error:', authError.message)
    redirect('/auth/login')
  }
  if (!user) redirect('/auth/login')

  const { data: business, error: bizError } = await supabase
    .from('businesses')
    .select('id')
    .eq('owner_id', user.id)
    .single()

  if (bizError) {
    console.error('[getBusiness] query error:', bizError.message, '| user:', user.id)
    throw new Error(`Error al obtener el negocio: ${bizError.message}`)
  }
  if (!business) {
    console.error('[getBusiness] no business for user:', user.id)
    throw new Error('No se encontró ningún negocio para este usuario')
  }

  return { supabase, businessId: business.id as string }
}

export async function createServiceAction(formData: FormData): Promise<ActionResult> {
  let supabase, businessId
  try {
    ;({ supabase, businessId } = await getBusiness())
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Error al obtener el negocio'
    return { error: msg }
  }

  const { error } = await supabase.from('services').insert({
    business_id: businessId,
    name: formData.get('name') as string,
    description: (formData.get('description') as string) || null,
    duration_minutes: parseInt(formData.get('duration_minutes') as string, 10),
    price: parseFloat(formData.get('price') as string),
  })

  if (error) {
    console.error('[createServiceAction] insert error:', error.message)
    return { error: error.message }
  }

  revalidatePath('/dashboard/services')
}

export async function updateServiceAction(formData: FormData): Promise<ActionResult> {
  let supabase, businessId
  try {
    ;({ supabase, businessId } = await getBusiness())
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Error al obtener el negocio'
    return { error: msg }
  }

  const id = formData.get('id') as string

  const { error } = await supabase
    .from('services')
    .update({
      name: formData.get('name') as string,
      description: (formData.get('description') as string) || null,
      duration_minutes: parseInt(formData.get('duration_minutes') as string, 10),
      price: parseFloat(formData.get('price') as string),
    })
    .eq('id', id)
    .eq('business_id', businessId)

  if (error) {
    console.error('[updateServiceAction] update error:', error.message)
    return { error: error.message }
  }

  revalidatePath('/dashboard/services')
}

export async function deleteServiceAction(id: string): Promise<ActionResult> {
  let supabase, businessId
  try {
    ;({ supabase, businessId } = await getBusiness())
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Error al obtener el negocio'
    return { error: msg }
  }

  const { error } = await supabase
    .from('services')
    .delete()
    .eq('id', id)
    .eq('business_id', businessId)

  if (error) {
    console.error('[deleteServiceAction] delete error:', error.message)
    return { error: error.message }
  }

  revalidatePath('/dashboard/services')
}
