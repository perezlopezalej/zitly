'use server'

import { createSupabaseServerClient } from '@/lib/supabase'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export type ActionResult = { error: string } | undefined

function validateServiceFields(formData: FormData): { error: string } | {
  name: string
  description: string | null
  duration_minutes: number
  price: number
} {
  const name = (formData.get('name') as string)?.trim()
  const description = (formData.get('description') as string)?.trim() || null
  const duration_minutes = parseInt(formData.get('duration_minutes') as string, 10)
  const price = parseFloat(formData.get('price') as string)

  if (!name || name.length < 1 || name.length > 200) {
    return { error: 'El nombre debe tener entre 1 y 200 caracteres' }
  }
  if (description && description.length > 1000) {
    return { error: 'La descripción no puede superar los 1000 caracteres' }
  }
  if (!Number.isInteger(duration_minutes) || duration_minutes < 1 || duration_minutes > 480) {
    return { error: 'La duración debe estar entre 1 y 480 minutos' }
  }
  if (isNaN(price) || price < 0 || price > 99999.99) {
    return { error: 'El precio debe ser un número entre 0 y 99999.99' }
  }

  return { name, description, duration_minutes, price }
}

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
  const validated = validateServiceFields(formData)
  if ('error' in validated) return validated

  let supabase, businessId
  try {
    ;({ supabase, businessId } = await getBusiness())
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Error al obtener el negocio'
    return { error: msg }
  }

  const { error } = await supabase.from('services').insert({
    business_id: businessId,
    ...validated,
  })

  if (error) {
    console.error('[createServiceAction] insert error:', error.message)
    return { error: 'Error al crear el servicio. Inténtalo de nuevo.' }
  }

  revalidatePath('/dashboard/services')
}

export async function updateServiceAction(formData: FormData): Promise<ActionResult> {
  const validated = validateServiceFields(formData)
  if ('error' in validated) return validated

  const id = (formData.get('id') as string)?.trim()
  if (!id) return { error: 'ID de servicio no válido' }

  let supabase, businessId
  try {
    ;({ supabase, businessId } = await getBusiness())
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Error al obtener el negocio'
    return { error: msg }
  }

  const { error } = await supabase
    .from('services')
    .update(validated)
    .eq('id', id)
    .eq('business_id', businessId)

  if (error) {
    console.error('[updateServiceAction] update error:', error.message)
    return { error: 'Error al actualizar el servicio. Inténtalo de nuevo.' }
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
    return { error: 'Error al eliminar el servicio. Inténtalo de nuevo.' }
  }

  revalidatePath('/dashboard/services')
}
