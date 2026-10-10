import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { formatQty } from '@/utils/format-num'
import { IconSearch, IconTags } from '@tabler/icons-react'
import { formatAmount, formatCompactInr } from './format'
import type { VoucherTypeContribution } from './views'
import type { BatchBalance } from './data/schema'

/**
 * Voucher-type-wise view: one block per voucher type with its contribution to
 * the in/out flow (the existing totals bar) and a table of the batches behind
 * it — Batch no and Godown repeated on every row, so the breakdown can be read
 * (and filtered) row by row instead of inferring the batch from a card header.
 * Clicking a row opens the batch's full movement trail in the inspector.
 */
export function BatchVoucherTypes({
  contributions,
  onInspect,
}: {
  contributions: VoucherTypeContribution[]
  onInspect: (batch: BatchBalance) => void
}) {
  if (contributions.length === 0) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-sm text-muted-foreground">
          No movement trail on this page — try the batch-wise view or widen the
          filters.
        </CardContent>
      </Card>
    )
  }

  const totalValue = contributions.reduce(
    (sum, contribution) =>
      sum + contribution.inwardValue + contribution.outwardValue,
    0,
  )

  return (
    <div className="space-y-4">
      <p className="px-1 text-xs text-muted-foreground">
        {contributions.length} voucher type
        {contributions.length === 1 ? '' : 's'} · {formatCompactInr(totalValue)}{' '}
        moved · each row is one batch's lines booked under that voucher type
      </p>

      {contributions.map((contribution) => (
        <div key={contribution.key} className="space-y-2">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 rounded-md border bg-muted/40 px-3 py-2">
            <div className="flex min-w-0 items-center gap-2 text-sm font-semibold">
              <IconTags className="h-4 w-4 shrink-0 text-primary" />
              <span className="break-words">{contribution.label}</span>
              <span className="text-xs font-normal text-muted-foreground">
                {contribution.movementCount} line(s) ·{' '}
                {contribution.batches.length} batch(es)
              </span>
            </div>
            <div className="ml-auto flex flex-wrap items-center gap-x-4 gap-y-0.5 font-mono text-xs tabular-nums">
              <span className="text-emerald-600">
                In{' '}
                <strong>
                  +{formatQty(contribution.inward, null, contribution.unit)}
                </strong>{' '}
                · {formatAmount(contribution.inwardValue)}
              </span>
              <span className="text-orange-600">
                Out{' '}
                <strong>
                  -{formatQty(contribution.outward, null, contribution.unit)}
                </strong>{' '}
                · {formatAmount(contribution.outwardValue)}
              </span>
            </div>
          </div>

          <Card className="overflow-hidden">
            <div className="overflow-x-auto print:overflow-visible">
              <table className="w-full min-w-[900px] border-collapse text-sm">
                <thead className="bg-card shadow-[0_1px_0_0_var(--color-border)]">
                  <tr className="text-xs uppercase tracking-wide text-muted-foreground">
                    <th scope="col" className="px-3 py-2 text-left font-medium">
                      Batch no
                    </th>
                    <th scope="col" className="px-3 py-2 text-left font-medium">
                      Godown
                    </th>
                    <th scope="col" className="px-3 py-2 text-left font-medium">
                      Item
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-2 text-right font-medium"
                    >
                      Lines
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-2 text-right font-medium"
                    >
                      In
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-2 text-right font-medium"
                    >
                      In value
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-2 text-right font-medium"
                    >
                      Out
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-2 text-right font-medium"
                    >
                      Out value
                    </th>
                    <th className="w-10 px-2 py-2" />
                  </tr>
                </thead>
                <tbody>
                  {contribution.rows.map((row) => (
                    <tr
                      key={row.key}
                      tabIndex={0}
                      onClick={() => onInspect(row.batch)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault()
                          onInspect(row.batch)
                        }
                      }}
                      className="cursor-pointer border-b outline-none transition-colors last:border-0 hover:bg-muted/40 focus-visible:bg-muted/60"
                    >
                      <td className="max-w-[180px] truncate px-3 py-1.5 font-mono text-xs font-medium">
                        {row.batchNo}
                      </td>
                      <td className="max-w-[180px] truncate px-3 py-1.5">
                        {row.godownName ?? `Godown #${row.godownId}`}
                      </td>
                      <td className="max-w-[260px] px-3 py-1.5">
                        <div className="min-w-0">
                          <div className="truncate font-medium">
                            {row.itemName}
                          </div>
                          {row.itemCode ? (
                            <div className="truncate font-mono text-[11px] text-muted-foreground">
                              {row.itemCode}
                            </div>
                          ) : null}
                        </div>
                      </td>
                      <td className="px-3 py-1.5 text-right font-mono text-xs tabular-nums text-muted-foreground">
                        {row.lineCount}
                      </td>
                      <td className="px-3 py-1.5 text-right font-mono tabular-nums whitespace-nowrap">
                        {row.inward > 0 ? (
                          <span className="text-emerald-600">
                            +
                            {formatQty(
                              row.inward,
                              row.batch.noOfDecimalPlaces,
                              row.batch.unitCode,
                            )}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-3 py-1.5 text-right font-mono tabular-nums whitespace-nowrap text-muted-foreground">
                        {row.inwardValue > 0
                          ? formatAmount(row.inwardValue)
                          : '—'}
                      </td>
                      <td className="px-3 py-1.5 text-right font-mono tabular-nums whitespace-nowrap">
                        {row.outward > 0 ? (
                          <span className="text-orange-600">
                            -
                            {formatQty(
                              row.outward,
                              row.batch.noOfDecimalPlaces,
                              row.batch.unitCode,
                            )}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-3 py-1.5 text-right font-mono tabular-nums whitespace-nowrap text-muted-foreground">
                        {row.outwardValue > 0
                          ? formatAmount(row.outwardValue)
                          : '—'}
                      </td>
                      <td className="px-2 py-1.5 text-right print:hidden">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          title="Inspect this batch"
                          aria-label={`Inspect batch ${row.batchNo}`}
                          onClick={(event) => {
                            event.stopPropagation()
                            onInspect(row.batch)
                          }}
                        >
                          <IconSearch className="h-3.5 w-3.5" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="border-t bg-muted/30">
                  <tr className="text-xs font-semibold">
                    <td className="px-3 py-2 text-left" colSpan={3}>
                      All batches · {contribution.label}
                    </td>
                    <td className="px-3 py-2 text-right font-mono tabular-nums text-muted-foreground">
                      {contribution.movementCount}
                    </td>
                    <td className="px-3 py-2 text-right font-mono tabular-nums whitespace-nowrap text-emerald-600">
                      {contribution.inward > 0
                        ? `+${formatQty(contribution.inward, null, contribution.unit)}`
                        : '—'}
                    </td>
                    <td className="px-3 py-2 text-right font-mono tabular-nums whitespace-nowrap">
                      {formatAmount(contribution.inwardValue)}
                    </td>
                    <td className="px-3 py-2 text-right font-mono tabular-nums whitespace-nowrap text-orange-600">
                      {contribution.outward > 0
                        ? `-${formatQty(contribution.outward, null, contribution.unit)}`
                        : '—'}
                    </td>
                    <td className="px-3 py-2 text-right font-mono tabular-nums whitespace-nowrap">
                      {formatAmount(contribution.outwardValue)}
                    </td>
                    <td className="px-2 py-2" />
                  </tr>
                </tfoot>
              </table>
            </div>
          </Card>
        </div>
      ))}
    </div>
  )
}
