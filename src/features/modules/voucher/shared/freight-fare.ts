/**
 * Pure fare math shared by the Freight Calculator and the printed
 * FareBreakdown, plus their unit tests.
 *
 * - Total fare = (rate × weight when both > 0) + loading + unloading +
 *   packing + insurance + other − discount, floored at 0 and rounded to 2dp.
 *   The rounded value is what gets persisted to `total_fare`, matching the
 *   value displayed on screen and printed.
 * - Net adjustment = total additional charges − discount — the figure shown
 *   on the print breakdown's "Net Adjustment" row and the calculator's
 *   collapsed badge.
 */

export type FareInputs = {
  rate?: number | string | null
  weight?: number | string | null
  loadingCharges?: number | string | null
  unloadingCharges?: number | string | null
  packingCharges?: number | string | null
  insuranceCharges?: number | string | null
  otherCharges?: number | string | null
  discount?: number | string | null
  /** Present on dispatch-detail payloads; deliberately ignored by the math (the base row is subtracted separately). */
  freightCharges?: number | string | null
}

export type FareResult = {
  /** Base fare = rate × weight (0 when either input is missing or zero). */
  baseFare: number
  /**
   * Total fare = base fare + additional charges − discount.
   * Floored at 0 and rounded to 2 decimal places.
   */
  totalFare: number
}

export function computeFare(input: FareInputs): FareResult {
  const baseFare =
    Number(input.rate) > 0 && Number(input.weight) > 0
      ? Number(input.rate) * Number(input.weight)
      : 0

  const loading = Number(input.loadingCharges) || 0
  const unloading = Number(input.unloadingCharges) || 0
  const packing = Number(input.packingCharges) || 0
  const insurance = Number(input.insuranceCharges) || 0
  const other = Number(input.otherCharges) || 0
  const discount = Number(input.discount) || 0

  const total =
    baseFare + loading + unloading + packing + insurance + other - discount

  return {
    baseFare,
    totalFare: Math.round(Math.max(0, total) * 100) / 100,
  }
}

/**
 * Net adjustment = total additional charges (loading + unloading + packing +
 * insurance + other) − discount.
 *
 * Mirrors the FareBreakdown calculation, which derives it as
 * `sum(chargeRows) − freightCharges − discount`: the Freight Charges row is
 * subtracted out, leaving exactly the additional charges. A negative result
 * means the discount exceeds the additional charges.
 */
export function computeNetAdjustment(input?: FareInputs | null): number {
  const additional =
    (Number(input?.loadingCharges) || 0) +
    (Number(input?.unloadingCharges) || 0) +
    (Number(input?.packingCharges) || 0) +
    (Number(input?.insuranceCharges) || 0) +
    (Number(input?.otherCharges) || 0)

  return additional - (Number(input?.discount) || 0)
}
