'use client'

import { useFormStatus } from 'react-dom'
import { updateBookingStatusAction } from '@/app/actions/booking'

function SubmitButton({ children, className }: { children: React.ReactNode; className: string }) {
  const { pending } = useFormStatus()
  return (
    <button type="submit" disabled={pending} className={className}>
      {pending ? 'Guardando…' : children}
    </button>
  )
}

export function ConfirmButton({ bookingId }: { bookingId: string }) {
  return (
    <form action={updateBookingStatusAction}>
      <input type="hidden" name="bookingId" value={bookingId} />
      <input type="hidden" name="status" value="confirmed" />
      <SubmitButton className="px-3 py-1.5 text-xs font-medium rounded-lg bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 transition-colors disabled:opacity-50">
        Confirmar
      </SubmitButton>
    </form>
  )
}

export function CancelButton({ bookingId }: { bookingId: string }) {
  return (
    <form action={updateBookingStatusAction}>
      <input type="hidden" name="bookingId" value={bookingId} />
      <input type="hidden" name="status" value="cancelled" />
      <SubmitButton className="px-3 py-1.5 text-xs font-medium rounded-lg bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 transition-colors disabled:opacity-50">
        Cancelar
      </SubmitButton>
    </form>
  )
}
