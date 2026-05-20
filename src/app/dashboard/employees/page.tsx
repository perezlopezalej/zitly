import { createSupabaseServerClient } from '@/lib/supabase'
import { redirect } from 'next/navigation'
import EmployeesClient from './EmployeesClient'

export default async function EmployeesPage() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const { data: business } = await supabase
    .from('businesses')
    .select('id')
    .eq('owner_id', user.id)
    .single()

  const { data: employees } = await supabase
    .from('employees')
    .select('id, name')
    .eq('business_id', business?.id ?? '')
    .order('created_at', { ascending: true })

  return <EmployeesClient employees={employees ?? []} />
}
