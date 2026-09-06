export function formatNumber(value: number): string {
  return value.toLocaleString('en-IN')
}

export function formatAmount(value: number): string {
  return `₹${value.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`
}

export function initials(name: string): string {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join('') || '?'
  )
}

/** Compact Indian-format currency, e.g. ₹39.4K / ₹2.9Cr (for chart axes). */
export function formatCompactAmount(value: number): string {
  return `₹${new Intl.NumberFormat('en-IN', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value)}`
}

/** Compact Indian-format number, e.g. 1.9K (for chart axes). */
export function formatCompactNumber(value: number): string {
  return new Intl.NumberFormat('en-IN', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value)
}

const MONTH_SHORT = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
]

/** '2026-05' → 'May 26' */
export function monthLabel(month: string): string {
  const [year, m] = month.split('-')
  const idx = Number(m) - 1
  if (!year || Number.isNaN(idx) || idx < 0 || idx > 11) {
    return month
  }
  return `${MONTH_SHORT[idx]} ${year.slice(2)}`
}
