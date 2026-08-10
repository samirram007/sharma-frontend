import type { PhysicalStockCountItem } from '../../data/schema'

/** Per-row math derived from a count item. */
export type CountLineMath = {
  book: number
  physical: number
  /** book − physical; positive = loss, negative = surplus. */
  diff: number
  /** max(0, −diff) — the surplus quantity for this line. */
  surplus: number
  /** max(0, diff) — the loss quantity for this line. */
  loss: number
  rate: number
  /** Value of the counted stock on hand: physical × rate. */
  amount: number
}

export const computeCountLine = (
  item?: PhysicalStockCountItem | null,
): CountLineMath => {
  const book = Number(item?.system_quantity) || 0
  const physical = Number(item?.physical_quantity) || 0
  const rate = Number(item?.rate) || 0
  const diff = book - physical

  return {
    book,
    physical,
    diff,
    surplus: Math.max(0, -diff),
    loss: Math.max(0, diff),
    rate,
    amount: physical * rate,
  }
}

/** Aggregate totals across the count sheet. */
export type CountTotals = {
  book: number
  physical: number
  surplus: number
  loss: number
  /** book − physical across all rows. */
  diff: number
}

export const computeCountTotals = (
  items: Array<PhysicalStockCountItem | null | undefined>,
): CountTotals => {
  const totals: CountTotals = {
    book: 0,
    physical: 0,
    surplus: 0,
    loss: 0,
    diff: 0,
  }

  for (const it of items ?? []) {
    if (!it) continue
    const line = computeCountLine(it)
    totals.book += line.book
    totals.physical += line.physical
    totals.surplus += line.surplus
    totals.loss += line.loss
  }

  totals.diff = totals.book - totals.physical

  return totals
}

/**
 * Variance value of a line, used by the adjustment dialog:
 * |diff| × rate — the book value of the stock gained/lost.
 */
export const computeVarianceValue = (line: CountLineMath): number =>
  Math.abs(line.diff) * line.rate

/** One variance line with its computed values. */
export type VarianceLine = {
  item?: PhysicalStockCountItem
  book: number
  physical: number
  diff: number
  rate: number
  amount: number
}

/**
 * Build the variance lines for a count sheet: only rows where the difference
 * is non-zero (a loss or a surplus), each valued at |diff| × rate.
 */
export const buildVarianceLines = (
  items: Array<PhysicalStockCountItem | null | undefined>,
): VarianceLine[] => {
  return (items ?? [])
    .filter((it): it is PhysicalStockCountItem => Boolean(it))
    .map((it) => {
      const math = computeCountLine(it)
      return {
        item: it,
        book: math.book,
        physical: math.physical,
        diff: math.diff,
        rate: math.rate,
        amount: computeVarianceValue(math),
      }
    })
    .filter((line) => line.diff !== 0)
}
