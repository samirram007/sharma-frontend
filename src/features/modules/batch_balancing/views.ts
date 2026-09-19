import type { BatchBalance, BatchMovement } from './data/schema'
import type { BatchIssueFilter, BatchSortBy } from './data/api'

/* ────────────────────────────────────────────────────────────────────────
   View catalogue
   ──────────────────────────────────────────────────────────────────────── */

export type BatchViewId =
  | 'batch-wise'
  | 'item-wise'
  | 'godown-wise'
  | 'grid'
  | 'expiry-wise'
  | 'voucher-type-wise'
  | 'value-wise'
  | 'issue-wise'
  | 'ageing-wise'
  | 'mfg-cohort-wise'
  | 'velocity-wise'
  | 'consumption-wise'
  | 'variance-wise'
  | 'unit-wise'
  | 'ranked'
  | 'pivot'

/** How a view renders: flat cards, grouped cards, dense table, the
 * voucher-type contribution table, a ranked leaderboard, or the
 * item × godown pivot matrix. */
export type BatchViewLayout =
  | 'flat'
  | 'grouped'
  | 'grid'
  | 'voucher-types'
  | 'ranked'
  | 'pivot'

export interface BatchViewDef {
  id: BatchViewId
  label: string
  /** One-line explanation shown as the select's title attribute. */
  hint: string
  layout: BatchViewLayout
}

export const BATCH_VIEWS: BatchViewDef[] = [
  {
    id: 'batch-wise',
    label: 'Batch-wise',
    hint: 'One card per batch, in report order',
    layout: 'flat',
  },
  {
    id: 'item-wise',
    label: 'Item-wise',
    hint: 'Batches grouped under their item',
    layout: 'grouped',
  },
  {
    id: 'godown-wise',
    label: 'Godown-wise',
    hint: 'Batches grouped under their godown',
    layout: 'grouped',
  },
  {
    id: 'grid',
    label: 'Grid (table)',
    hint: 'Dense sortable table of every batch on the page',
    layout: 'grid',
  },
  {
    id: 'expiry-wise',
    label: 'Expiry-wise',
    hint: 'Batches grouped by how soon they expire',
    layout: 'grouped',
  },
  {
    id: 'value-wise',
    label: 'Value-wise',
    hint: 'Batches grouped by closing stock value band',
    layout: 'grouped',
  },
  {
    id: 'issue-wise',
    label: 'Reconciliation',
    hint: 'Batches grouped by the integrity issue they carry',
    layout: 'grouped',
  },
  {
    id: 'voucher-type-wise',
    label: 'Voucher-type-wise',
    hint: 'What each voucher type contributed (in / out qty and value)',
    layout: 'voucher-types',
  },
  {
    id: 'ageing-wise',
    label: 'Ageing-wise',
    hint: 'Batches grouped by how long ago they were manufactured',
    layout: 'grouped',
  },
  {
    id: 'mfg-cohort-wise',
    label: 'Mfg cohort',
    hint: 'Batches grouped by manufacturing month, newest first',
    layout: 'grouped',
  },
  {
    id: 'velocity-wise',
    label: 'Movement velocity',
    hint: 'Batches grouped by how many voucher lines moved them',
    layout: 'grouped',
  },
  {
    id: 'consumption-wise',
    label: 'Consumption',
    hint: 'Batches grouped by how much of the receipt was issued out',
    layout: 'grouped',
  },
  {
    id: 'variance-wise',
    label: 'Opening variance',
    hint: 'Batches grouped by how far opening drifts from the opening voucher',
    layout: 'grouped',
  },
  {
    id: 'unit-wise',
    label: 'Unit-wise',
    hint: 'Batches grouped by unit of measure (quantities only compare within a unit)',
    layout: 'grouped',
  },
  {
    id: 'ranked',
    label: 'Ranked (top batches)',
    hint: 'Biggest batches first, with each one\'s share of the page value',
    layout: 'ranked',
  },
  {
    id: 'pivot',
    label: 'Item × godown pivot',
    hint: 'Closing stock of every item in every godown on one matrix',
    layout: 'pivot',
  },
]

export function viewLayout(view: BatchViewId): BatchViewLayout {
  return BATCH_VIEWS.find((v) => v.id === view)?.layout ?? 'flat'
}

/* ────────────────────────────────────────────────────────────────────────
   Group shape
   ──────────────────────────────────────────────────────────────────────── */

export type BatchGroupTone = 'neutral' | 'success' | 'warning' | 'danger'

export interface BatchGroupTotals {
  batchCount: number
  opening: number
  inward: number
  outward: number
  closing: number
  closingValue: number
  unit: string | null
}

export interface BatchGroup {
  key: string
  label: string
  sublabel: string | null
  /** Extra context line, e.g. the threshold a band was measured against. */
  note: string | null
  tone: BatchGroupTone
  totals: BatchGroupTotals
  batches: BatchBalance[]
}

const round = (value: number, digits: number) => {
  const factor = 10 ** digits
  return Math.round(value * factor) / factor
}

export function totalsFor(batches: BatchBalance[]): BatchGroupTotals {
  const totals: BatchGroupTotals = {
    batchCount: batches.length,
    opening: 0,
    inward: 0,
    outward: 0,
    closing: 0,
    closingValue: 0,
    unit: null,
  }

  for (const batch of batches) {
    totals.opening += batch.openingQuantity
    totals.inward += batch.inwardQuantity
    totals.outward += batch.outwardQuantity
    totals.closing += batch.closingQuantity
    totals.closingValue += batch.closingValue
    if (!totals.unit && batch.unitCode) totals.unit = batch.unitCode
  }

  return {
    ...totals,
    opening: round(totals.opening, 4),
    inward: round(totals.inward, 4),
    outward: round(totals.outward, 4),
    closing: round(totals.closing, 4),
    closingValue: round(totals.closingValue, 2),
  }
}

type GroupMeta = {
  key: string
  label: string
  sublabel?: string | null
  tone?: BatchGroupTone
  note?: string | null
}

/**
 * Buckets batches into groups in first-appearance order — the report order is
 * preserved inside each group because the source array is already ordered by
 * the backend's sort.
 */
function collectGroups(
  batches: BatchBalance[],
  metaOf: (batch: BatchBalance) => GroupMeta | null,
): BatchGroup[] {
  const groups = new Map<string, BatchGroup>()

  for (const batch of batches) {
    const meta = metaOf(batch)
    if (!meta) continue

    let group = groups.get(meta.key)
    if (!group) {
      group = {
        key: meta.key,
        label: meta.label,
        sublabel: meta.sublabel ?? null,
        note: meta.note ?? null,
        tone: meta.tone ?? 'neutral',
        totals: totalsFor([]),
        batches: [],
      }
      groups.set(meta.key, group)
    }
    group.batches.push(batch)
  }

  const result = [...groups.values()]
  for (const group of result) group.totals = totalsFor(group.batches)
  return result
}

/* ────────────────────────────────────────────────────────────────────────
   Integrity issues
   ──────────────────────────────────────────────────────────────────────── */

export type BatchIssueCode =
  | 'negativeClosing'
  | 'carryForwardOpening'
  | 'journalVariance'
  | 'noMovement'

export const ISSUE_ORDER: BatchIssueCode[] = [
  'negativeClosing',
  'carryForwardOpening',
  'journalVariance',
  'noMovement',
]

export const ISSUE_META: Record<
  BatchIssueCode,
  { label: string; detail: string; tone: BatchGroupTone }
> = {
  negativeClosing: {
    label: 'Negative balance',
    detail:
      'Closing quantity is below zero — more stock was issued than was ever received for this batch. Check the outward vouchers or post a correction.',
    tone: 'danger',
  },
  carryForwardOpening: {
    label: 'No opening voucher',
    detail:
      "Non-zero opening with no row in this fiscal year's opening voucher — the balance was carried forward from prior-year history. Reconcile the opening voucher.",
    tone: 'warning',
  },
  journalVariance: {
    label: 'Opening variance',
    detail:
      'Opening quantity disagrees with this fiscal year\'s opening-stock journal — movements before the period start were rolled in, so the opening voucher needs a matching entry.',
    tone: 'warning',
  },
  noMovement: {
    label: 'No movement',
    detail:
      'Nothing moved inside the reporting window — the whole balance was carried in from the opening position.',
    tone: 'neutral',
  },
}

/** Issues a batch currently carries, most severe first. */
export function issuesOf(batch: BatchBalance): BatchIssueCode[] {
  const flags = batch.flags
  return ISSUE_ORDER.filter((code) => flags?.[code] === true)
}

/** Overall severity used to tint the batch row / card. */
export function batchSeverity(batch: BatchBalance): BatchGroupTone {
  const issues = issuesOf(batch)
  if (issues.includes('negativeClosing')) return 'danger'
  if (issues.includes('carryForwardOpening')) return 'warning'
  if (issues.includes('journalVariance')) return 'warning'
  return 'neutral'
}

export function countByIssue(
  batches: BatchBalance[],
): Record<BatchIssueCode, number> & { clean: number } {
  const counts = {
    negativeClosing: 0,
    carryForwardOpening: 0,
    journalVariance: 0,
    noMovement: 0,
    clean: 0,
  }

  for (const batch of batches) {
    const issues = issuesOf(batch)
    if (issues.length === 0) counts.clean += 1
    for (const issue of issues) counts[issue] += 1
  }

  return counts
}

/** Toolbar options for the server-side integrity filter. */
export const ISSUE_FILTERS: { value: BatchIssueFilter; label: string }[] = [
  { value: 'all', label: 'All batches' },
  { value: 'ok', label: 'Clean only (no issue)' },
  { value: 'negative', label: 'Negative balance' },
  { value: 'carry_forward', label: 'No opening voucher' },
  { value: 'journal_variance', label: 'Opening variance' },
  { value: 'no_movement', label: 'No movement in window' },
]

/* ────────────────────────────────────────────────────────────────────────
   Ageing / valuation bands
   ──────────────────────────────────────────────────────────────────────── */

export interface BatchBand {
  id: string
  label: string
  tone: BatchGroupTone
  test: (batch: BatchBalance) => boolean
}

const EXPIRY_DAYS_90 = 90
const EXPIRY_DAYS_180 = 180

/** Expiry bands, most urgent first. `daysToExpiry` is negative once expired. */
export const EXPIRY_BANDS: BatchBand[] = [
  {
    id: 'expired',
    label: 'Expired',
    tone: 'danger',
    test: (b) => b.expiryStatus === 'expired',
  },
  {
    id: 'due30',
    label: 'Expiring within 30 days',
    tone: 'danger',
    test: (b) =>
      b.expiryStatus === 'expiring' &&
      b.daysToExpiry != null &&
      b.daysToExpiry <= 30,
  },
  {
    id: 'due90',
    label: `Expiring in 31–${EXPIRY_DAYS_90} days`,
    tone: 'warning',
    test: (b) =>
      b.expiryStatus === 'expiring' &&
      b.daysToExpiry != null &&
      b.daysToExpiry > 30,
  },
  {
    id: 'due180',
    label: `Expiring in ${EXPIRY_DAYS_90 + 1}–${EXPIRY_DAYS_180} days`,
    tone: 'neutral',
    test: (b) =>
      b.expiryStatus === 'valid' &&
      b.daysToExpiry != null &&
      b.daysToExpiry <= EXPIRY_DAYS_180,
  },
  {
    // Catch-all for everything still valid after 180 days (including a valid
    // batch the backend could not compute a day count for) — bands must stay
    // mutually exclusive or a batch would be counted twice.
    id: 'later',
    label: `Expiring after ${EXPIRY_DAYS_180} days`,
    tone: 'success',
    test: (b) =>
      b.expiryStatus === 'valid' &&
      (b.daysToExpiry == null || b.daysToExpiry > EXPIRY_DAYS_180),
  },
  {
    id: 'none',
    label: 'No expiry recorded',
    tone: 'neutral',
    test: (b) => b.expiryStatus === 'none',
  },
]

/** Closing-value bands (negative value is its own band — usually a data bug). */
export const VALUE_BANDS: BatchBand[] = [
  {
    id: 'negative',
    label: 'Negative value',
    tone: 'danger',
    test: (b) => b.closingValue < 0,
  },
  {
    id: 'nil',
    label: 'Nil value',
    tone: 'neutral',
    test: (b) => b.closingValue === 0,
  },
  {
    id: 'low',
    label: 'Up to ₹10,000',
    tone: 'neutral',
    test: (b) => b.closingValue > 0 && b.closingValue <= 10_000,
  },
  {
    id: 'mid',
    label: '₹10,000 – ₹1 lakh',
    tone: 'neutral',
    test: (b) => b.closingValue > 10_000 && b.closingValue <= 100_000,
  },
  {
    id: 'high',
    label: '₹1 lakh – ₹10 lakh',
    tone: 'neutral',
    test: (b) => b.closingValue > 100_000 && b.closingValue <= 1_000_000,
  },
  {
    id: 'top',
    label: 'Above ₹10 lakh',
    tone: 'neutral',
    test: (b) => b.closingValue > 1_000_000,
  },
]

/* ────────────────────────────────────────────────────────────────────────
   Quantity tolerance
   ──────────────────────────────────────────────────────────────────────── */

/**
 * A quantity counts as nil once it is below half of the batch's smallest
 * displayed decimal — so a 2-decimal batch treats 0.004 as zero instead of
 * reporting a rounding artefact as stock on hand.
 */
export function isZeroQuantity(
  value: number,
  decimals: number | null | undefined,
): boolean {
  const digits = Math.min(Math.max(decimals ?? 2, 0), 4)
  return Math.abs(value) < 0.5 * 10 ** -digits
}

/* ────────────────────────────────────────────────────────────────────────
   Ageing / velocity / consumption / variance bands
   ──────────────────────────────────────────────────────────────────────── */

const AGE_DAYS_30 = 30
const AGE_DAYS_90 = 90
const AGE_DAYS_180 = 180
const AGE_DAYS_365 = 365

/** Days-since-mfg band — bands stay mutually exclusive by construction. */
function daysBand(
  id: string,
  label: string,
  tone: BatchGroupTone,
  min: number,
  max: number | null,
): BatchBand {
  return {
    id,
    label,
    tone,
    test: (b) =>
      b.daysSinceMfg != null &&
      b.daysSinceMfg >= min &&
      (max == null || b.daysSinceMfg <= max),
  }
}

/** How long the batch has been in the books, freshest first. */
export const AGE_BANDS: BatchBand[] = [
  {
    id: 'future',
    label: 'Mfg date in the future',
    tone: 'warning',
    test: (b) => b.daysSinceMfg != null && b.daysSinceMfg < 0,
  },
  daysBand('fresh', `Up to ${AGE_DAYS_30} days old`, 'success', 0, AGE_DAYS_30),
  daysBand(
    'recent',
    `${AGE_DAYS_30 + 1}–${AGE_DAYS_90} days old`,
    'neutral',
    AGE_DAYS_30 + 1,
    AGE_DAYS_90,
  ),
  daysBand(
    'maturing',
    `${AGE_DAYS_90 + 1}–${AGE_DAYS_180} days old`,
    'neutral',
    AGE_DAYS_90 + 1,
    AGE_DAYS_180,
  ),
  daysBand(
    'aged',
    `${AGE_DAYS_180 + 1}–${AGE_DAYS_365} days old`,
    'warning',
    AGE_DAYS_180 + 1,
    AGE_DAYS_365,
  ),
  daysBand(
    'stale',
    `Older than ${AGE_DAYS_365} days`,
    'danger',
    AGE_DAYS_365 + 1,
    null,
  ),
  {
    id: 'unknown',
    label: 'No mfg date',
    tone: 'neutral',
    test: (b) => b.daysSinceMfg == null,
  },
]

/** Voucher lines that touched the batch inside the reporting window. */
export const VELOCITY_BANDS: BatchBand[] = [
  {
    id: 'dormant',
    label: 'No movement in the window',
    tone: 'neutral',
    test: (b) => b.movementCount <= 0,
  },
  {
    id: 'slow',
    label: '1–3 movements',
    tone: 'neutral',
    test: (b) => b.movementCount >= 1 && b.movementCount <= 3,
  },
  {
    id: 'steady',
    label: '4–9 movements',
    tone: 'neutral',
    test: (b) => b.movementCount >= 4 && b.movementCount <= 9,
  },
  {
    id: 'busy',
    label: '10–29 movements',
    tone: 'success',
    test: (b) => b.movementCount >= 10 && b.movementCount <= 29,
  },
  {
    id: 'hot',
    label: '30+ movements',
    tone: 'success',
    test: (b) => b.movementCount >= 30,
  },
]

/**
 * How much of what was received has actually gone out again — the answer to
 * "is this batch moving, or is it sitting in the godown".
 */
export const CONSUMPTION_BANDS: BatchBand[] = [
  {
    id: 'over-issued',
    label: 'Issued beyond available (negative closing)',
    tone: 'danger',
    test: (b) =>
      b.outwardQuantity > 0 &&
      b.closingQuantity < 0 &&
      !isZeroQuantity(b.closingQuantity, b.noOfDecimalPlaces),
  },
  {
    id: 'fully-issued',
    label: 'Fully issued (closing nil)',
    tone: 'neutral',
    test: (b) =>
      b.outwardQuantity > 0 &&
      isZeroQuantity(b.closingQuantity, b.noOfDecimalPlaces),
  },
  {
    id: 'partly-issued',
    label: 'Partly issued (stock left)',
    tone: 'success',
    test: (b) =>
      b.outwardQuantity > 0 &&
      b.closingQuantity > 0 &&
      !isZeroQuantity(b.closingQuantity, b.noOfDecimalPlaces),
  },
  {
    id: 'untouched',
    label: 'Issued nothing (opening intact)',
    tone: 'warning',
    test: (b) => b.outwardQuantity <= 0 && b.openingQuantity > 0,
  },
  {
    id: 'received-only',
    label: 'Received, never issued',
    tone: 'warning',
    test: (b) =>
      b.outwardQuantity <= 0 && b.openingQuantity <= 0 && b.inwardQuantity > 0,
  },
  {
    id: 'idle',
    label: 'No receipts and no issues',
    tone: 'neutral',
    test: (b) =>
      b.outwardQuantity <= 0 &&
      b.openingQuantity <= 0 &&
      b.inwardQuantity <= 0 &&
      isZeroQuantity(b.closingQuantity, b.noOfDecimalPlaces),
  },
]

/** Relative thresholds for the opening-variance bands. */
export const VARIANCE_MINOR_RATIO = 0.01
export const VARIANCE_MATERIAL_RATIO = 0.05

/** Opening balance minus this financial year's opening-stock journal. */
export function openingVariance(batch: BatchBalance): number {
  return round(batch.openingQuantity - batch.openingAsPerJournal, 4)
}

/**
 * |variance| as a share of the journal opening — null when there is no opening
 * voucher row to compare against.
 */
export function openingVarianceRatio(batch: BatchBalance): number | null {
  if (isZeroQuantity(batch.openingAsPerJournal, batch.noOfDecimalPlaces)) {
    return null
  }
  return Math.abs(openingVariance(batch)) / Math.abs(batch.openingAsPerJournal)
}

/** True when the batch's opening does not square with the opening voucher. */
export function hasOpeningVariance(batch: BatchBalance): boolean {
  return !isZeroQuantity(openingVariance(batch), batch.noOfDecimalPlaces)
}

/**
 * Opening vs the 9010 opening-stock journal. The catch-all band in
 * `bandGroups` still protects against a batch that fits none of these.
 */
export const VARIANCE_BANDS: BatchBand[] = [
  {
    id: 'unvouched',
    label: 'Opening with no voucher row',
    tone: 'warning',
    test: (b) =>
      openingVarianceRatio(b) == null &&
      !isZeroQuantity(b.openingQuantity, b.noOfDecimalPlaces),
  },
  {
    id: 'matched',
    label: 'Matched (within rounding)',
    tone: 'success',
    test: (b) => !hasOpeningVariance(b),
  },
  {
    id: 'minor',
    label: `Minor drift (up to ${VARIANCE_MINOR_RATIO * 100}% of the journal)`,
    tone: 'neutral',
    test: (b) => {
      const ratio = openingVarianceRatio(b)
      return (
        hasOpeningVariance(b) && ratio != null && ratio <= VARIANCE_MINOR_RATIO
      )
    },
  },
  {
    id: 'moderate',
    label: `${VARIANCE_MINOR_RATIO * 100}–${VARIANCE_MATERIAL_RATIO * 100}% of the journal`,
    tone: 'warning',
    test: (b) => {
      const ratio = openingVarianceRatio(b)
      return (
        hasOpeningVariance(b) &&
        ratio != null &&
        ratio > VARIANCE_MINOR_RATIO &&
        ratio <= VARIANCE_MATERIAL_RATIO
      )
    },
  },
  {
    id: 'material',
    label: `More than ${VARIANCE_MATERIAL_RATIO * 100}% of the journal`,
    tone: 'danger',
    test: (b) => {
      const ratio = openingVarianceRatio(b)
      return (
        hasOpeningVariance(b) && ratio != null && ratio > VARIANCE_MATERIAL_RATIO
      )
    },
  },
]

/* ────────────────────────────────────────────────────────────────────────
   Manufacturing cohorts
   ──────────────────────────────────────────────────────────────────────── */

// Month labels are spelled out locally so the labels never depend on the
// runtime's ICU locale data.
const MONTH_LABELS = [
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

/** yyyy-MM cohort key for a mfg date (null when absent or malformed). */
export function mfgCohortKey(date: string | null | undefined): string | null {
  if (!date) return null
  const match = /^(\d{4})-(\d{2})/.exec(date)
  if (!match) return null
  const month = Number(match[2])
  if (!Number.isInteger(month) || month < 1 || month > 12) return null
  return `${match[1]}-${match[2]}`
}

/** "Mar 2026" for the key "2026-03". */
export function mfgCohortLabel(key: string): string {
  const [year, month] = key.split('-')
  return `${MONTH_LABELS[Number(month) - 1] ?? month} ${year}`
}

/** Batches grouped by manufacturing month, newest cohort first. */
function cohortGroups(batches: BatchBalance[]): BatchGroup[] {
  const cohorts = new Map<string, BatchBalance[]>()
  const undated: BatchBalance[] = []

  for (const batch of batches) {
    const key = mfgCohortKey(batch.mfgDate)
    if (!key) {
      undated.push(batch)
      continue
    }
    const bucket = cohorts.get(key)
    if (bucket) bucket.push(batch)
    else cohorts.set(key, [batch])
  }

  const groups: BatchGroup[] = [...cohorts.entries()]
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([key, list]) => ({
      key: `mfg-${key}`,
      label: mfgCohortLabel(key),
      sublabel: null,
      note: null,
      tone: 'neutral' as BatchGroupTone,
      totals: totalsFor(list),
      batches: list,
    }))

  if (undated.length > 0) {
    groups.push({
      key: 'mfg-none',
      label: 'No mfg date',
      sublabel: null,
      note: 'Manufacturing date is missing — these batches cannot be aged either.',
      tone: 'warning',
      totals: totalsFor(undated),
      batches: undated,
    })
  }

  return groups
}

function bandGroups(
  batches: BatchBalance[],
  bands: BatchBand[],
  keyPrefix: string,
  note: string | null,
): BatchGroup[] {
  const groups: BatchGroup[] = []

  for (const band of bands) {
    const matching = batches.filter(band.test)
    if (matching.length === 0) continue
    groups.push({
      key: `${keyPrefix}-${band.id}`,
      label: band.label,
      sublabel: null,
      note,
      tone: band.tone,
      totals: totalsFor(matching),
      batches: matching,
    })
  }

  // Catch-all: a band must never silently hide a batch (e.g. a backend that
  // reports the expiring state without a day count).
  const unmatched = batches.filter(
    (batch) => !bands.some((band) => band.test(batch)),
  )
  if (unmatched.length > 0) {
    groups.push({
      key: `${keyPrefix}-unclassified`,
      label: 'Not classified',
      sublabel: null,
      note: 'No band matched these batches — check the ageing data.',
      tone: 'warning',
      totals: totalsFor(unmatched),
      batches: unmatched,
    })
  }

  return groups
}

/* ────────────────────────────────────────────────────────────────────────
   Grouping entry point
   ──────────────────────────────────────────────────────────────────────── */

export function groupBatches(
  batches: BatchBalance[],
  view: BatchViewId,
  options: { expiryWithinDays?: number; ageingAsOnDate?: string | null } = {},
): BatchGroup[] {
  switch (view) {
    case 'item-wise':
      return collectGroups(batches, (b) => ({
        key: `item-${b.itemId}`,
        label: b.itemName,
        sublabel: b.itemCode,
      }))

    case 'godown-wise':
      return collectGroups(batches, (b) => ({
        key: `godown-${b.godownId}`,
        label: b.godownName ?? `Godown #${b.godownId}`,
        sublabel: b.godownCode,
      }))

    case 'expiry-wise':
      return bandGroups(
        batches,
        EXPIRY_BANDS,
        'expiry',
        options.expiryWithinDays
          ? `Expiring-soon threshold: ${options.expiryWithinDays} days${
              options.ageingAsOnDate ? ` as on ${options.ageingAsOnDate}` : ''
            }`
          : null,
      )

    case 'value-wise':
      return bandGroups(batches, VALUE_BANDS, 'value', 'Closing stock value')

    case 'ageing-wise':
      return bandGroups(
        batches,
        AGE_BANDS,
        'age',
        options.ageingAsOnDate
          ? `Manufacturing age as on ${options.ageingAsOnDate}`
          : 'Manufacturing age',
      )

    case 'mfg-cohort-wise':
      return cohortGroups(batches)

    case 'velocity-wise':
      return bandGroups(
        batches,
        VELOCITY_BANDS,
        'velocity',
        'Voucher lines that touched the batch inside the reporting window',
      )

    case 'consumption-wise':
      return bandGroups(
        batches,
        CONSUMPTION_BANDS,
        'consumption',
        'What was received against what has been issued',
      )

    case 'variance-wise':
      return bandGroups(
        batches,
        VARIANCE_BANDS,
        'variance',
        "Opening balance compared with this financial year's opening-stock voucher",
      )

    case 'unit-wise':
      return collectGroups(batches, (b) =>
        b.unitCode
          ? {
              key: `unit-${b.unitCode}`,
              label: b.unitCode,
              sublabel: null,
              note: 'Quantities in different units must not be added together — reconcile each unit on its own.',
            }
          : {
              key: 'unit-none',
              label: 'No unit recorded',
              sublabel: null,
              tone: 'warning',
              note: 'Unit of measure is missing for these batches.',
            },
      )

    case 'issue-wise': {
      const groups: BatchGroup[] = []

      for (const code of ISSUE_ORDER) {
        const matching = batches.filter((b) => b.flags?.[code] === true)
        if (matching.length === 0) continue
        groups.push({
          key: `issue-${code}`,
          label: ISSUE_META[code].label,
          sublabel: null,
          note: ISSUE_META[code].detail,
          tone: ISSUE_META[code].tone,
          totals: totalsFor(matching),
          batches: matching,
        })
      }

      const clean = batches.filter((b) => issuesOf(b).length === 0)
      if (clean.length > 0) {
        groups.push({
          key: 'issue-clean',
          label: 'No issue detected',
          sublabel: null,
          note: 'Opening, movement and closing all reconcile for these batches.',
          tone: 'success',
          totals: totalsFor(clean),
          batches: clean,
        })
      }

      return groups
    }

    default:
      return []
  }
}

/* ────────────────────────────────────────────────────────────────────────
   Voucher-type contribution view
   ──────────────────────────────────────────────────────────────────────── */

export interface VoucherTypeContribution {
  key: string
  label: string
  inward: number
  outward: number
  inwardValue: number
  outwardValue: number
  movementCount: number
  unit: string | null
  batches: BatchBalance[]
}

type MovementLike = Pick<
  BatchMovement,
  'voucherTypeName' | 'movementType' | 'quantity' | 'amount'
>

/**
 * Aggregates the movement trail by voucher type — answers "where did this
 * stock actually come from / go to". Opening rows (the 9010 journal and the
 * pre-period movements rolled into Opening) are included, so the column sums
 * reconcile with the batch balances.
 */
export function groupByVoucherType(
  batches: BatchBalance[],
): VoucherTypeContribution[] {
  const groups = new Map<string, VoucherTypeContribution>()

  const push = (batch: BatchBalance, movement: MovementLike) => {
    const label = movement.voucherTypeName ?? 'Unclassified'
    let group = groups.get(label)
    if (!group) {
      group = {
        key: `vt-${label}`,
        label,
        inward: 0,
        outward: 0,
        inwardValue: 0,
        outwardValue: 0,
        movementCount: 0,
        unit: batch.unitCode,
        batches: [],
      }
      groups.set(label, group)
    }

    if (movement.movementType === 'in') {
      group.inward += movement.quantity
      group.inwardValue += movement.amount
    } else {
      group.outward += movement.quantity
      group.outwardValue += movement.amount
    }
    group.movementCount += 1
    if (!group.batches.includes(batch)) group.batches.push(batch)
  }

  for (const batch of batches) {
    for (const movement of batch.openingMovements ?? []) push(batch, movement)
    for (const movement of batch.movements) push(batch, movement)
  }

  return [...groups.values()]
    .map((group) => ({
      ...group,
      inward: round(group.inward, 4),
      outward: round(group.outward, 4),
      inwardValue: round(group.inwardValue, 2),
      outwardValue: round(group.outwardValue, 2),
    }))
    .sort(
      (a, b) =>
        b.movementCount - a.movementCount || a.label.localeCompare(b.label),
    )
}

/* ────────────────────────────────────────────────────────────────────────
   Sorting options (applied server-side at the batch level)
   ──────────────────────────────────────────────────────────────────────── */

export const SORT_OPTIONS: { value: BatchSortBy; label: string }[] = [
  { value: 'item', label: 'Item' },
  { value: 'batch', label: 'Batch no' },
  { value: 'godown', label: 'Godown' },
  { value: 'opening', label: 'Opening qty' },
  { value: 'inward', label: 'Inward qty' },
  { value: 'outward', label: 'Outward qty' },
  { value: 'closing', label: 'Closing qty' },
  { value: 'value', label: 'Closing value' },
  { value: 'expiry', label: 'Expiry date' },
  { value: 'activity', label: 'Last movement' },
]

/* ────────────────────────────────────────────────────────────────────────
   Ranked view — biggest batches first
   ──────────────────────────────────────────────────────────────────────── */

export type RankMetric = 'value' | 'quantity'

export interface RankedRow {
  rank: number
  batch: BatchBalance
  metric: number
  /** Share of the page's metric total (0–1). */
  share: number
  /** Running share from rank 1 down to this row. */
  cumulativeShare: number
}

export interface RankedTable {
  rows: RankedRow[]
  /** Share denominator — the metric summed over every row. */
  total: number
  /** Rows that are nil on the metric (ranked, but holding no share). */
  nilCount: number
  /** Negative rows — their share is negative by construction. */
  negativeCount: number
}

export function rankMetricOf(batch: BatchBalance, metric: RankMetric): number {
  return metric === 'value' ? batch.closingValue : batch.closingQuantity
}

/**
 * Batches ranked by closing value (or quantity), with each row's share of the
 * ranked total. The ranked and pivot views hand this every matching batch
 * (the report loads balances-only for those views), so a rank is never scoped
 * to one page of a paged report.
 */
export function buildRanked(
  batches: BatchBalance[],
  metric: RankMetric = 'value',
): RankedTable {
  // Array.prototype.sort is stable, so equal metrics keep the report order.
  const ranked = batches
    .map((batch) => ({ batch, metric: rankMetricOf(batch, metric) }))
    .sort((a, b) => b.metric - a.metric)

  const total = ranked.reduce((sum, row) => sum + row.metric, 0)

  let running = 0
  const rows = ranked.map((row, index) => {
    const share = total !== 0 ? row.metric / total : 0
    running += share
    return {
      rank: index + 1,
      batch: row.batch,
      metric: row.metric,
      share,
      cumulativeShare: running,
    }
  })

  return {
    rows,
    total: round(total, 2),
    nilCount: ranked.filter((row) => row.metric === 0).length,
    negativeCount: ranked.filter((row) => row.metric < 0).length,
  }
}

/* ────────────────────────────────────────────────────────────────────────
   Pivot view — item × godown closing matrix
   ──────────────────────────────────────────────────────────────────────── */

export interface PivotColumn {
  godownId: number
  label: string
  code: string | null
}

export interface PivotCell {
  quantity: number
  value: number
  batchCount: number
  /** Largest batch by |value| — what the inspector opens on click. */
  primary: BatchBalance
  /** Batch numbers behind the cell, for the hover title. */
  batchNos: string[]
}

export interface PivotRow {
  itemId: number
  itemName: string
  itemCode: string | null
  unitCode: string | null
  noOfDecimalPlaces: number
  /** Cell per column, aligned with `columns`; null = no stock of the item there. */
  cells: (PivotCell | null)[]
  quantity: number
  value: number
  batchCount: number
}

export interface PivotTable {
  columns: PivotColumn[]
  rows: PivotRow[]
  /** Closing value per godown column. */
  columnValues: number[]
  columnBatchCounts: number[]
  /** Quantity is deliberately not totalled across items — units differ. */
  totalValue: number
  batchCount: number
}

/**
 * Builds the item × godown matrix of closing balances. Cell quantities stay
 * within one item (same unit), while the column / grand totals only add money:
 * adding 5 KG to 5 NOS would be meaningless.
 */
export function buildPivot(batches: BatchBalance[]): PivotTable {
  const columns: PivotColumn[] = []
  const columnIndex = new Map<number, number>()
  const rows: PivotRow[] = []
  const rowIndex = new Map<number, number>()

  const columnFor = (batch: BatchBalance): number => {
    const existing = columnIndex.get(batch.godownId)
    if (existing != null) return existing
    const index = columns.length
    columns.push({
      godownId: batch.godownId,
      label: batch.godownName ?? `Godown #${batch.godownId}`,
      code: batch.godownCode,
    })
    columnIndex.set(batch.godownId, index)
    return index
  }

  const rowFor = (batch: BatchBalance): PivotRow => {
    const existing = rowIndex.get(batch.itemId)
    if (existing != null) return rows[existing]
    rowIndex.set(batch.itemId, rows.length)
    rows.push({
      itemId: batch.itemId,
      itemName: batch.itemName,
      itemCode: batch.itemCode,
      unitCode: batch.unitCode,
      noOfDecimalPlaces: batch.noOfDecimalPlaces,
      cells: [],
      quantity: 0,
      value: 0,
      batchCount: 0,
    })
    return rows[rows.length - 1]
  }

  for (const batch of batches) {
    const column = columnFor(batch)
    const row = rowFor(batch)

    const cell: PivotCell = row.cells[column] ?? {
      quantity: 0,
      value: 0,
      batchCount: 0,
      primary: batch,
      batchNos: [],
    }
    cell.quantity += batch.closingQuantity
    cell.value += batch.closingValue
    cell.batchCount += 1
    cell.batchNos.push(batch.batchNo)
    if (
      Math.abs(batch.closingValue) > Math.abs(cell.primary.closingValue)
    ) {
      cell.primary = batch
    }

    row.cells[column] = cell
    row.quantity += batch.closingQuantity
    row.value += batch.closingValue
    row.batchCount += 1
  }

  // Square the matrix off so every row carries one entry per column.
  const grid = rows.map((row) => ({
    ...row,
    cells: columns.map((_, index) => row.cells[index] ?? null),
    quantity: round(row.quantity, 4),
    value: round(row.value, 2),
  }))

  const columnValues = columns.map((_, index) =>
    round(
      grid.reduce((sum, row) => sum + (row.cells[index]?.value ?? 0), 0),
      2,
    ),
  )
  const columnBatchCounts = columns.map((_, index) =>
    grid.reduce((sum, row) => sum + (row.cells[index]?.batchCount ?? 0), 0),
  )

  return {
    columns,
    rows: grid,
    columnValues,
    columnBatchCounts,
    totalValue: round(
      columnValues.reduce((sum, value) => sum + value, 0),
      2,
    ),
    batchCount: batches.length,
  }
}
