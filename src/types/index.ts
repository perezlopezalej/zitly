export type ActionResult = { error: string } | undefined

export type Employee = {
  id: string
  name: string
}

export type Service = {
  id: string
  name: string
  description: string | null
  duration_minutes: number
  price: number
}

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed'

export type Booking = {
  id: string
  date: string
  time: string
  status: BookingStatus
  client_name: string | null
  client_email: string | null
  notes: string | null
  services: { name: string }[] | null
  employees: { name: string }[] | null
}
