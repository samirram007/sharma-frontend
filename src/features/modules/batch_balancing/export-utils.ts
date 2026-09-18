import type { BatchBalancingReport } from './data/schema'

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
]

/**
 * One flat row per movement for CSV/Excel/PDF export. The opening balance is
 * a single OPENING row per batch — the same row the on-screen table shows as
 * "Opening as on <date>" — with NO extra summary line (that summary row was
 * removed from the UI as a duplicate of the opening trail's last balance).
 */
export function flattenForExport(report: BatchBalancingReport) {
  const rows: Record<string, string>[] = []
  for (const batch of report.batches) {
    rows.push({
      itemName: batch.itemName,
      itemCode: batch.itemCode ?? '',
      godownName: batch.godownName ?? '',
      batchNo: batch.batchNo,
      serialNo: '',
      movement: 'OPENING',
      voucherNo: '',
      voucherDate: '',
      detail: '',
      inward: '',
      outward: '',
      balance: batch.openingQuantity.toFixed(batch.noOfDecimalPlaces),
    })
    for (const mv of batch.movements) {
      rows.push({
        itemName: batch.itemName,
        itemCode: batch.itemCode ?? '',
        godownName: batch.godownName ?? '',
        batchNo: batch.batchNo,
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
      })
    }
    rows.push({
      itemName: batch.itemName,
      itemCode: batch.itemCode ?? '',
      godownName: batch.godownName ?? '',
      batchNo: batch.batchNo,
      serialNo: '',
      movement: 'CLOSING',
      voucherNo: '',
      voucherDate: '',
      detail: '',
      inward: '',
      outward: '',
      balance: batch.closingQuantity.toFixed(batch.noOfDecimalPlaces),
    })
  }
  return rows
}

/** CSV text for the export button: BOM + header + one line per flat row. */
export function buildCsv(report: BatchBalancingReport): string {
  const rows = flattenForExport(report)
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
