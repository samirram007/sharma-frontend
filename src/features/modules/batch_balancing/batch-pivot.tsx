import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { formatQty } from '@/utils/format-num'
import { IconTable } from '@tabler/icons-react'
import { useMemo } from 'react'
import { formatAmount, formatCompactInr } from './format'
import { buildPivot, isZeroQuantity } from './views'
import type { PivotCell } from './views'
import type { BatchBalance } from './data/schema'

/**
 * Item × godown pivot of the closing balances, built from **every** matching
 * batch (the page hands this the whole filtered result set, balances only).
 * Rows are items (so a row's quantities share one unit), columns are godowns,
 * and every cell opens the largest batch behind it in the inspector. Quantity
 * totals are only shown per row / cell — the column and grand totals add money,
 * never mixed units.
 */
export function BatchPivot({
  batches,
  onInspect,
}: {
  batches: BatchBalance[]
  onInspect: (batch: BatchBalance) => void
}) {
  const table = useMemo(() => buildPivot(batches), [batches])

  if (table.columns.length === 0) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-sm text-muted-foreground">
          Nothing to pivot — no batches match the current filters.
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2 px-1 print:hidden">
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <IconTable className="h-3.5 w-3.5" />
          {table.rows.length} item{table.rows.length === 1 ? '' : 's'} ×{' '}
          {table.columns.length} godown
          {table.columns.length === 1 ? '' : 's'} · {table.batchCount} batch
          {table.batchCount === 1 ? '' : 'es'} · closing value{' '}
          {formatCompactInr(table.totalValue)}
        </p>
        <p className="text-[11px] text-muted-foreground">
          Column totals add value only — quantities would mix units.
        </p>
      </div>

      <Card className="overflow-hidden">
        <div className="max-h-[70vh] overflow-auto print:max-h-none print:overflow-visible">
          <table className="w-full min-w-[760px] border-collapse text-sm">
            <thead className="sticky top-0 z-10 bg-card shadow-[0_1px_0_0_var(--color-border)]">
              <tr className="align-bottom text-xs uppercase tracking-wide text-muted-foreground">
                <th
                  scope="col"
                  className="sticky left-0 z-20 min-w-[220px] bg-card px-3 py-2 text-left font-medium"
                >
                  Item
                </th>
                {table.columns.map((column, index) => (
                  <th
                    key={column.godownId}
                    scope="col"
                    className="min-w-[150px] px-3 py-2 text-right font-medium"
                  >
                    <div className="normal-case text-foreground">
                      {column.label}
                    </div>
                    <div className="text-[10px] font-normal">
                      {column.code ? `${column.code} · ` : ''}
                      {table.columnBatchCounts[index]} batch
                      {table.columnBatchCounts[index] === 1 ? '' : 'es'}
                    </div>
                  </th>
                ))}
                <th
                  scope="col"
                  className="min-w-[140px] px-3 py-2 text-right font-medium"
                >
                  <div className="normal-case text-foreground">Item total</div>
                  <div className="text-[10px] font-normal">value</div>
                </th>
              </tr>
            </thead>
            <tbody>
              {table.rows.map((row) => (
                <tr
                  key={row.itemId}
                  className="border-b transition-colors last:border-0 hover:bg-muted/40"
                >
                  <th
                    scope="row"
                    className="sticky left-0 z-10 max-w-[280px] bg-card px-3 py-2 text-left align-top font-normal"
                  >
                    <div className="truncate font-medium">{row.itemName}</div>
                    <div className="truncate font-mono text-[11px] text-muted-foreground">
                      {row.itemCode ? `${row.itemCode} · ` : ''}
                      {row.batchCount} batch{row.batchCount === 1 ? '' : 'es'}
                      {row.unitCode ? ` · ${row.unitCode}` : ''}
                    </div>
                  </th>

                  {row.cells.map((cell, index) => (
                    <td
                      key={table.columns[index].godownId}
                      className="px-3 py-2 text-right align-top tabular-nums"
                    >
                      {cell ? (
                        <PivotCellButton
                          cell={cell}
                          decimals={row.noOfDecimalPlaces}
                          unit={row.unitCode}
                          onInspect={onInspect}
                        />
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                  ))}

                  <td className="px-3 py-2 text-right align-top font-mono tabular-nums">
                    <div
                      className={cn(
                        'font-semibold',
                        row.value < 0 ? 'text-destructive' : 'text-primary',
                      )}
                    >
                      {formatAmount(row.value)}
                    </div>
                    <div className="text-[11px] text-muted-foreground">
                      {formatQty(row.quantity, row.noOfDecimalPlaces, row.unitCode)}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="border-t bg-muted/40">
              <tr className="text-sm font-semibold">
                <th
                  scope="row"
                  className="sticky left-0 z-10 bg-muted/40 px-3 py-2 text-left"
                >
                  All godowns
                </th>
                {table.columnValues.map((value, index) => (
                  <td
                    key={table.columns[index].godownId}
                    className={cn(
                      'px-3 py-2 text-right font-mono tabular-nums',
                      value < 0 && 'text-destructive',
                    )}
                  >
                    {formatAmount(value)}
                  </td>
                ))}
                <td
                  className={cn(
                    'px-3 py-2 text-right font-mono tabular-nums',
                    table.totalValue < 0 ? 'text-destructive' : 'text-primary',
                  )}
                >
                  {formatAmount(table.totalValue)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </Card>
    </div>
  )
}

function PivotCellButton({
  cell,
  decimals,
  unit,
  onInspect,
}: {
  cell: PivotCell
  decimals: number
  unit: string | null
  onInspect: (batch: BatchBalance) => void
}) {
  const nil = isZeroQuantity(cell.quantity, decimals) && cell.value === 0

  return (
    <button
      type="button"
      title={`${cell.batchNos.join(', ')} — inspect ${
        cell.batchCount > 1 ? 'largest batch' : 'batch'
      }`}
      aria-label={`Inspect ${cell.primary.itemName} batch ${cell.primary.batchNo}`}
      onClick={() => onInspect(cell.primary)}
      className={cn(
        'group ml-auto block rounded px-1 py-0.5 text-right transition-colors hover:bg-muted',
        nil && 'opacity-60',
      )}
    >
      <div
        className={cn(
          'font-mono tabular-nums',
          cell.quantity < 0 ? 'text-destructive' : 'text-foreground',
        )}
      >
        {formatQty(cell.quantity, decimals, unit)}
        {cell.batchCount > 1 && (
          <span className="ml-1 text-[10px] text-muted-foreground">
            ×{cell.batchCount}
          </span>
        )}
      </div>
      <div className="font-mono text-[11px] tabular-nums text-muted-foreground">
        {formatAmount(cell.value)}
      </div>
    </button>
  )
}
