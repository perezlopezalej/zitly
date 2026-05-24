'use client'

import { useActionState, useState } from 'react'
import { updateBookingStatusAction } from '@/app/actions/booking'
import type { ActionResult } from '@/types'

export function ConfirmButton({ bookingId }: { bookingId: string }) {
  const [state, action, pending] = useActionState<ActionResult, FormData>(
    updateBookingStatusAction,
    undefined,
  )
  return (
    <div className="flex flex-col items-end gap-1">
      <form action={action}>
        <input type="hidden" name="bookingId" value={bookingId} />
        <input type="hidden" name="status" value="confirmed" />
        <button
          type="submit"
          disabled={pending}
          className="px-3 py-1.5 text-xs font-medium rounded-lg bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 transition-colors disabled:opacity-50"
        >
          {pending ? 'Guardando…' : 'Confirmar'}
        </button>
      </form>
      {state?.error && <p className="text-xs text-red-600">{state.error}</p>}
    </div>
  )
}

export function CancelButton({ bookingId }: { bookingId: string }) {
  const [confirming, setConfirming] = useState(false)
  const [state, action, pending] = useActionState<ActionResult, FormData>(
    updateBookingStatusAction,
    undefined,
  )

  if (confirming) {
    return (
      <div className="flex flex-col items-end gap-1.5">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-600">¿Cancelar esta reserva?</span>
          <button
            type="button"
            onClick={() => setConfirming(false)}
            className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
          >
            No
          </button>
          <form action={action}>
            <input type="hidden" name="bookingId" value={bookingId} />
            <input type="hidden" name="status" value="cancelled" />
            <button
              type="submit"
              disabled={pending}
              className="px-3 py-1.5 text-xs font-medium rounded-lg bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 transition-colors disabled:opacity-50"
            >
              {pending ? 'Guardando…' : 'Sí, cancelar'}
            </button>
          </form>
        </div>
        {state?.error && <p className="text-xs text-red-600 text-right">{state.error}</p>}
      </div>
    )
  }

  return (
    <div className="flex flex-col items-end gap-1">
      {state?.error && <p className="text-xs text-red-600">{state.error}</p>}
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="px-3 py-1.5 text-xs font-medium rounded-lg bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 transition-colors"
      >
        Cancelar
      </button>
    </div>
  )
}
