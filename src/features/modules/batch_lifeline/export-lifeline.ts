import { formatDate } from '@/features/modules/batch_balancing/format'
import type { BatchLifeline, LifelineRow, LifelineYear } from './data/schema'

export const LIFELINE_EXPORT_COLUMNS = [
  { header: 'Fiscal Year', accessor: 'fiscalYear' as const },
  { header: 'Date', accessor: 'voucherDate' as const },
  { header: 'Voucher No', accessor: 'voucherNo' as const },
  { header: 'Voucher Type', accessor: 'voucherType' as const },
  { header: 'Line Kind', accessor: 'kind' as const },
  { header: 'Item', accessor: 'itemName' as const },
  { header: 'Item Code', accessor: 'itemCode' as const },
  { header: 'Godown', accessor: 'godownName' as const },
  { header: 'Batch No', accessor: 'batchNo' as const },
  { header: 'Serial No', accessor: 'serialNo' as const },
  { header: 'In Qty', accessor: 'inQuantity' as const },
  { header: 'Out Qty', accessor: 'outQuantity' as const },
  { header: 'Balance', accessor: 'balance' as const },
  { header: 'Unit', accessor: 'unitCode' as const },
  { header: 'Rate', accessor: 'rate' as const },
  { header: 'Value', accessor: 'value' as const },
  { header: 'Running Value', accessor: 'runningValue' as const },
  { header: 'Transfer', accessor: 'transfer' as const },
  { header: 'Remarks', accessor: 'remarks' as const },
]

const KIND_LABELS: Record<LifelineRow['kind'], string> = {
  movement: 'Movement',
  opening: 'Opening journal',
  closing: 'Year-end snapshot',
}

/**
 * One spreadsheet row per lifeline line (plus a marker row per fiscal year), so
 * a saved lifeline is readable on its own — outside the app the year dividers
 * and running balances are what make the history legible.
 */
export function lifelineExportRows(lifeline: BatchLifeline) {
  const yearByKey = new Map<string, LifelineYear>(
    lifeline.years.map((year) => [year.key, year]),
  )

  return lifeline.rows.map((row) => {
    const year = yearByKey.get(row.yearKey)
    const snapshot = row.kind === 'closing'

    return {
      fiscalYear: year?.name ?? '',
      voucherDate: row.voucherDate ? formatDate(row.voucherDate) : '',
      voucherNo: row.voucherNo ?? '',
      voucherType: row.voucherTypeName ?? row.journalType ?? '',
      kind: `${KIND_LABELS[row.kind]}${
        row.restatesOpening ? ' (restated, not counted)' : ''
      }`,
      itemName: row.itemName,
      itemCode: row.itemCode ?? '',
      godownName: row.godownName ?? `Godown #${row.godownId}`,
      batchNo: row.batchNo,
      serialNo: row.serialNo ?? '',
      inQuantity:
        row.kind === 'movement' && row.movementType === 'in'
          ? row.quantity.toFixed(row.noOfDecimalPlaces)
          : '',
      outQuantity:
        row.kind === 'movement' && row.movementType === 'out'
          ? row.quantity.toFixed(row.noOfDecimalPlaces)
          : '',
      balance: row.runningBalance.toFixed(row.noOfDecimalPlaces),
      unitCode: row.unitCode ?? '',
      rate: row.rate ? row.rate.toFixed(2) : '',
      value: row.amount ? row.amount.toFixed(2) : '',
      runningValue: row.runningValue ? row.runningValue.toFixed(2) : '',
      transfer: row.transfer
        ? (row.transferPeerGodownName ?? String(row.transferPeerGodownId ?? ''))
        : '',
      remarks: snapshot
        ? `Year-end snapshot of ${row.quantity.toFixed(row.noOfDecimalPlaces)}${
            row.remarks ? ` · ${row.remarks}` : ''
          }`
        : (row.remarks ?? ''),
    }
  })
}

/** CSV text for the lifeline: BOM + header + one line per movement line. */
export function buildLifelineCsv(lifeline: BatchLifeline): string {
  const rows = lifelineExportRows(lifeline)
  const headers = LIFELINE_EXPORT_COLUMNS.map((column) => column.header)
  const flat = rows.map((row) =>
    LIFELINE_EXPORT_COLUMNS.map(
      (column) => `"${String(row[column.accessor] ?? '').replace(/"/g, '""')}"`,
    ),
  )
  return '\uFEFF' + [headers.join(','), ...flat.map((row) => row.join(','))].join('\n')
}

export const lifelineFileName = (batchNo: string, extension: string) =>
  `batch-lifeline-${batchNo.replace(/[^a-z0-9._-]+/gi, '_')}.${extension}`
