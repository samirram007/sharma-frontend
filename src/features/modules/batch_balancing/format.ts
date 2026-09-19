/** dd-MMM-yyyy display for a yyyy-MM-dd date string (or its raw value). */
export function formatDate(val: string | null | undefined): string {
  if (!val) return '—'
  const d = new Date(val)
  return isNaN(d.getTime())
    ? val
    : d.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
}

/** Indian-grouped 2-decimal amount — for on-screen rates and values. */
export function formatAmount(
  val: number | null | undefined,
  fallback = '—',
): string {
  if (val == null || !isFinite(val)) return fallback
  return val.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

/** Compact ₹ label for summary tiles (₹1.25 L / ₹3.4 Cr). */
export function formatCompactInr(val: number | null | undefined): string {
  if (val == null || !isFinite(val)) return '—'
  const abs = Math.abs(val)
  const sign = val < 0 ? '-' : ''
  if (abs >= 10_000_000) return `${sign}₹${(abs / 10_000_000).toFixed(2)} Cr`
  if (abs >= 100_000) return `${sign}₹${(abs / 100_000).toFixed(2)} L`
  return `${sign}₹${abs.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

/**
 * Human readable age label for an expiry day-count measured against the
 * report's as-on date. Negative counts read as "x days ago".
 */
export function formatDayCount(days: number | null | undefined): string {
  if (days == null || !isFinite(days)) return '—'
  const rounded = Math.trunc(days)
  if (rounded === 0) return 'today'
  const abs = Math.abs(rounded)
  return rounded > 0
    ? `in ${abs} day${abs === 1 ? '' : 's'}`
    : `${abs} day${abs === 1 ? '' : 's'} ago`
}
