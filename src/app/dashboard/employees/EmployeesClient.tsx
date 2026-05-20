'use client'

import { useRef, useTransition } from 'react'
import { createEmployeeAction, deleteEmployeeAction } from '@/app/actions/employees'
import type { Employee } from '@/types'
import { getInitials, avatarColor } from '@/lib/format'
import { TrashIcon } from '@/components/icons'


export default function EmployeesClient({ employees }: { employees: Employee[] }) {
  const [isPending, startTransition] = useTransition()
  const formRef = useRef<HTMLFormElement>(null)

  const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const name = (formData.get('name') as string).trim()
    if (!name) return
    startTransition(async () => {
      await createEmployeeAction(formData)
      formRef.current?.reset()
    })
  }

  const handleDelete = (id: string) => {
    startTransition(async () => {
      const formData = new FormData()
      formData.append('id', id)
      await deleteEmployeeAction(formData)
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

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <form ref={formRef} onSubmit={handleCreate} className="flex gap-3">
            <input
              type="text"
              name="name"
              required
              placeholder="Nombre del empleado"
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-green focus:ring-1 focus:ring-brand-green"
            />
            <button
              type="submit"
              disabled={isPending}
              className="bg-brand-green hover:bg-brand-green-dark text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors disabled:opacity-50 shrink-0"
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
            {employees.map((employee) => (
              <li key={employee.id} className="flex items-center justify-between px-5 py-3.5">
                <div className="flex items-center gap-3">
                  <span
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold shrink-0 ${avatarColor(employee.name)}`}
                  >
                    {getInitials(employee.name)}
                  </span>
                  <span className="text-sm font-medium text-gray-900">{employee.name}</span>
                </div>
                <button
                  onClick={() => handleDelete(employee.id)}
                  disabled={isPending}
                  className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors disabled:opacity-40"
                  title="Eliminar empleado"
                >
                  <TrashIcon />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
