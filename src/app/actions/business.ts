'use server'

import { getBusiness } from '@/lib/actions'
import { revalidatePath } from 'next/cache'
import { isRedirectError } from 'next/dist/client/components/redirect-error'

export type SettingsState = { error?: string; success?: string } | undefined

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const TIME_RE  = /^([01]\d|2[0-3]):[0-5]\d$/

export async function updateBusinessAction(
  state: SettingsState,
  formData: FormData,
): Promise<SettingsState> {
  const name          = (formData.get('name') as string)?.trim()
  const category      = (formData.get('category') as string)?.trim() || null
  const address       = (formData.get('address') as string)?.trim() || null
  const phone         = (formData.get('phone') as string)?.trim() || null
  const contact_email = (formData.get('contact_email') as string)?.trim() || null

  if (!name || name.length < 2 || name.length > 100) {
    return { error: 'El nombre debe tener entre 2 y 100 caracteres' }
  }
  if (contact_email && !EMAIL_RE.test(contact_email)) {
    return { error: 'El email de contacto no es válido' }
  }

  let supabase, businessId
  try {
    ;({ supabase, businessId } = await getBusiness())
  } catch (e) {
    if (isRedirectError(e)) throw e
    return { error: 'Error de conexión. Inténtalo de nuevo.' }
  }

  const { error } = await supabase
    .from('businesses')
    .update({ name, category, address, phone, contact_email })
    .eq('id', businessId)

  if (error) return { error: 'Error al guardar los cambios. Inténtalo de nuevo.' }

  revalidatePath('/dashboard/settings')
  revalidatePath('/dashboard')
  return { success: 'Cambios guardados correctamente' }
}

export async function updateScheduleAction(
  state: SettingsState,
  formData: FormData,
): Promise<SettingsState> {
  const opening_time = (formData.get('opening_time') as string)?.trim()
  const closing_time = (formData.get('closing_time') as string)?.trim()
  const active_days  = formData.getAll('active_days') as string[]

  if (!opening_time || !TIME_RE.test(opening_time)) {
    return { error: 'Hora de apertura no válida' }
  }
  if (!closing_time || !TIME_RE.test(closing_time)) {
    return { error: 'Hora de cierre no válida' }
  }

  const [oh, om] = opening_time.split(':').map(Number)
  const [ch, cm] = closing_time.split(':').map(Number)
  if (oh * 60 + om >= ch * 60 + cm) {
    return { error: 'La hora de apertura debe ser anterior a la de cierre' }
  }

  let supabase, businessId
  try {
    ;({ supabase, businessId } = await getBusiness())
  } catch (e) {
    if (isRedirectError(e)) throw e
    return { error: 'Error de conexión. Inténtalo de nuevo.' }
  }

  const { error } = await supabase
    .from('businesses')
    .update({ opening_time, closing_time, active_days })
    .eq('id', businessId)

  if (error) return { error: 'Error al guardar el horario. Inténtalo de nuevo.' }

  revalidatePath('/dashboard/settings')
  return { success: 'Horario guardado correctamente' }
}
