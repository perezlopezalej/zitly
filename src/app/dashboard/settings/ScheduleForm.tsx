'use client'

import { useActionState } from 'react'
import { updateScheduleAction } from '@/app/actions/business'
import type { SettingsState } from '@/types'
import { ErrorAlert } from '@/components/ErrorAlert'

const TIME_OPTIONS: string[] = []
for (let h = 6; h <= 23; h++) {
  TIME_OPTIONS.push(`${String(h).padStart(2, '0')}:00`)
  if (h < 23) TIME_OPTIONS.push(`${String(h).padStart(2, '0')}:30`)
}

const DAYS = [
  { value: 'monday',    label: 'Lunes' },
  { value: 'tuesday',   label: 'Martes' },
  { value: 'wednesday', label: 'Miércoles' },
  { value: 'thursday',  label: 'Jueves' },
  { value: 'friday',    label: 'Viernes' },
  { value: 'saturday',  label: 'Sábado' },
  { value: 'sunday',    label: 'Domingo' },
]

type Props = {
  initialData: {
    opening_time: string | null
    closing_time: string | null
    active_days: string[] | null
  }
}

const selectClass =
  'block w-full rounded-lg border border-brand-border bg-white px-3 py-2 text-sm text-brand-ink focus:border-brand-green focus:outline-none focus:ring-2 focus:ring-brand-green-subtle transition-colors'

export default function ScheduleForm({ initialData }: Props) {
  const [state, action, pending] = useActionState<SettingsState, FormData>(
    updateScheduleAction,
    undefined,
  )

  const defaultDays = initialData.active_days ?? [
    'monday', 'tuesday', 'wednesday', 'thursday', 'friday',
  ]

  return (
    <form action={action} className="space-y-5">
      {state?.error   && <ErrorAlert message={state.error} />}
      {state?.success && (
        <div className="rounded-md bg-green-50 border border-green-200 p-3">
          <p className="text-sm text-green-700">{state.success}</p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="opening_time" className="block text-sm font-medium text-brand-ink mb-1">
            Hora de apertura
          </label>
          <select
            id="opening_time" name="opening_time"
            defaultValue={initialData.opening_time ?? '09:00'}
            className={selectClass}
          >
            {TIME_OPTIONS.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="closing_time" className="block text-sm font-medium text-brand-ink mb-1">
            Hora de cierre
          </label>
          <select
            id="closing_time" name="closing_time"
            defaultValue={initialData.closing_time ?? '18:00'}
            className={selectClass}
          >
            {TIME_OPTIONS.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <p className="text-sm font-medium text-brand-ink mb-3">Días de atención</p>
        <div className="flex flex-wrap gap-x-5 gap-y-2">
          {DAYS.map(({ value, label }) => (
            <label key={value} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="active_days"
                value={value}
                defaultChecked={defaultDays.includes(value)}
                className="h-4 w-4 rounded border-brand-border text-brand-green focus:ring-2 focus:ring-brand-green focus:ring-offset-0"
              />
              <span className="text-sm text-brand-ink">{label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="pt-2">
        <button
          type="submit" disabled={pending}
          className="px-5 py-2 rounded-lg text-sm font-medium text-white bg-brand-green hover:bg-brand-green-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-green disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {pending ? 'Guardando…' : 'Guardar horario'}
        </button>
      </div>
    </form>
  )
}
