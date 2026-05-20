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

const avatarColors = [
  'bg-brand-green-subtle text-brand-green-dark',
  'bg-purple-100 text-purple-700',
  'bg-pink-100 text-pink-700',
  'bg-blue-100 text-blue-700',
  'bg-teal-100 text-teal-700',
  'bg-amber-100 text-amber-700',
]

export function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
}

export function avatarColor(name: string): string {
  const sum = name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  return avatarColors[sum % avatarColors.length]
}
