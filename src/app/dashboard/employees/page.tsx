import { getBusiness } from '@/lib/actions'
import EmployeesClient from './EmployeesClient'

export default async function EmployeesPage() {
  const { supabase, businessId } = await getBusiness()

  const { data: employees } = await supabase
    .from('employees')
    .select('id, name')
    .eq('business_id', businessId)
    .order('created_at', { ascending: true })

  return <EmployeesClient employees={employees ?? []} />
}
