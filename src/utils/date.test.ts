import { describe, expect, it } from 'vitest'
import { startOfDay } from './date'

describe('startOfDay', () => {
  it('normalizes a date at noon to midnight of the same day', () => {
    const d = new Date(2025, 3, 15, 12, 30, 45) // April 15, 2025 12:30:45
    const result = startOfDay(d)
    expect(result.getFullYear()).toBe(2025)
    expect(result.getMonth()).toBe(3) // April
    expect(result.getDate()).toBe(15)
    expect(result.getHours()).toBe(0)
    expect(result.getMinutes()).toBe(0)
    expect(result.getSeconds()).toBe(0)
    expect(result.getMilliseconds()).toBe(0)
  })

  it('keeps an already-midnight date unchanged', () => {
    const d = new Date(2025, 3, 1, 0, 0, 0, 0) // April 1, 2025 midnight
    const result = startOfDay(d)
    expect(result.getTime()).toBe(d.getTime())
  })

  it('normalizes a date at the end of the day to midnight of the same day', () => {
    const d = new Date(2025, 2, 31, 23, 59, 59) // March 31, 2025 23:59:59
    const result = startOfDay(d)
    expect(result.getFullYear()).toBe(2025)
    expect(result.getMonth()).toBe(2) // March
    expect(result.getDate()).toBe(31)
  })

  it('handles dates across month boundaries correctly', () => {
    // Jan 31 → Feb 1 would be wrong — startOfDay should preserve Jan 31
    const d = new Date(2025, 0, 31, 12, 0, 0) // Jan 31, 2025 noon
    const result = startOfDay(d)
    expect(result.getMonth()).toBe(0)
    expect(result.getDate()).toBe(31)
  })

  it('handles leap year dates correctly', () => {
    const d = new Date(2024, 1, 29, 8, 15, 0) // Feb 29, 2024 (leap year) 08:15
    const result = startOfDay(d)
    expect(result.getFullYear()).toBe(2024)
    expect(result.getMonth()).toBe(1)
    expect(result.getDate()).toBe(29)
    expect(result.getHours()).toBe(0)
  })

  it('strips timezone offset from ISO-parsed dates for consistent local comparisons', () => {
    // Simulate a date parsed from an ISO string like "2025-04-01"
    // new Date("2025-04-01") creates 2025-04-01T00:00:00.000Z (UTC)
    const isoDate = new Date('2025-04-01')

    // Construct the same date in local time
    const localDate = new Date(2025, 3, 1)

    // Without normalization, isoDate and localDate may differ in timezone offset
    // startOfDay should make them comparable
    const normalizedIso = startOfDay(isoDate)
    const normalizedLocal = startOfDay(localDate)

    expect(normalizedIso.getTime()).toBe(normalizedLocal.getTime())
  })

  it('returns a new Date instance (does not mutate input)', () => {
    const d = new Date(2025, 6, 10, 14, 0, 0)
    const result = startOfDay(d)
    expect(result).not.toBe(d) // Different reference
    expect(d.getHours()).toBe(14) // Original unchanged
  })

  it('handles year boundary (Dec 31 → Jan 1)', () => {
    const d = new Date(2025, 11, 31, 23, 59, 59) // Dec 31, 2025 23:59:59
    const result = startOfDay(d)
    expect(result.getFullYear()).toBe(2025)
    expect(result.getMonth()).toBe(11) // December
    expect(result.getDate()).toBe(31)
  })
})

describe('date validation using startOfDay (fiscal year range check)', () => {
  const fyStart = new Date(2025, 3, 1) // April 1, 2025 local midnight
  const fyEnd = new Date(2026, 2, 31) // March 31, 2026 local midnight

  const isWithinFiscalYear = (date: Date): boolean => {
    if (!fyStart || !fyEnd) return true
    return (
      startOfDay(date) >= startOfDay(fyStart) &&
      startOfDay(date) <= startOfDay(fyEnd)
    )
  }

  it('allows April 1 (first day of fiscal year)', () => {
    expect(isWithinFiscalYear(new Date(2025, 3, 1))).toBe(true)
  })

  it('allows March 31 (last day of fiscal year)', () => {
    expect(isWithinFiscalYear(new Date(2026, 2, 31))).toBe(true)
  })

  it('rejects March 31 before fiscal year start', () => {
    expect(isWithinFiscalYear(new Date(2025, 2, 31))).toBe(false)
  })

  it('rejects April 1 after fiscal year end', () => {
    expect(isWithinFiscalYear(new Date(2026, 3, 1))).toBe(false)
  })

  it('allows a date in the middle of the fiscal year', () => {
    expect(isWithinFiscalYear(new Date(2025, 7, 15))).toBe(true) // Aug 15, 2025
  })

  it('handles dates from ISO strings consistently (timezone-safe)', () => {
    // Simulate: isoDate from API ("2025-04-01") vs local calendar dates
    const apiDate = new Date('2025-04-01') // UTC midnight
    const calendarDate = new Date(2025, 3, 1, 10, 0, 0) // Local noon on April 1

    // Without startOfDay, these might not compare equal across timezones
    // With startOfDay, they should be comparable
    expect(startOfDay(apiDate).getTime()).toBe(
      startOfDay(calendarDate).getTime(),
    )
  })
})
