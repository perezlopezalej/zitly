export function validateLength(value: string, min: number, max: number): boolean {
  return value.length >= min && value.length <= max
}
