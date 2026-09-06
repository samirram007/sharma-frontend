import {
  addDays,
  addMonths,
  addWeeks,
  addYears,
  differenceInCalendarDays,
} from 'date-fns'

/**
 * Pure helpers for the Date calculation calculator: breaking a span into
 * years/months/days plus totals, and shifting a date by a whole-unit amount.
 */

export interface DateSpan {
  years: number
  months: number
  days: number
  totalDays: number
  totalWeeks: number
  totalMonths: number
  totalHours: number
  totalMinutes: number
  totalSeconds: number
  inverted: boolean
}

export function diffDates(from: Date, to: Date): DateSpan {
  let [start, end] = from <= to ? [from, to] : [to, from]
  const inverted = from > to

  // Count whole months from start without passing end (respects clamping).
  let months = 0
  let cursor = start
  for (;;) {
    const next = addMonths(cursor, 1)
    if (next > end) break
    cursor = next
    months++
  }
  const years = Math.floor(months / 12)
  const monthsRemainder = months % 12
  const days = differenceInCalendarDays(end, cursor)

  const totalDays = differenceInCalendarDays(end, start)
  return {
    years,
    months: monthsRemainder,
    days,
    totalDays,
    totalWeeks: totalDays / 7,
    totalMonths: months,
    totalHours: totalDays * 24,
    totalMinutes: totalDays * 24 * 60,
    totalSeconds: totalDays * 24 * 60 * 60,
    inverted,
  }
}

export type ShiftUnit = 'day' | 'week' | 'month' | 'year'

export function shiftDate(date: Date, amount: number, unit: ShiftUnit): Date {
  if (unit === 'day') return addDays(date, amount)
  if (unit === 'week') return addWeeks(date, amount)
  if (unit === 'month') return addMonths(date, amount)
  return addYears(date, amount)
}
