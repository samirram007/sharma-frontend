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
  return num.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

/**
 * Resolves the number of decimal places a stock quantity should display:
 * the stock unit's noOfDecimalPlaces when set, otherwise 2.
 * Guards against null/NaN/Infinity and clamps to a sane 0–6 range
 * (matching the StockUnit schema's min/max).
 *
 * @example
 *   getQuantityDecimals(3)   // → 3
 *   getQuantityDecimals(null) // → 2
 *   getQuantityDecimals(9)   // → 6
 */
export function getQuantityDecimals(noOfDecimalPlaces?: number | null): number {
  if (noOfDecimalPlaces == null || !isFinite(noOfDecimalPlaces)) return 2
  return Math.min(6, Math.max(0, Math.trunc(noOfDecimalPlaces)))
}

/**
 * Formats a stock quantity for on-screen display: Indian-locale thousands
 * separators, exactly `noOfDecimalPlaces` fraction digits (default 2), and an
 * optional unit-code suffix. Returns `fallback` ('-' by default) for
 * null/undefined/empty/NaN input; zero renders as "0.00".
 *
 * @example
 *   formatQty(1837.5, 2, 'MT')          // → "1,837.50 MT"
 *   formatQty(1837.5)                   // → "1,837.50"
 *   formatQty(null, undefined, 'MT')    // → "-"
 */
export function formatQty(
  value?: number | string | null,
  noOfDecimalPlaces?: number | null,
  unitCode?: string | null,
  fallback = '-',
): string {
  if (value == null || value === '') return fallback
  const num = Number(value)
  if (isNaN(num)) return fallback
  const dp = getQuantityDecimals(noOfDecimalPlaces)
  const formatted = num.toLocaleString('en-IN', {
    minimumFractionDigits: dp,
    maximumFractionDigits: dp,
  })
  return unitCode ? `${formatted} ${unitCode}` : formatted
}

/**
 * Export-safe variant of formatQty: plain fixed-point string with exactly
 * `noOfDecimalPlaces` digits (default 2) and NO thousands separators, so the
 * value stays safe inside CSV/Excel cells. Returns '' for null/undefined/
 * empty/NaN input.
 *
 * @example
 *   formatQtyFixed(1837.5, 2) // → "1837.50"
 *   formatQtyFixed(null)      // → ""
 */
export function formatQtyFixed(
  value?: number | string | null,
  noOfDecimalPlaces?: number | null,
): string {
  if (value == null || value === '') return ''
  const num = Number(value)
  if (isNaN(num)) return ''
  return num.toFixed(getQuantityDecimals(noOfDecimalPlaces))
}
