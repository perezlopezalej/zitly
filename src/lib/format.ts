export function todayISO(): string {
  return new Date().toISOString().split('T')[0]
}

export function monthRange(): { start: string; end: string } {
  const now = new Date()
  const y = now.getFullYear()
  const m = now.getMonth()
  return {
    start: new Date(y, m, 1).toISOString().split('T')[0],
    end: new Date(y, m + 1, 0).toISOString().split('T')[0],
  }
}

export function formatDuration(duration_minutes: number): string {
  if (duration_minutes < 60) return `${duration_minutes} min`
  const h = Math.floor(duration_minutes / 60)
  const m = duration_minutes % 60
  return m > 0 ? `${h}h ${m}min` : `${h}h`
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
  }).format(price)
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
}

export const AVATAR_COLOR = 'bg-brand-green text-white'
