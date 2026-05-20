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

export function avatarColor(_name: string): string {
  return 'bg-brand-green text-white'
}
