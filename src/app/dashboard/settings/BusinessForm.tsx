'use client'

import { useActionState } from 'react'
import { updateBusinessAction } from '@/app/actions/business'
import type { SettingsState } from '@/types'
import { ErrorAlert } from '@/components/ErrorAlert'

const CATEGORIES = [
  { value: 'general',     label: 'General' },
  { value: 'peluqueria',  label: 'Peluquería' },
  { value: 'estetica',    label: 'Estética y belleza' },
  { value: 'salud',       label: 'Salud y bienestar' },
  { value: 'fitness',     label: 'Fitness y deporte' },
  { value: 'tatuajes',    label: 'Tatuajes y piercing' },
  { value: 'veterinaria', label: 'Veterinaria' },
  { value: 'otros',       label: 'Otros' },
]

type Props = {
  initialData: {
    name: string
    category: string | null
    address: string | null
    phone: string | null
    contact_email: string | null
  }
}

const inputClass =
  'block w-full rounded-lg border border-brand-border bg-white px-3 py-2 text-sm text-brand-ink placeholder-brand-muted focus:border-brand-green focus:outline-none focus:ring-2 focus:ring-brand-green-subtle transition-colors'

export default function BusinessForm({ initialData }: Props) {
  const [state, action, pending] = useActionState<SettingsState, FormData>(
    updateBusinessAction,
    undefined,
  )

  return (
    <form action={action} className="space-y-4">
      {state?.error   && <ErrorAlert message={state.error} />}
      {state?.success && (
        <div className="rounded-md bg-green-50 border border-green-200 p-3">
          <p className="text-sm text-green-700">{state.success}</p>
        </div>
      )}

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-brand-ink mb-1">
          Nombre del negocio <span className="text-red-500">*</span>
        </label>
        <input
          id="name" name="name" type="text" required
          defaultValue={initialData.name}
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="category" className="block text-sm font-medium text-brand-ink mb-1">
          Categoría
        </label>
        <select
          id="category" name="category"
          defaultValue={initialData.category ?? 'general'}
          className={inputClass}
        >
          {CATEGORIES.map(({ value, label }) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="address" className="block text-sm font-medium text-brand-ink mb-1">
          Dirección
        </label>
        <input
          id="address" name="address" type="text"
          defaultValue={initialData.address ?? ''}
          placeholder="Calle Ejemplo 1, Madrid"
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-brand-ink mb-1">
          Teléfono
        </label>
        <input
          id="phone" name="phone" type="tel"
          defaultValue={initialData.phone ?? ''}
          placeholder="+34 600 000 000"
          autoComplete="tel"
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="contact_email" className="block text-sm font-medium text-brand-ink mb-1">
          Email de contacto
        </label>
        <input
          id="contact_email" name="contact_email" type="email"
          defaultValue={initialData.contact_email ?? ''}
          placeholder="contacto@minegocio.com"
          className={inputClass}
        />
      </div>

      <div className="pt-2">
        <button
          type="submit" disabled={pending}
          className="px-5 py-2 rounded-lg text-sm font-medium text-white bg-brand-green hover:bg-brand-green-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-green disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {pending ? 'Guardando…' : 'Guardar cambios'}
        </button>
      </div>
    </form>
  )
}
