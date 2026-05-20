'use client'

import { useState, useTransition } from 'react'
import { createBookingAction } from '@/app/actions/booking'
import type { CreatedBooking } from '@/app/actions/booking'

type Service = {
  id: string
  name: string
  description: string | null
  duration_minutes: number
  price: string
}

type Employee = {
  id: string
  name: string
}

type Business = {
  id: string
  name: string
  description: string | null
}

type Step = 'service' | 'employee' | 'datetime' | 'details' | 'confirmed'

function generateTimeSlots(durationMinutes: number): string[] {
  const slots: string[] = []
  const start = 9 * 60
  const end = 18 * 60
  for (let m = start; m + durationMinutes <= end; m += 30) {
    const h = Math.floor(m / 60)
    const min = m % 60
    slots.push(
      `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`,
    )
  }
  return slots
}

function todayISO(): string {
  return new Date().toISOString().split('T')[0]
}

function formatDate(dateStr: string): string {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

type Props = {
  business: Business
  services: Service[]
  employees: Employee[]
}

export default function BookingFlow({ business, services, employees }: Props) {
  const hasEmployees = employees.length > 0

  const [step, setStep] = useState<Step>('service')
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null,
  )
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [clientName, setClientName] = useState('')
  const [clientEmail, setClientEmail] = useState('')
  const [error, setError] = useState('')
  const [booking, setBooking] = useState<CreatedBooking | null>(null)
  const [isPending, startTransition] = useTransition()

  const timeSlots = selectedService
    ? generateTimeSlots(selectedService.duration_minutes)
    : []

  function handleServiceSelect(service: Service) {
    setSelectedService(service)
    setStep(hasEmployees ? 'employee' : 'datetime')
  }

  function handleEmployeeSelect(employee: Employee | null) {
    setSelectedEmployee(employee)
    setStep('datetime')
  }

  function handleConfirm() {
    if (!selectedService || !clientName.trim() || !clientEmail.trim()) return
    setError('')

    startTransition(async () => {
      const result = await createBookingAction({
        businessId: business.id,
        serviceId: selectedService.id,
        employeeId: selectedEmployee?.id ?? null,
        date: selectedDate,
        time: selectedTime,
        clientName: clientName.trim(),
        clientEmail: clientEmail.trim(),
      })

      if (result.error) {
        setError(result.error)
      } else {
        setBooking(result.booking!)
        setStep('confirmed')
      }
    })
  }

  // ── Confirmed ─────────────────────────────────────────────────────────────
  if (step === 'confirmed' && booking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">
            ¡Reserva recibida!
          </h2>
          <p className="text-gray-500 mb-6">Te esperamos en {business.name}</p>

          <div className="bg-gray-50 rounded-xl p-4 text-left space-y-3 mb-6">
            <Row label="Servicio" value={selectedService?.name ?? ''} />
            {selectedEmployee && (
              <Row label="Profesional" value={selectedEmployee.name} />
            )}
            <Row label="Fecha" value={formatDate(booking.date)} />
            <Row label="Hora" value={booking.time.slice(0, 5)} />
          </div>

          <p className="text-xs text-gray-400">
            Estado: pendiente de confirmación · {clientEmail}
          </p>
        </div>
      </div>
    )
  }

  // ── Booking flow ──────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900">{business.name}</h1>
          {business.description && (
            <p className="mt-1 text-sm text-gray-500">{business.description}</p>
          )}
        </div>

        {/* ── Step 1: Service ── */}
        {step === 'service' && (
          <section>
            <h2 className="text-base font-semibold text-gray-700 mb-3">
              Elige un servicio
            </h2>
            {services.length === 0 ? (
              <p className="text-sm text-gray-400">
                Este negocio aún no tiene servicios disponibles.
              </p>
            ) : (
              <div className="space-y-3">
                {services.map((service) => (
                  <button
                    key={service.id}
                    onClick={() => handleServiceSelect(service)}
                    className="w-full bg-white rounded-xl border border-gray-200 p-4 text-left hover:border-indigo-400 hover:shadow-sm transition-all"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-medium text-gray-900">
                          {service.name}
                        </p>
                        {service.description && (
                          <p className="text-sm text-gray-500 mt-0.5">
                            {service.description}
                          </p>
                        )}
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-semibold text-indigo-600">
                          {Number(service.price).toFixed(2)} €
                        </p>
                        <p className="text-xs text-gray-400">
                          {service.duration_minutes} min
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </section>
        )}

        {/* ── Step 2: Employee ── */}
        {step === 'employee' && (
          <section>
            <h2 className="text-base font-semibold text-gray-700 mb-3">
              Elige un profesional
            </h2>
            <div className="space-y-3">
              <button
                onClick={() => handleEmployeeSelect(null)}
                className="w-full bg-white rounded-xl border border-gray-200 p-4 text-left hover:border-indigo-400 hover:shadow-sm transition-all"
              >
                <p className="font-medium text-gray-900">Sin preferencia</p>
                <p className="text-sm text-gray-500">
                  Cualquier profesional disponible
                </p>
              </button>
              {employees.map((emp) => (
                <button
                  key={emp.id}
                  onClick={() => handleEmployeeSelect(emp)}
                  className="w-full bg-white rounded-xl border border-gray-200 p-4 text-left hover:border-indigo-400 hover:shadow-sm transition-all"
                >
                  <p className="font-medium text-gray-900">{emp.name}</p>
                </button>
              ))}
            </div>
            <BackLink onClick={() => setStep('service')} />
          </section>
        )}

        {/* ── Step 3: Date & time ── */}
        {step === 'datetime' && (
          <section>
            <h2 className="text-base font-semibold text-gray-700 mb-3">
              Elige fecha y hora
            </h2>
            <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha
                </label>
                <input
                  type="date"
                  min={todayISO()}
                  value={selectedDate}
                  onChange={(e) => {
                    setSelectedDate(e.target.value)
                    setSelectedTime('')
                  }}
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                />
              </div>

              {selectedDate && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hora
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {timeSlots.map((slot) => (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setSelectedTime(slot)}
                        className={`py-2 text-sm rounded-lg border transition-colors ${
                          selectedTime === slot
                            ? 'bg-indigo-600 text-white border-indigo-600'
                            : 'bg-white text-gray-700 border-gray-200 hover:border-indigo-400'
                        }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-4 flex items-center justify-between">
              <BackLink
                onClick={() => setStep(hasEmployees ? 'employee' : 'service')}
              />
              <button
                onClick={() => setStep('details')}
                disabled={!selectedDate || !selectedTime}
                className="px-5 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Siguiente →
              </button>
            </div>
          </section>
        )}

        {/* ── Step 4: Client details ── */}
        {step === 'details' && (
          <section>
            <h2 className="text-base font-semibold text-gray-700 mb-3">
              Tus datos
            </h2>

            <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre
                </label>
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Tu nombre"
                  autoComplete="name"
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm placeholder-gray-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  placeholder="tu@email.com"
                  autoComplete="email"
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm placeholder-gray-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                />
              </div>
              {error && <p className="text-sm text-red-600">{error}</p>}
            </div>

            {/* Summary */}
            <div className="mt-4 bg-indigo-50 rounded-xl border border-indigo-100 p-4 space-y-1.5">
              <p className="text-xs font-semibold text-indigo-700 uppercase tracking-wide mb-2">
                Resumen
              </p>
              <Row label="Servicio" value={selectedService?.name ?? ''} />
              {selectedEmployee && (
                <Row label="Profesional" value={selectedEmployee.name} />
              )}
              <Row label="Fecha" value={formatDate(selectedDate)} />
              <Row label="Hora" value={selectedTime} />
            </div>

            <div className="mt-4 flex items-center justify-between">
              <BackLink onClick={() => setStep('datetime')} />
              <button
                onClick={handleConfirm}
                disabled={!clientName.trim() || !clientEmail.trim() || isPending}
                className="px-5 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                {isPending ? 'Reservando…' : 'Confirmar reserva'}
              </button>
            </div>
          </section>
        )}
      </div>
    </div>
  )
}

// ── Small helpers ─────────────────────────────────────────────────────────────

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium text-gray-900 text-right">{value}</span>
    </div>
  )
}

function BackLink({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-sm text-indigo-600 hover:underline"
    >
      ← Volver
    </button>
  )
}
