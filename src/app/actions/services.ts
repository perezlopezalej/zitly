'use server'

import { getBusiness } from '@/lib/actions'
import { validateLength } from '@/lib/validation'
import { revalidatePath } from 'next/cache'
import { isRedirectError } from 'next/dist/client/components/redirect-error'
import { countActiveBookings } from '@/lib/booking'
import type { ActionResult } from '@/types'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

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

  if (!name || !validateLength(name, 1, 200)) {
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

export async function createServiceAction(formData: FormData): Promise<ActionResult> {
  const validated = validateServiceFields(formData)
  if ('error' in validated) return validated

  let supabase, businessId
  try {
    ;({ supabase, businessId } = await getBusiness())
  } catch (e) {
    if (isRedirectError(e)) throw e
    return { error: 'Error de conexión. Inténtalo de nuevo.' }
  }

  const { error } = await supabase.from('services').insert({
    business_id: businessId,
    ...validated,
  })

  if (error) return { error: 'Error al crear el servicio. Inténtalo de nuevo.' }

  revalidatePath('/dashboard/services')
}

export async function updateServiceAction(formData: FormData): Promise<ActionResult> {
  const validated = validateServiceFields(formData)
  if ('error' in validated) return validated

  const id = (formData.get('id') as string)?.trim()
  if (!id || !UUID_RE.test(id)) return { error: 'ID de servicio no válido' }

  let supabase, businessId
  try {
    ;({ supabase, businessId } = await getBusiness())
  } catch (e) {
    if (isRedirectError(e)) throw e
    return { error: 'Error de conexión. Inténtalo de nuevo.' }
  }

  const { error } = await supabase
    .from('services')
    .update(validated)
    .eq('id', id)
    .eq('business_id', businessId)

  if (error) return { error: 'Error al actualizar el servicio. Inténtalo de nuevo.' }

  revalidatePath('/dashboard/services')
}

export async function deleteServiceAction(id: string): Promise<ActionResult> {
  if (!UUID_RE.test(id)) return { error: 'ID de servicio no válido' }

  let supabase, businessId
  try {
    ;({ supabase, businessId } = await getBusiness())
  } catch (e) {
    if (isRedirectError(e)) throw e
    return { error: 'Error de conexión. Inténtalo de nuevo.' }
  }

  // Block deletion if any booking (including cancelled) references this service.
  // Postgres ON DELETE SET NULL fails when service_id is NOT NULL — check first
  // to surface a clear message instead of a generic DB error.
  const activeCount = await countActiveBookings(supabase, 'service_id', id, businessId)
  if (activeCount > 0) {
    return {
      error: `Este servicio tiene ${activeCount} reserva${activeCount === 1 ? '' : 's'} activa${activeCount === 1 ? '' : 's'}. Cancélalas antes de eliminarlo.`,
    }
  }

  const { error } = await supabase
    .from('services')
    .delete()
    .eq('id', id)
    .eq('business_id', businessId)

  if (error) {
    console.error('[deleteService]', error.code, error.message)
    return { error: 'Error al eliminar el servicio. Inténtalo de nuevo.' }
  }

  revalidatePath('/dashboard/services')
}
