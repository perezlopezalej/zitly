import { createSupabaseServerClient } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import BookingFlow from './BookingFlow'

type Props = {
  params: Promise<{ businessId: string }>
}

export default async function BookPage({ params }: Props) {
  const { businessId } = await params

  const supabase = await createSupabaseServerClient()

  const [{ data: business }, { data: services }, { data: employees }] =
    await Promise.all([
      supabase
        .from('businesses')
        .select('id, name, description')
        .eq('id', businessId)
        .single(),
      supabase
        .from('services')
        .select('id, name, description, duration_minutes, price')
        .eq('business_id', businessId)
        .order('name'),
      supabase
        .from('employees')
        .select('id, name')
        .eq('business_id', businessId)
        .order('name'),
    ])

  if (!business) notFound()

  return (
    <BookingFlow
      business={business as { id: string; name: string; description: string | null }}
      services={(services ?? []) as {
        id: string
        name: string
        description: string | null
        duration_minutes: number
        price: string
      }[]}
      employees={(employees ?? []) as { id: string; name: string }[]}
    />
  )
}
