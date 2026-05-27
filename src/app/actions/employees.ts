'use server'

import { getBusiness } from '@/lib/actions'
import { validateLength } from '@/lib/validation'
import { revalidatePath } from 'next/cache'
import { isRedirectError } from 'next/dist/client/components/redirect-error'
import { countActiveBookings } from '@/lib/booking'
import type { ActionResult } from '@/types'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function createEmployeeAction(formData: FormData): Promise<ActionResult> {
  const name = (formData.get('name') as string)?.trim()

  if (!name || !validateLength(name, 1, 100)) return { error: 'El nombre debe tener entre 1 y 100 caracteres' }

  let supabase, businessId
  try {
    ;({ supabase, businessId } = await getBusiness())
  } catch (e) {
    if (isRedirectError(e)) throw e
    return { error: 'Error de conexión. Inténtalo de nuevo.' }
  }

  const { error } = await supabase.from('employees').insert({
    business_id: businessId,
    name,
  })

  if (error) return { error: 'Error al crear el empleado. Inténtalo de nuevo.' }

  revalidatePath('/dashboard/employees')
}

export async function updateEmployeeAction(formData: FormData): Promise<ActionResult> {
  const id = (formData.get('id') as string)?.trim()
  const name = (formData.get('name') as string)?.trim()

  if (!id || !UUID_RE.test(id)) return { error: 'ID de empleado no válido' }
  if (!name || !validateLength(name, 1, 100)) return { error: 'El nombre debe tener entre 1 y 100 caracteres' }

  let supabase, businessId
  try {
    ;({ supabase, businessId } = await getBusiness())
  } catch (e) {
    if (isRedirectError(e)) throw e
    return { error: 'Error de conexión. Inténtalo de nuevo.' }
  }

  const { error } = await supabase
    .from('employees')
    .update({ name })
    .eq('id', id)
    .eq('business_id', businessId)

  if (error) return { error: 'Error al actualizar el empleado. Inténtalo de nuevo.' }

  revalidatePath('/dashboard/employees')
}

export async function deleteEmployeeAction(formData: FormData): Promise<ActionResult> {
  const id = (formData.get('id') as string)?.trim()
  if (!id || !UUID_RE.test(id)) return

  let supabase, businessId
  try {
    ;({ supabase, businessId } = await getBusiness())
  } catch (e) {
    if (isRedirectError(e)) throw e
    return { error: 'Error de conexión. Inténtalo de nuevo.' }
  }

  // Block deletion if active bookings reference this employee (FK constraint)
  const activeCount = await countActiveBookings(supabase, 'employee_id', id, businessId)
  if (activeCount > 0) {
    return {
      error: `Este empleado tiene ${activeCount} reserva${activeCount === 1 ? '' : 's'} activa${activeCount === 1 ? '' : 's'}. Cancélalas antes de eliminarlo.`,
    }
  }

  const { error } = await supabase
    .from('employees')
    .delete()
    .eq('id', id)
    .eq('business_id', businessId)

  if (error) return { error: 'Error al eliminar el empleado. Inténtalo de nuevo.' }

  revalidatePath('/dashboard/employees')
}
