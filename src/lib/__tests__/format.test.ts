import { describe, it, expect } from 'vitest'
import { formatDuration, formatPrice, getInitials } from '../format'

describe('formatDuration', () => {
  it('returns minutes for values under 60', () => {
    expect(formatDuration(30)).toBe('30 min')
    expect(formatDuration(45)).toBe('45 min')
    expect(formatDuration(1)).toBe('1 min')
  })

  it('returns hours only when there is no remainder', () => {
    expect(formatDuration(60)).toBe('1h')
    expect(formatDuration(120)).toBe('2h')
  })

  it('returns hours and minutes when there is a remainder', () => {
    expect(formatDuration(90)).toBe('1h 30min')
    expect(formatDuration(75)).toBe('1h 15min')
    expect(formatDuration(150)).toBe('2h 30min')
  })
})

describe('formatPrice', () => {
  it('formats price as a string containing the number and euro symbol', () => {
    const result = formatPrice(25)
    expect(result).toMatch(/25/)
    expect(result).toMatch(/€/)
  })

  it('formats decimal price', () => {
    const result = formatPrice(9.99)
    expect(result).toMatch(/9/)
    expect(result).toMatch(/€/)
  })

  it('formats zero price', () => {
    const result = formatPrice(0)
    expect(result).toMatch(/0/)
    expect(result).toMatch(/€/)
  })
})

describe('getInitials', () => {
  it('returns one initial for a single word', () => {
    expect(getInitials('Ana')).toBe('A')
  })

  it('returns two initials for two words', () => {
    expect(getInitials('Ana García')).toBe('AG')
  })

  it('uses only the first two words for names with more words', () => {
    expect(getInitials('Ana María García')).toBe('AM')
  })

  it('uppercases the initials', () => {
    expect(getInitials('ana garcía')).toBe('AG')
  })
})
