import type { BatchBalance, BatchBalancingReport } from './data/schema'
import { formatDate } from './format'
import { ISSUE_META, issuesOf } from './views'

export { formatDate }

export const EXPORT_COLUMNS = [
  { header: 'Item', accessor: 'itemName' as const },
  { header: 'Item Code', accessor: 'itemCode' as const },
  { header: 'Godown', accessor: 'godownName' as const },
  { header: 'Batch No', accessor: 'batchNo' as const },
  { header: 'Serial No', accessor: 'serialNo' as const },
  { header: 'Movement', accessor: 'movement' as const },
  { header: 'Voucher No', accessor: 'voucherNo' as const },
  { header: 'Date', accessor: 'voucherDate' as const },
  { header: 'Voucher Type', accessor: 'detail' as const },
  { header: 'Inward Qty', accessor: 'inward' as const },
  { header: 'Outward Qty', accessor: 'outward' as const },
  { header: 'Balance', accessor: 'balance' as const },
  { header: 'Rate', accessor: 'rate' as const },
  { header: 'Value', accessor: 'value' as const },
  { header: 'Expiry', accessor: 'expiryDate' as const },
  { header: 'Days To Expiry', accessor: 'daysToExpiry' as const },
  { header: 'Flags', accessor: 'flags' as const },
]

export interface BatchExportOptions {
  /** Insert SUBTOTAL rows per item / godown, mirroring the on-screen views. */
  groupBy?: 'none' | 'item' | 'godown'
  /** Append a report TOTAL row (useful for standalone CSV exports). */
  totals?: boolean
}

/** Batch-level context repeated on every row so spreadsheet filters work. */
function batchContext(batch: BatchBalance) {
  const issues = issuesOf(batch)

  return {
    itemCode: batch.itemCode ?? '',
    godownName: batch.godownName ?? `Godown #${batch.godownId}`,
    batchNo: batch.batchNo,
    expiryDate: batch.expiryDate ? formatDate(batch.expiryDate) : '',
    daysToExpiry: batch.daysToExpiry == null ? '' : String(batch.daysToExpiry),
    flags: issues.map((code) => ISSUE_META[code].label).join('; '),
  }
}

/**
 * One flat row per movement for CSV/Excel/PDF export. The opening balance is
 * a single OPENING row per batch — the same row the on-screen table shows as
 * "Opening as on <date>" — with NO extra summary line (that summary row was
 * removed from the UI as a duplicate of the opening trail's last balance).
 *
 * `groupBy` adds a SUBTOTAL line per item / godown group and `totals` adds a
 * report TOTAL line; both are off by default so the flat row set stays
 * one-movement-per-row.
 */
export function flattenForExport(
  report: BatchBalancingReport,
  options: BatchExportOptions = {},
) {
  const { groupBy = 'none', totals: withTotals = false } = options
  const rows: Record<string, string>[] = []
  const batches = report.batches

  // Batches arrive in the report's own order, so grouping preserves it.
  const groupKeys: string[] = []
  const buckets = new Map<string, BatchBalance[]>()

  for (const batch of batches) {
    const key =
      groupBy === 'item'
        ? `item:${batch.itemId}`
        : groupBy === 'godown'
          ? `godown:${batch.godownId}`
          : 'all'
    if (!buckets.has(key)) {
      buckets.set(key, [])
      groupKeys.push(key)
    }
    buckets.get(key)!.push(batch)
  }

  const pushSubtotal = (groupBatches: BatchBalance[], label: string) => {
    const first = groupBatches[0]
    const inward = groupBatches.reduce((sum, b) => sum + b.inwardQuantity, 0)
    const outward = groupBatches.reduce((sum, b) => sum + b.outwardQuantity, 0)
    const closing = groupBatches.reduce((sum, b) => sum + b.closingQuantity, 0)
    const closingValue = groupBatches.reduce((sum, b) => sum + b.closingValue, 0)
    const dp = first?.noOfDecimalPlaces ?? 2

    rows.push({
      itemName: groupBy === 'item' ? first?.itemName ?? '' : '',
      itemCode: '',
      godownName: groupBy === 'godown' ? label : '',
      batchNo: '',
      serialNo: '',
      movement: 'SUBTOTAL',
      voucherNo: '',
      voucherDate: '',
      detail: `${label} — ${groupBatches.length} batch(es)`,
      inward: inward ? inward.toFixed(dp) : '',
      outward: outward ? outward.toFixed(dp) : '',
      balance: closing.toFixed(dp),
      rate: '',
      value: closingValue.toFixed(2),
      expiryDate: '',
      daysToExpiry: '',
      flags: '',
    })
  }

  for (const key of groupKeys) {
    const groupBatches = buckets.get(key)!

    for (const batch of groupBatches) {
      const context = batchContext(batch)

      rows.push({
        ...context,
        itemName: batch.itemName,
        serialNo: '',
        movement: 'OPENING',
        voucherNo: '',
        voucherDate: '',
        detail: '',
        inward: '',
        outward: '',
        balance: batch.openingQuantity.toFixed(batch.noOfDecimalPlaces),
        rate: '',
        value: batch.openingValue.toFixed(2),
      })

      for (const mv of batch.movements) {
        rows.push({
          ...context,
          itemName: batch.itemName,
          serialNo: mv.serialNo ?? '',
          movement: mv.movementType === 'in' ? 'INWARD' : 'OUTWARD',
          voucherNo: mv.voucherNo ?? '',
          voucherDate: formatDate(mv.voucherDate),
          detail: mv.voucherTypeName ?? '',
          inward:
            mv.movementType === 'in'
              ? mv.quantity.toFixed(batch.noOfDecimalPlaces)
              : '',
          outward:
            mv.movementType === 'out'
              ? mv.quantity.toFixed(batch.noOfDecimalPlaces)
              : '',
          balance: mv.runningBalance.toFixed(batch.noOfDecimalPlaces),
          rate: mv.rate ? mv.rate.toFixed(2) : '',
          value: mv.amount ? mv.amount.toFixed(2) : '',
        })
      }

      rows.push({
        ...context,
        itemName: batch.itemName,
        serialNo: '',
        movement: 'CLOSING',
        voucherNo: '',
        voucherDate: '',
        detail: '',
        inward: '',
        outward: '',
        balance: batch.closingQuantity.toFixed(batch.noOfDecimalPlaces),
        rate: batch.averageRate ? batch.averageRate.toFixed(2) : '',
        value: batch.closingValue.toFixed(2),
      })
    }

    if (groupBy !== 'none' && key !== 'all') {
      const label =
        groupBy === 'item'
          ? groupBatches[0].itemName
          : (groupBatches[0].godownName ?? `#${groupBatches[0].godownId}`)
      pushSubtotal(groupBatches, label)
    }
  }

  if (withTotals && batches.length > 0) {
    const dp = batches[0].noOfDecimalPlaces
    rows.push({
      itemName: '',
      itemCode: '',
      godownName: '',
      batchNo: '',
      serialNo: '',
      movement: 'TOTAL',
      voucherNo: '',
      voucherDate: '',
      detail: `${report.totals.batchCount} batch(es)`,
      inward: report.totals.totalInward.toFixed(dp),
      outward: report.totals.totalOutward.toFixed(dp),
      balance: report.totals.totalClosing.toFixed(dp),
      rate: '',
      value: report.totals.totalClosingValue.toFixed(2),
      expiryDate: '',
      daysToExpiry: '',
      flags: '',
    })
  }

  return rows
}

/** CSV text for the export button: BOM + header + one line per flat row. */
export function buildCsv(
  report: BatchBalancingReport,
  options: BatchExportOptions = {},
): string {
  const rows = flattenForExport(report, options)
  const headers = EXPORT_COLUMNS.map((c) => c.header)
  const flat = rows.map((r) =>
    EXPORT_COLUMNS.map(
      (c) => `"${String(r[c.accessor] ?? '').replace(/"/g, '""')}"`,
    ),
  )
  return (
    '\uFEFF' + [headers.join(','), ...flat.map((r) => r.join(','))].join('\n')
  )
}
