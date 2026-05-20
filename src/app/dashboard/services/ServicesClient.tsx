'use client'

import { useState, useTransition } from 'react'
import {
  createServiceAction,
  updateServiceAction,
  deleteServiceAction,
} from '@/app/actions/services'
import type { Service } from '@/types'
import { formatDuration, formatPrice } from '@/lib/format'
import { XIcon, PlusIcon, PencilIcon, TrashIcon } from '@/components/icons'
import { ErrorAlert } from '@/components/ErrorAlert'


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
        <div className="mb-4">
          <ErrorAlert message={deleteError} compact />
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

              {modalError && <ErrorAlert message={modalError} compact />}

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
