import { describe, expect, it } from 'vitest'
import {
  formatQty,
  formatQtyFixed,
  getQuantityDecimals,
  toNum,
} from './format-num'

describe('getQuantityDecimals', () => {
  it('returns noOfDecimalPlaces when set', () => {
    expect(getQuantityDecimals(0)).toBe(0)
    expect(getQuantityDecimals(1)).toBe(1)
    expect(getQuantityDecimals(3)).toBe(3)
  })

  it('falls back to 2 for null/undefined', () => {
    expect(getQuantityDecimals(null)).toBe(2)
    expect(getQuantityDecimals(undefined)).toBe(2)
  })

  it('guards against NaN/Infinity and clamps to the 0–6 range', () => {
    expect(getQuantityDecimals(NaN)).toBe(2)
    expect(getQuantityDecimals(Infinity)).toBe(2)
    expect(getQuantityDecimals(9)).toBe(6)
    expect(getQuantityDecimals(-3)).toBe(0)
    expect(getQuantityDecimals(2.7)).toBe(2)
  })
})

describe('formatQty', () => {
  it('formats with Indian-locale separators and exact fraction digits', () => {
    expect(formatQty(1837.5, 2)).toBe('1,837.50')
    expect(formatQty(1837.5, 2, 'MT')).toBe('1,837.50 MT')
    expect(formatQty(792198, 2)).toBe('7,92,198.00')
  })

  it('uses noOfDecimalPlaces and defaults to 2 when unset', () => {
    expect(formatQty(1837.5, 3)).toBe('1,837.500')
    expect(formatQty(1837.5, 0)).toBe('1,838')
    expect(formatQty(1837.5, null)).toBe('1,837.50')
    expect(formatQty(1837.5)).toBe('1,837.50')
  })

  it('accepts numeric strings and renders zero as "0.00"', () => {
    expect(formatQty('1837.5', 2, 'MT')).toBe('1,837.50 MT')
    expect(formatQty(0, 2)).toBe('0.00')
    expect(formatQty(0, null, 'MT')).toBe('0.00 MT')
  })

  it('returns the fallback for null/undefined/empty/NaN input', () => {
    expect(formatQty(null)).toBe('-')
    expect(formatQty(undefined)).toBe('-')
    expect(formatQty('')).toBe('-')
    expect(formatQty('abc')).toBe('-')
    expect(formatQty(null, 2, 'MT')).toBe('-')
    expect(formatQty(NaN, 2, 'MT', '—')).toBe('—')
  })
})

describe('formatQtyFixed', () => {
  it('returns CSV-safe fixed-point strings without separators', () => {
    expect(formatQtyFixed(1837.5, 2)).toBe('1837.50')
    expect(formatQtyFixed(792198, 2)).toBe('792198.00')
    expect(formatQtyFixed(1837.5, 3)).toBe('1837.500')
  })

  it('uses the fallback to 2 decimals and returns "" for empty input', () => {
    expect(formatQtyFixed(1837.5, null)).toBe('1837.50')
    expect(formatQtyFixed(null)).toBe('')
    expect(formatQtyFixed(undefined)).toBe('')
    expect(formatQtyFixed('')).toBe('')
    expect(formatQtyFixed('abc')).toBe('')
  })
})

describe('toNum (existing helper sanity)', () => {
  it('coerces values and returns 0 for non-numbers', () => {
    expect(toNum('100.50')).toBe(100.5)
    expect(toNum(null)).toBe(0)
    expect(toNum('abc')).toBe(0)
  })
})
