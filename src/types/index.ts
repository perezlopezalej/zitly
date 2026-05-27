export type ActionResult = { error: string } | undefined

// Auth and settings form state (extends ActionResult with optional success field,
// used with useActionState in auth and settings forms)
export type AuthState = { error?: string; success?: string } | undefined
export type SettingsState = { error?: string; success?: string } | undefined

// Public booking types
export type CreateBookingInput = {
  businessId: string
  serviceId: string
  employeeId: string | null
  date: string
  time: string
  clientName: string
  clientEmail: string
}
export type CreatedBooking = { id: string; date: string; time: string }
export type CreateBookingResult =
  | { booking: CreatedBooking; error?: never }
  | { error: string; booking?: never }

export type Employee = {
  id: string
  name: string
}

export type BusinessContact = {
  name: string
  opening_time: string | null
  closing_time: string | null
  phone: string | null
  contact_email: string | null
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
  service_name: string | null
  services: { name: string } | null
  employees: { name: string } | null
}
