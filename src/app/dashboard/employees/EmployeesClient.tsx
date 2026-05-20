'use client'

import { useRef, useTransition } from 'react'
import { createEmployeeAction, deleteEmployeeAction } from '@/app/actions/employees'

interface Employee {
  id: string
  name: string
}

function TrashIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
    </svg>
  )
}

function getInitials(name: string) {
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
}

const avatarColors = [
  'bg-indigo-100 text-indigo-700',
  'bg-purple-100 text-purple-700',
  'bg-pink-100 text-pink-700',
  'bg-blue-100 text-blue-700',
  'bg-teal-100 text-teal-700',
  'bg-amber-100 text-amber-700',
]

function avatarColor(name: string) {
  const sum = name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  return avatarColors[sum % avatarColors.length]
}

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
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
            <button
              type="submit"
              disabled={isPending}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors disabled:opacity-50 shrink-0"
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
