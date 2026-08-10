'use client'

import { cn } from '@/lib/utils'
import {
  buildVarianceLines,
  computeCountTotals,
  type VarianceLine,
} from '../utils/count-math'

import type { PhysicalStockCountItem } from '../../data/schema'

type VarianceSummaryTableProps = {
  items: Array<PhysicalStockCountItem | null | undefined>
}

/**
 * The variance summary table — every count row where book ≠ physical, showing
 * the item, batch/serial, book vs physical quantity, the difference with its
 * Loss → OUT / Surplus → IN nature, and the variance value.
 *
 * Shared by the adjustment confirmation dialog and the count sheet after the
 * SKADJ adjustment has been generated.
 */
const VarianceSummaryTable = ({ items }: VarianceSummaryTableProps) => {
  const lines = buildVarianceLines(items)
  const totals = computeCountTotals(lines.map((l) => l.item))
  const totalValue = lines.reduce((sum, l) => sum + l.amount, 0)

  return (
    <div className="overflow-x-auto rounded-md border">
      {lines.length > 0 ? (
        <table className="w-full min-w-[560px] border-collapse text-sm">
          <thead>
            <tr className="sticky top-0 border-b bg-muted/80 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <th className="p-2">Item</th>
              <th className="p-2">Batch</th>
              <th className="p-2">Serial</th>
              <th className="p-2 text-right">Book</th>
              <th className="p-2 text-right">Physical</th>
              <th className="p-2 text-right">Diff</th>
              <th className="p-2 text-right">Rate</th>
              <th className="p-2 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {lines.map((line, idx) => (
              <VarianceRow key={idx} line={line} />
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-primary/30 bg-primary/[0.04] font-semibold">
              <td className="p-2" colSpan={3}>
                TOTAL
              </td>
              <td className="p-2 text-right">{totals.book.toFixed(2)}</td>
              <td className="p-2 text-right">{totals.physical.toFixed(2)}</td>
              <td className="p-2 text-right">
                <div className="text-emerald-600">
                  Surplus {totals.surplus.toFixed(2)}
                </div>
                <div className="text-red-600">Loss {totals.loss.toFixed(2)}</div>
              </td>
              <td className="p-2" colSpan={1}></td>
              <td className="p-2 text-right tabular-nums">
                {totalValue.toLocaleString('en-IN', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </td>
            </tr>
          </tfoot>
        </table>
      ) : (
        <div className="bg-muted/30 p-6 text-center text-sm text-muted-foreground">
          Book and physical quantities match for every item.
        </div>
      )}
    </div>
  )
}

export default VarianceSummaryTable

const VarianceRow = ({ line }: { line: VarianceLine }) => {
  return (
    <tr className="border-t align-top">
      <td className="p-2">
        <div className="font-medium">
          {line.item?.stock_item?.name ?? `Item #${line.item?.stock_item_id ?? ''}`}
        </div>
        {line.item?.stock_item?.code && (
          <div className="text-xs text-muted-foreground">
            {line.item.stock_item.code}
          </div>
        )}
      </td>
      <td className="p-2">
        {line.item?.batch_no || '—'}
        {line.item?.expiry_date && (
          <div className="text-xs text-muted-foreground">
            exp {new Date(line.item.expiry_date).toLocaleDateString('en-IN')}
          </div>
        )}
      </td>
      <td className="p-2">{line.item?.serial_no || '—'}</td>
      <td className="p-2 text-right tabular-nums">{line.book.toFixed(2)}</td>
      <td className="p-2 text-right tabular-nums">{line.physical.toFixed(2)}</td>
      <td className="p-2 text-right">
        <div
          className={cn(
            'font-semibold tabular-nums',
            line.diff > 0 ? 'text-red-600' : 'text-emerald-600',
          )}
        >
          {line.diff.toFixed(2)}
        </div>
        <span
          className={cn(
            'text-[10px] font-semibold uppercase tracking-wide',
            line.diff > 0 ? 'text-red-600' : 'text-emerald-600',
          )}
        >
          {line.diff > 0 ? 'Loss → OUT' : 'Surplus → IN'}
        </span>
      </td>
      <td className="p-2 text-right tabular-nums">{line.rate.toFixed(2)}</td>
      <td className="p-2 text-right tabular-nums">
        {line.amount.toLocaleString('en-IN', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}
      </td>
    </tr>
  )
}
