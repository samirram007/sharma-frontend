import type {
  BatchLifeline,
  LifelineBucket,
  LifelineRow,
  LifelineYear,
} from './data/schema'

/** `'all'` keeps every (item, godown) bucket; anything else pins one bucket. */
export const ALL_BUCKETS = 'all'

export function bucketLabel(bucket: LifelineBucket): string {
  const item = bucket.itemName
  const godown = bucket.godownName ?? `Godown #${bucket.godownId}`
  return `${item} · ${godown}`
}

/** Bucket picker options — one per (item, godown) the batch number touched. */
export function bucketOptions(
  buckets: LifelineBucket[],
): { value: string; label: string }[] {
  return buckets.map((bucket) => ({
    value: bucket.key,
    label: bucketLabel(bucket),
  }))
}

/** Options for the Item / Godown narrows, derived from the buckets themselves. */
export function itemOptions(
  buckets: LifelineBucket[],
): { value: number; label: string }[] {
  const seen = new Map<number, string>()
  for (const bucket of buckets) {
    if (!seen.has(bucket.itemId)) seen.set(bucket.itemId, bucket.itemName)
  }
  return [...seen.entries()].map(([value, label]) => ({ value, label }))
}

export function godownOptions(
  buckets: LifelineBucket[],
): { value: number; label: string }[] {
  const seen = new Map<number, string>()
  for (const bucket of buckets) {
    if (!seen.has(bucket.godownId)) {
      seen.set(bucket.godownId, bucket.godownName ?? `Godown #${bucket.godownId}`)
    }
  }
  return [...seen.entries()].map(([value, label]) => ({ value, label }))
}

/** The lines of one bucket (or every line when `bucketKey` is `'all'`). */
export function filterRows(
  rows: LifelineRow[],
  bucketKey: string,
): LifelineRow[] {
  if (bucketKey === ALL_BUCKETS) return rows
  return rows.filter((row) => row.bucketKey === bucketKey)
}

/**
 * Year markers for the current selection. Pinning a bucket swaps the year's
 * mixed-unit totals for that bucket's own numbers, so nothing on screen adds
 * kilogrammes to pieces.
 */
export function yearsForBucket(
  lifeline: BatchLifeline,
  bucketKey: string,
): LifelineYear[] {
  if (bucketKey === ALL_BUCKETS) return lifeline.years

  const years: LifelineYear[] = []
  for (const year of lifeline.years) {
    const bucket = year.buckets.find((entry) => entry.key === bucketKey)
    if (!bucket) continue

    years.push({
      ...year,
      carriedIn: bucket.carriedIn,
      carriedInValue: bucket.carriedInValue,
      carriedOut: bucket.carriedOut,
      carriedOutValue: bucket.carriedOutValue,
      inQuantity: bucket.inQuantity,
      outQuantity: bucket.outQuantity,
      inValue: bucket.inValue,
      outValue: bucket.outValue,
      openingQuantity: bucket.openingQuantity,
      openingRestated: bucket.openingRestated,
      rowCount: bucket.rowCount,
      movementCount: bucket.movementCount,
      name: bucket.name ?? year.name,
      hasMixedUnits: false,
      buckets: [bucket],
    })
  }

  return years
}

/**
 * The lifeline narrowed to the current selection — what the page renders and
 * what the exports write, so a screen and its download always agree.
 */
export function selectionAsLifeline(
  lifeline: BatchLifeline,
  bucketKey: string,
): BatchLifeline {
  if (bucketKey === ALL_BUCKETS) return lifeline

  const summary = lifelineSummary(lifeline, bucketKey)
  const bucket = lifeline.buckets.find((entry) => entry.key === bucketKey)

  return {
    ...lifeline,
    rows: filterRows(lifeline.rows, bucketKey),
    years: yearsForBucket(lifeline, bucketKey),
    buckets: bucket ? [bucket] : [],
    totals: {
      ...lifeline.totals,
      rowCount: summary.rowCount,
      movementCount: summary.movementCount,
      openingRowCount: summary.openingRowCount,
      snapshotRowCount: summary.snapshotRowCount,
      restatedOpeningCount: summary.restatedOpeningCount,
      transferCount: summary.transferCount,
      bucketCount: bucket ? 1 : 0,
      inQuantity: summary.inQuantity,
      outQuantity: summary.outQuantity,
      inValue: summary.inValue,
      outValue: summary.outValue,
      closingQuantity: summary.closingQuantity,
      closingValue: summary.closingValue,
      firstDate: summary.firstDate,
      lastDate: summary.lastDate,
      firstMovementDate: summary.firstMovementDate,
      lastMovementDate: summary.lastMovementDate,
    },
  }
}

export interface LifelineSummary {
  label: string
  rowCount: number
  movementCount: number
  openingRowCount: number
  snapshotRowCount: number
  restatedOpeningCount: number
  transferCount: number
  inQuantity: number
  outQuantity: number
  inValue: number
  outValue: number
  closingQuantity: number
  closingValue: number
  firstDate: string | null
  lastDate: string | null
  firstMovementDate: string | null
  lastMovementDate: string | null
  unitCode: string | null
  noOfDecimalPlaces: number
  /** True when the numbers span buckets whose quantities are in different units. */
  mixedUnits: boolean
}

/**
 * Summary for the current selection: the whole batch number (backend totals) or
 * one bucket (that bucket's own figures, so quantities stay in one unit).
 */
export function lifelineSummary(
  lifeline: BatchLifeline,
  bucketKey: string,
): LifelineSummary {
  if (bucketKey === ALL_BUCKETS) {
    return {
      label: 'All items and godowns',
      rowCount: lifeline.totals.rowCount,
      movementCount: lifeline.totals.movementCount,
      openingRowCount: lifeline.totals.openingRowCount,
      snapshotRowCount: lifeline.totals.snapshotRowCount,
      restatedOpeningCount: lifeline.totals.restatedOpeningCount,
      transferCount: lifeline.totals.transferCount,
      inQuantity: lifeline.totals.inQuantity,
      outQuantity: lifeline.totals.outQuantity,
      inValue: lifeline.totals.inValue,
      outValue: lifeline.totals.outValue,
      closingQuantity: lifeline.totals.closingQuantity,
      closingValue: lifeline.totals.closingValue,
      firstDate: lifeline.totals.firstDate,
      lastDate: lifeline.totals.lastDate,
      firstMovementDate: lifeline.totals.firstMovementDate,
      lastMovementDate: lifeline.totals.lastMovementDate,
      unitCode: null,
      noOfDecimalPlaces: 2,
      mixedUnits: lifeline.buckets.length > 1,
    }
  }

  const bucket = lifeline.buckets.find((entry) => entry.key === bucketKey)
  if (!bucket) {
    return lifelineSummary(lifeline, ALL_BUCKETS)
  }

  const rows = filterRows(lifeline.rows, bucketKey)

  return {
    label: bucketLabel(bucket),
    rowCount: bucket.rowCount,
    movementCount: bucket.movementCount,
    openingRowCount: rows.filter((row) => row.kind === 'opening').length,
    snapshotRowCount: rows.filter((row) => row.kind === 'closing').length,
    restatedOpeningCount: rows.filter((row) => row.restatesOpening).length,
    transferCount: rows.filter((row) => row.transfer).length,
    inQuantity: bucket.inQuantity,
    outQuantity: bucket.outQuantity,
    inValue: bucket.inValue,
    outValue: bucket.outValue,
    closingQuantity: bucket.closingQuantity,
    closingValue: bucket.closingValue,
    firstDate: bucket.firstDate,
    lastDate: bucket.lastDate,
    firstMovementDate: bucket.firstMovementDate,
    lastMovementDate: bucket.lastMovementDate,
    unitCode: bucket.unitCode,
    noOfDecimalPlaces: bucket.noOfDecimalPlaces,
    mixedUnits: false,
  }
}
