'use client'

import { useState, useTransition } from 'react'
import {
  createServiceAction,
  updateServiceAction,
  deleteServiceAction,
} from '@/app/actions/services'

interface Service {
  id: string
  name: string
  description: string | null
  duration_minutes: number
  price: number
}

function XIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  )
}

function PlusIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  )
}

function PencilIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
    </svg>
  )
}

function formatDuration(duration_minutes: number) {
  if (duration_minutes < 60) return `${duration_minutes} min`
  const h = Math.floor(duration_minutes / 60)
  const m = duration_minutes % 60
  return m > 0 ? `${h}h ${m}min` : `${h}h`
}

function formatPrice(price: number) {
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(price)
}

export default function ServicesClient({ services }: { services: Service[] }) {
  const [showModal, setShowModal] = useState(false)
  const [editingService, setEditingService] = useState<Service | null>(null)
  const [modalError, setModalError] = useState<string | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const openCreate = () => {
    setEditingService(null)
    setModalError(null)
    setShowModal(true)
  }

  const openEdit = (service: Service) => {
    setEditingService(service)
    setModalError(null)
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingService(null)
    setModalError(null)
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setModalError(null)
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      const result = editingService
        ? await updateServiceAction(formData)
        : await createServiceAction(formData)
      if (result?.error) {
        setModalError(result.error)
        return
      }
      closeModal()
    })
  }

  const handleDelete = (id: string) => {
    setDeleteError(null)
    startTransition(async () => {
      const result = await deleteServiceAction(id)
      if (result?.error) setDeleteError(result.error)
    })
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Servicios</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            {services.length === 0
              ? 'Aún no tienes servicios'
              : `${services.length} servicio${services.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          <PlusIcon />
          Añadir servicio
        </button>
      </div>

      {deleteError && (
        <div className="mb-4 rounded-md bg-red-50 border border-red-200 px-3 py-2">
          <p className="text-sm text-red-700">{deleteError}</p>
        </div>
      )}

      {services.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-300">
          <p className="text-gray-500 text-sm">No tienes ningún servicio todavía.</p>
          <button
            onClick={openCreate}
            className="mt-3 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
          >
            Crea tu primer servicio
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {services.map((service) => (
            <div
              key={service.id}
              className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col gap-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">{service.name}</h3>
                  {service.description && (
                    <p className="mt-0.5 text-sm text-gray-500 line-clamp-2">
                      {service.description}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => openEdit(service)}
                    className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                    title="Editar"
                  >
                    <PencilIcon />
                  </button>
                  <button
                    onClick={() => handleDelete(service.id)}
                    disabled={isPending}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors disabled:opacity-40"
                    title="Eliminar"
                  >
                    <TrashIcon />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-1 border-t border-gray-100">
                <span className="text-sm text-gray-600">
                  {formatDuration(service.duration_minutes)}
                </span>
                <span className="text-gray-300">·</span>
                <span className="text-sm font-medium text-gray-900">
                  {formatPrice(service.price)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={closeModal}
          />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-100">
              <h2 className="text-base font-semibold text-gray-900">
                {editingService ? 'Editar servicio' : 'Nuevo servicio'}
              </h2>
              <button
                type="button"
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XIcon />
              </button>
            </div>

            <form
              key={editingService?.id ?? 'new'}
              onSubmit={handleSubmit}
              className="p-6 space-y-4"
            >
              {editingService && (
                <input type="hidden" name="id" value={editingService.id} />
              )}

              {modalError && (
                <div className="rounded-md bg-red-50 border border-red-200 px-3 py-2">
                  <p className="text-sm text-red-700">{modalError}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  defaultValue={editingService?.name ?? ''}
                  placeholder="Ej: Corte de cabello"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción
                </label>
                <textarea
                  name="description"
                  rows={2}
                  defaultValue={editingService?.description ?? ''}
                  placeholder="Describe el servicio (opcional)"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Duración (min) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="duration_minutes"
                    required
                    min={1}
                    defaultValue={editingService?.duration_minutes ?? 30}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Precio (€) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="price"
                    required
                    min={0}
                    step={0.01}
                    defaultValue={editingService?.price ?? ''}
                    placeholder="0.00"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50"
                >
                  {isPending ? 'Guardando…' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
