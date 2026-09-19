import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { formatQty } from '@/utils/format-num'
import { IconSearch, IconTrendingUp } from '@tabler/icons-react'
import { useMemo, useState } from 'react'
import { formatAmount, formatCompactInr, formatDate } from './format'
import { batchSeverity, buildRanked } from './views'
import type { RankMetric } from './views'
import type { BatchBalance } from './data/schema'

const METRIC_OPTIONS: { value: RankMetric; label: string }[] = [
  { value: 'value', label: 'Closing value' },
  { value: 'quantity', label: 'Closing quantity' },
]

/** Rows painted at once — a 10k-row table would freeze the browser. */
const PAGE_OF_ROWS = 200

/**
 * Leaderboard of every matching batch — biggest first, with each batch's share
 * of the ranked total and the running (cumulative) share. The page feeds this
 * the whole filtered result set (balances only), so a rank never depends on
 * which page of the report happened to be loaded.
 */
export function BatchRanked({
  batches,
  onInspect,
}: {
  batches: BatchBalance[]
  onInspect: (batch: BatchBalance) => void
}) {
  const [metric, setMetric] = useState<RankMetric>('value')
  const [visible, setVisible] = useState(PAGE_OF_ROWS)

  const table = useMemo(() => buildRanked(batches, metric), [batches, metric])
  const metricLabel = metric === 'value' ? 'value' : 'quantity'
  const maxShare = table.rows.reduce(
    (max, row) => Math.max(max, row.share),
    0,
  )
  const shown = table.rows.slice(0, visible)

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2 px-1 print:hidden">
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <IconTrendingUp className="h-3.5 w-3.5" />
          {table.rows.length} batch{table.rows.length === 1 ? '' : 'es'} ranked
          by closing {metricLabel} · share of every matching batch (
          {metric === 'value'
            ? formatCompactInr(table.total)
            : formatQty(table.total, batches[0]?.noOfDecimalPlaces)}
          )
          {table.nilCount > 0 && ` · ${table.nilCount} nil`}
          {table.negativeCount > 0 && ` · ${table.negativeCount} negative`}
        </p>
        <Select
          value={metric}
          onValueChange={(value) => setMetric(value as RankMetric)}
        >
          <SelectTrigger className="h-8 w-[180px]" aria-label="Rank by">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {METRIC_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                Rank by {option.label.toLowerCase()}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card className="overflow-hidden">
        <div className="max-h-[70vh] overflow-auto print:max-h-none print:overflow-visible">
          <table className="w-full min-w-[860px] border-collapse text-sm">
            <thead className="sticky top-0 z-10 bg-card shadow-[0_1px_0_0_var(--color-border)]">
              <tr className="text-xs uppercase tracking-wide text-muted-foreground">
                <th scope="col" className="w-12 px-3 py-2 text-right font-medium">
                  #
                </th>
                <th scope="col" className="px-3 py-2 text-left font-medium">
                  Batch
                </th>
                <th scope="col" className="px-3 py-2 text-left font-medium">
                  Godown
                </th>
                <th scope="col" className="px-3 py-2 text-right font-medium">
                  Movements
                </th>
                <th scope="col" className="px-3 py-2 text-right font-medium">
                  Closing qty
                </th>
                <th scope="col" className="px-3 py-2 text-right font-medium">
                  Closing value
                </th>
                <th scope="col" className="px-3 py-2 text-left font-medium">
                  Share of page
                </th>
                <th scope="col" className="px-3 py-2 text-right font-medium">
                  Cumulative
                </th>
                <th className="w-10 px-2 py-2" />
              </tr>
            </thead>
            <tbody>
              {shown.map((row) => {
                const batch = row.batch
                const severity = batchSeverity(batch)
                // Bar width is relative to the largest share so the top batch
                // always fills the track, whatever the distribution is.
                const width =
                  maxShare > 0
                    ? Math.max(2, (row.share / maxShare) * 100)
                    : 0

                return (
                  <tr
                    key={`${batch.itemId}-${batch.godownId}-${batch.batchNo}`}
                    tabIndex={0}
                    onClick={() => onInspect(batch)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault()
                        onInspect(batch)
                      }
                    }}
                    className={cn(
                      'cursor-pointer border-b outline-none transition-colors last:border-0 hover:bg-muted/40 focus-visible:bg-muted/60',
                      severity === 'danger' && 'bg-destructive/[0.04]',
                      severity === 'warning' && 'bg-amber-500/[0.04]',
                    )}
                  >
                    <td className="px-3 py-1.5 text-right font-mono text-xs text-muted-foreground tabular-nums">
                      {row.rank}
                    </td>
                    <td className="max-w-[280px] px-3 py-1.5">
                      <div className="min-w-0">
                        <div className="truncate font-medium">
                          {batch.itemName}
                        </div>
                        <div className="truncate font-mono text-[11px] text-muted-foreground">
                          {batch.batchNo}
                          {batch.itemCode ? ` · ${batch.itemCode}` : ''}
                          {batch.expiryDate
                            ? ` · exp ${formatDate(batch.expiryDate)}`
                            : ''}
                        </div>
                      </div>
                    </td>
                    <td className="max-w-[160px] truncate px-3 py-1.5 text-muted-foreground">
                      {batch.godownName ?? `Godown #${batch.godownId}`}
                    </td>
                    <td className="px-3 py-1.5 text-right font-mono text-xs tabular-nums text-muted-foreground">
                      {batch.movementCount}
                    </td>
                    <td className="px-3 py-1.5 text-right font-mono tabular-nums">
                      <span
                        className={cn(
                          batch.closingQuantity < 0 && 'text-destructive',
                        )}
                      >
                        {formatQty(
                          batch.closingQuantity,
                          batch.noOfDecimalPlaces,
                          batch.unitCode,
                        )}
                      </span>
                    </td>
                    <td
                      className={cn(
                        'px-3 py-1.5 text-right font-mono tabular-nums font-semibold',
                        batch.closingValue < 0
                          ? 'text-destructive'
                          : 'text-primary',
                      )}
                    >
                      {formatAmount(batch.closingValue)}
                    </td>
                    <td className="px-3 py-1.5">
                      <div className="flex items-center gap-2">
                        <div
                          className="h-2 w-24 shrink-0 overflow-hidden rounded-full bg-muted"
                          role="presentation"
                        >
                          <div
                            className={cn(
                              'h-full rounded-full',
                              row.share < 0 ? 'bg-destructive/70' : 'bg-primary/70',
                            )}
                            style={{ width: `${width}%` }}
                          />
                        </div>
                        <span className="font-mono text-xs tabular-nums text-muted-foreground">
                          {(row.share * 100).toFixed(2)}%
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-1.5 text-right font-mono text-xs tabular-nums text-muted-foreground">
                      {(row.cumulativeShare * 100).toFixed(2)}%
                    </td>
                    <td className="px-2 py-1.5 text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        title="Inspect this batch"
                        aria-label={`Inspect batch ${batch.batchNo}`}
                        onClick={(event) => {
                          event.stopPropagation()
                          onInspect(batch)
                        }}
                      >
                        <IconSearch className="h-3.5 w-3.5" />
                      </Button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {table.rows.length > shown.length && (
        <div className="flex flex-wrap items-center justify-between gap-2 px-1 print:hidden">
          <p className="text-[11px] text-muted-foreground">
            Showing the top {shown.length} of {table.rows.length} ranked
            batches — ranks and shares already cover all of them.
          </p>
          <Button
            variant="outline"
            size="sm"
            className="h-8"
            onClick={() => setVisible((prev) => prev + PAGE_OF_ROWS)}
          >
            Show next {Math.min(PAGE_OF_ROWS, table.rows.length - shown.length)}
          </Button>
        </div>
      )}

      <p className="px-1 text-[11px] text-muted-foreground">
        Shares are of every batch matching the current filters, not just a
        loaded page. Negative shares come from negative closing values and still
        sum to the ranked total.
      </p>
    </div>
  )
}
