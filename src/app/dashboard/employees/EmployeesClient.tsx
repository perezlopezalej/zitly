'use client'

import { useRef, useState, useTransition } from 'react'
import {
  createEmployeeAction,
  deleteEmployeeAction,
  updateEmployeeAction,
} from '@/app/actions/employees'
import { useSuccessToast } from '@/hooks/useSuccessToast'
import type { Employee } from '@/types'
import { getInitials, AVATAR_COLOR } from '@/lib/format'
import { TrashIcon, PencilIcon } from '@/components/icons'
import { ErrorAlert } from '@/components/ErrorAlert'
import { SuccessAlert } from '@/components/SuccessAlert'

function EmployeeAvatar({ name }: { name: string }) {
  return (
    <span className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold shrink-0 ${AVATAR_COLOR}`}>
      {getInitials(name)}
    </span>
  )
}

export default function EmployeesClient({ employees }: { employees: Employee[] }) {
  const [isCreating, startCreate] = useTransition()
  const [isMutating, startMutate] = useTransition()
  const formRef = useRef<HTMLFormElement>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const { message: successMsg, show: showSuccess } = useSuccessToast()

  const isPending = isCreating || isMutating

  const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setActionError(null)
    const formData = new FormData(e.currentTarget)
    const name = (formData.get('name') as string).trim()
    if (!name) return
    startCreate(async () => {
      const result = await createEmployeeAction(formData)
      if (result?.error) { setActionError(result.error); return }
      formRef.current?.reset()
      showSuccess('Empleado añadido')
    })
  }

  const startEdit = (employee: Employee) => {
    setConfirmDeleteId(null)
    setEditingId(employee.id)
    setEditingName(employee.name)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditingName('')
  }

  const handleSave = (id: string) => {
    const name = editingName.trim()
    if (!name) return
    setActionError(null)
    startMutate(async () => {
      const formData = new FormData()
      formData.append('id', id)
      formData.append('name', name)
      const result = await updateEmployeeAction(formData)
      if (result?.error) { setActionError(result.error); return }
      setEditingId(null)
      setEditingName('')
      showSuccess('Empleado actualizado')
    })
  }

  const handleEditKeyDown = (e: React.KeyboardEvent, id: string) => {
    if (e.key === 'Enter') { e.preventDefault(); handleSave(id) }
    if (e.key === 'Escape') cancelEdit()
  }

  const startConfirmDelete = (id: string) => {
    setEditingId(null)
    setConfirmDeleteId(id)
  }

  const cancelDelete = () => setConfirmDeleteId(null)

  const handleDelete = (id: string) => {
    setActionError(null)
    startMutate(async () => {
      const formData = new FormData()
      formData.append('id', id)
      const result = await deleteEmployeeAction(formData)
      if (result?.error) { setActionError(result.error); return }
      setConfirmDeleteId(null)
      showSuccess('Empleado eliminado')
    })
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Empleados</h1>
        <p className="mt-0.5 text-sm text-gray-500">
          {employees.length === 0
            ? 'Aún no tienes empleados'
            : `${employees.length} empleado${employees.length !== 1 ? 's' : ''}`}
        </p>
      </div>

      {successMsg && (
        <div className="mb-4">
          <SuccessAlert message={successMsg} compact />
        </div>
      )}

      {actionError && (
        <div className="mb-4">
          <ErrorAlert message={actionError} compact />
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <form ref={formRef} onSubmit={handleCreate} className="flex gap-3">
            <label htmlFor="new-employee-name" className="sr-only">
              Nombre del empleado
            </label>
            <input
              id="new-employee-name"
              type="text"
              name="name"
              required
              placeholder="Nombre del empleado"
              className="flex-1 border border-gray-300 rounded-lg px-3 py-3 text-base text-brand-ink placeholder-brand-muted focus:outline-none focus:border-brand-green focus:ring-1 focus:ring-brand-green"
            />
            <button
              type="submit"
              disabled={isPending}
              className="bg-brand-green hover:bg-brand-green-dark text-white text-sm font-medium px-4 py-3 rounded-lg transition-colors disabled:opacity-50 shrink-0"
            >
              {isPending ? 'Añadiendo…' : 'Añadir'}
            </button>
          </form>
        </div>

        {employees.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 text-sm">
              Añade tu primer empleado usando el formulario de arriba.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {employees.map((employee) => {
              const isEditing = editingId === employee.id
              const isConfirmingDelete = confirmDeleteId === employee.id

              if (isEditing) {
                return (
                  <li key={employee.id} className="flex items-center gap-3 px-5 py-3.5">
                    <EmployeeAvatar name={editingName || employee.name} />
                    <input
                      autoFocus
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      onKeyDown={(e) => handleEditKeyDown(e, employee.id)}
                      className="flex-1 border border-brand-green rounded-lg px-3 py-3 text-base text-brand-ink focus:outline-none focus:ring-1 focus:ring-brand-green"
                    />
                    <button
                      onClick={() => handleSave(employee.id)}
                      disabled={isPending || !editingName.trim()}
                      className="text-sm font-medium text-brand-green hover:text-brand-green-dark disabled:opacity-40 shrink-0"
                    >
                      Guardar
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="text-sm text-gray-400 hover:text-gray-600 shrink-0"
                    >
                      Cancelar
                    </button>
                  </li>
                )
              }

              if (isConfirmingDelete) {
                return (
                  <li key={employee.id} className="px-5 py-3.5">
                    <div className="flex items-center justify-between gap-4 flex-wrap">
                      <div className="flex items-center gap-3">
                        <EmployeeAvatar name={employee.name} />
                        <span className="text-sm text-gray-600">
                          ¿Eliminar a{' '}
                          <span className="font-medium text-gray-900">{employee.name}</span>?
                        </span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={cancelDelete}
                          className="px-3 py-2.5 text-xs font-medium rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={() => handleDelete(employee.id)}
                          disabled={isPending}
                          className="px-3 py-2.5 text-xs font-medium rounded-lg bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 transition-colors disabled:opacity-40"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  </li>
                )
              }

              return (
                <li key={employee.id} className="flex items-center justify-between px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <EmployeeAvatar name={employee.name} />
                    <span className="text-sm font-medium text-gray-900">{employee.name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => startEdit(employee)}
                      disabled={isPending}
                      aria-label={`Editar a ${employee.name}`}
                      className="p-2.5 text-gray-400 hover:text-brand-green hover:bg-brand-green-subtle rounded-md transition-colors disabled:opacity-40"
                    >
                      <PencilIcon />
                    </button>
                    <button
                      onClick={() => startConfirmDelete(employee.id)}
                      disabled={isPending}
                      aria-label={`Eliminar a ${employee.name}`}
                      className="p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors disabled:opacity-40"
                    >
                      <TrashIcon />
                    </button>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
