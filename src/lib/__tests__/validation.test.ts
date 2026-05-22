import { describe, it, expect } from 'vitest'
import { validateLength } from '../validation'

describe('validateLength', () => {
  it('returns true for a string within bounds', () => {
    expect(validateLength('hello', 1, 10)).toBe(true)
  })

  it('returns true at the min boundary', () => {
    expect(validateLength('a', 1, 10)).toBe(true)
  })

  it('returns true at the max boundary', () => {
    expect(validateLength('1234567890', 1, 10)).toBe(true)
  })

  it('returns false for empty string when min is 1', () => {
    expect(validateLength('', 1, 200)).toBe(false)
  })

  it('returns true for empty string when min is 0', () => {
    expect(validateLength('', 0, 10)).toBe(true)
  })

  it('returns false below min', () => {
    expect(validateLength('ab', 3, 10)).toBe(false)
  })

  it('returns false above max', () => {
    expect(validateLength('hello world', 1, 5)).toBe(false)
  })
})
