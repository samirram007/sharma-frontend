/**
 * Safely coerces any value to a number.
 * Handles null, undefined, empty strings, and NaN — returns 0 for all of them.
 * Use before calling .toFixed(), .toLocaleString(), or arithmetic.
 *
 * @example
 *   toNum("100.50")  // → 100.5
 *   toNum(null)      // → 0
 *   toNum(0)         // → 0
 */
export function toNum(val: unknown): number {
  if (val == null || val === '') return 0
  const num = Number(val)
  return isNaN(num) ? 0 : num
}

/**
 * Formats a value to 2 decimal places without locale commas.
 * Use for CSV/JSON exports where raw number strings are needed.
 * Returns empty string for null/undefined/empty input.
 *
 * @example
 *   formatFixed("100.5")  // → "100.50"
 *   formatFixed(null)     // → ""
 */
export function formatFixed(val: unknown): string {
  if (val == null || val === '') return ''
  const num = Number(val)
  if (isNaN(num)) return ''
  return num.toFixed(2)
}

/**
 * Formats a value with Indian-locale formatting (en-IN).
 * Use for on-screen display of amounts and quantities.
 * Returns the fallback string (default '—') for null/undefined/empty input.
 *
 * @example
 *   formatLocale("1000.5")   // → "1,000.50"
 *   formatLocale(null)       // → "—"
 *   formatLocale("", "0.00") // → "0.00"
 */
export function formatLocale(val: unknown, fallback = '—'): string {
  const num = toNum(val)
  if (num === 0 && (val == null || val === '')) return fallback
  return num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}
