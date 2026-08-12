/**
 * Normalize a Date to the start of its local day (midnight).
 * Useful for date comparisons where timezone offsets could cause
 * mismatches between local-time and UTC-midnight Date objects.
 */
export const startOfDay = (d: Date): Date =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate())
