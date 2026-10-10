import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { formatQty } from '@/utils/format-num'
import { formatAmount, formatDate } from '@/features/modules/batch_balancing/format'
import { IconArrowRight, IconCalendarStats, IconHistory } from '@tabler/icons-react'
import type { LifelineRow, LifelineYear } from './data/schema'

const KIND_META: Record<
  LifelineRow['kind'],
  { label: string; className: string }
> = {
  movement: { label: 'Movement', className: 'border-border bg-muted/40' },
  opening: {
    label: 'Opening journal',
    className: 'border-primary/40 bg-primary/[0.08] text-primary',
  },
  closing: {
    label: 'Year-end snapshot',
    className: 'border-border bg-muted/40 text-muted-foreground',
  },
}

/**
 * The lifeline itself: every line ever booked against a batch number, oldest
 * first, with the fiscal year it belongs to marked inline (year divider with
 * that year's opening / in / out / closing numbers) and a running balance per
 * item+godown bucket.
 */
export function LifelineTimeline({
  rows,
  years,
  showItem = false,
  compact = false,
  asOnDate = null,
  seedRowCount = 0,
}: {
  rows: LifelineRow[]
  years: LifelineYear[]
  /**
   * Item column — needed once a batch number spans several item/godown
   * buckets. The batch no and godown columns are always shown, because every
   * line of a lifeline is identified by the batch it belongs to.
   */
  showItem?: boolean
  /** Drops the serial / remarks columns for the inspector's narrow panel. */
  compact?: boolean
  asOnDate?: string | null
  /** Lines replayed from before the window to seed the running balance. */
  seedRowCount?: number
}) {
  if (rows.length === 0) {
    return (
      <div className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
        <IconHistory className="h-4 w-4" />
        No lines recorded against this batch number.
      </div>
    )
  }

  const yearByKey = new Map(years.map((year) => [year.key, year]))
  const seenYears = new Set<string>()

  return (
    <div className="overflow-x-auto">
      <table
        className={cn(
          'w-full text-sm',
          compact ? 'min-w-[880px]' : 'min-w-[1080px]',
        )}
      >
        <thead>
          <tr className="border-b bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
            {/* Batch no + godown repeat on every row (as in the movement trail
                and the exports), so the timeline stays self-describing on
                paper and when filtered in a spreadsheet. */}
            <th className="px-4 py-2 text-left font-medium">Batch no</th>
            <th className="px-3 py-2 text-left font-medium">Godown</th>
            <th className="px-4 py-2 text-left font-medium">Date</th>
            <th className="px-3 py-2 text-left font-medium">Voucher</th>
            <th className="px-3 py-2 text-left font-medium">Type</th>
            {showItem && (
              <th className="px-3 py-2 text-left font-medium">Item</th>
            )}
            {!compact && (
              <th className="px-3 py-2 text-left font-medium">Serial</th>
            )}
            <th className="px-3 py-2 text-right font-medium">In</th>
            <th className="px-3 py-2 text-right font-medium">Out</th>
            <th className="px-3 py-2 text-right font-medium">Balance</th>
            <th className="px-3 py-2 text-right font-medium">Rate</th>
            <th className="px-3 py-2 text-right font-medium">Value</th>
            {!compact && (
              <th className="px-4 py-2 text-left font-medium">Remarks</th>
            )}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const nodes: React.ReactNode[] = []
            const year = yearByKey.get(row.yearKey)

            if (!seenYears.has(row.yearKey)) {
              seenYears.add(row.yearKey)
              nodes.push(
                <YearMarker
                  key={`year-${row.yearKey}`}
                  year={year}
                  fallbackKey={row.yearKey}
                  showSeedNote={
                    seedRowCount > 0 && seenYears.size === 1 ? seedRowCount : 0
                  }
                  // Batch no + godown + date/voucher/type = 5 leading columns,
                  // + item, + serial & remarks when not compact, + the 5 value
                  // columns.
                  columns={10 + (showItem ? 1 : 0) + (compact ? 0 : 2)}
                  asOnDate={asOnDate}
                />,
              )
            }

            nodes.push(
              <LifelineLine
                key={row.key}
                row={row}
                showItem={showItem}
                compact={compact}
              />,
            )

            return nodes
          })}
        </tbody>
      </table>
    </div>
  )
}

function YearMarker({
  year,
  fallbackKey,
  showSeedNote,
  columns,
  asOnDate,
}: {
  year: LifelineYear | undefined
  fallbackKey: string
  showSeedNote: number
  columns: number
  asOnDate: string | null
}) {
  const name =
    year?.name ?? (fallbackKey === 'none' ? 'No fiscal year' : `FY #${fallbackKey}`)
  const range =
    year?.startDate && year.endDate
      ? `${formatDate(year.startDate)} → ${formatDate(year.endDate)}`
      : null

  return (
    <tr className="border-y bg-muted/70">
      <td colSpan={columns} className="px-4 py-2">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
          <span className="flex items-center gap-1.5 font-semibold">
            <IconCalendarStats className="h-3.5 w-3.5 text-primary" />
            {name}
          </span>
          {range && (
            <span className="text-muted-foreground">{range}</span>
          )}
          <span className="font-mono tabular-nums text-muted-foreground">
            {year?.rowCount ?? 0} line(s)
          </span>
          {year && !year.hasMixedUnits && (
            <span className="font-mono tabular-nums">
              <span className="text-muted-foreground">Open </span>
              {formatAmount(year.carriedIn)}
              <span className="text-muted-foreground"> · In </span>
              <span className="text-emerald-600">+{formatAmount(year.inQuantity)}</span>
              <span className="text-muted-foreground"> · Out </span>
              <span className="text-orange-600">-{formatAmount(year.outQuantity)}</span>
              <span className="text-muted-foreground"> · Close </span>
              {formatAmount(year.carriedOut)}
            </span>
          )}
          {year?.hasMixedUnits && (
            <span className="text-muted-foreground">
              quantities span several units — see the item split in the year
              summary
            </span>
          )}
          <span className="font-mono tabular-nums text-muted-foreground">
            Value in {formatAmount(year?.inValue ?? 0)} · out{' '}
            {formatAmount(year?.outValue ?? 0)}
          </span>
          {year?.openingRestated && (
            <Badge
              variant="outline"
              className="border-amber-500/40 bg-amber-500/10 px-1.5 py-0 text-[10px] text-amber-600 dark:text-amber-400"
              title="This year's opening journal restates the balance carried in from earlier years — it is shown for context and not counted into the running balance again."
            >
              Opening restated
            </Badge>
          )}
          {showSeedNote > 0 && (
            <Badge
              variant="outline"
              className="px-1.5 py-0 text-[10px]"
              title={`${showSeedNote} earlier line(s) were replayed to carry the balance into this window.`}
            >
              {showSeedNote} earlier line(s) carried in
            </Badge>
          )}
          {asOnDate && (
            <span className="ml-auto text-[10px] text-muted-foreground">
              ageing as on {formatDate(asOnDate)}
            </span>
          )}
        </div>
      </td>
    </tr>
  )
}

function LifelineLine({
  row,
  showItem,
  compact,
}: {
  row: LifelineRow
  showItem: boolean
  compact: boolean
}) {
  const dp = row.noOfDecimalPlaces
  const kind = KIND_META[row.kind]
  const isIn = row.movementType === 'in'
  const snapshot = row.kind === 'closing'
  const godownLabel = row.godownName ?? `Godown #${row.godownId}`

  return (
    <tr
      className={cn(
        'border-b last:border-0',
        row.kind === 'opening' && 'bg-primary/[0.03]',
        snapshot && 'bg-muted/20 text-muted-foreground',
        !row.applied && 'opacity-90',
      )}
    >
      <td className="whitespace-nowrap px-4 py-2 font-mono text-xs font-medium">
        {row.batchNo}
      </td>
      <td className="max-w-[180px] truncate px-3 py-2 text-muted-foreground whitespace-nowrap">
        {godownLabel}
      </td>
      <td className="whitespace-nowrap px-4 py-2">
        {row.voucherDate ? formatDate(row.voucherDate) : '—'}
      </td>
      <td className="whitespace-nowrap px-3 py-2 font-mono text-xs font-medium">
        {row.voucherNo ?? '—'}
      </td>
      <td className="px-3 py-2">
        <div className="flex flex-wrap items-center gap-1">
          <Badge variant="outline" className="px-1.5 py-0 text-[10px]">
            {row.voucherTypeName ?? row.journalType ?? 'Voucher'}
          </Badge>
          {row.kind !== 'movement' && (
            <Badge
              variant="outline"
              className={cn('px-1.5 py-0 text-[10px]', kind.className)}
              title={
                snapshot
                  ? 'Year-end CLOSING snapshot: context only, it does not move the balance.'
                  : row.restatesOpening
                    ? 'Restates the balance carried in — not counted into the running balance again.'
                    : 'Opening journal line — the balance the year starts from.'
              }
            >
              {kind.label}
              {row.restatesOpening ? ' · restated' : ''}
            </Badge>
          )}
          {row.transfer && (
            <Badge
              variant="outline"
              className="gap-1 border-blue-500/40 bg-blue-500/10 px-1.5 py-0 text-[10px] text-blue-600 dark:text-blue-400"
              title="Same voucher also moved this batch in another godown."
            >
              Transfer
              <IconArrowRight className="h-2.5 w-2.5" />
              {row.transferPeerGodownName ?? `#${row.transferPeerGodownId}`}
            </Badge>
          )}
        </div>
      </td>
      {showItem && (
        <td className="max-w-[200px] truncate px-3 py-2">{row.itemName}</td>
      )}
      {!compact && (
        <td className="px-3 py-2 font-mono text-xs text-muted-foreground">
          {row.serialNo ?? '—'}
        </td>
      )}
      <td className="whitespace-nowrap px-3 py-2 text-right font-mono tabular-nums text-emerald-600">
        {row.kind === 'movement' && isIn
          ? `+${formatQty(row.quantity, dp, row.unitCode)}`
          : '—'}
      </td>
      <td className="whitespace-nowrap px-3 py-2 text-right font-mono tabular-nums text-orange-600">
        {row.kind === 'movement' && !isIn
          ? `-${formatQty(row.quantity, dp, row.unitCode)}`
          : '—'}
      </td>
      <td
        className={cn(
          'whitespace-nowrap px-3 py-2 text-right font-mono tabular-nums font-semibold',
          row.runningBalance < 0 && 'text-destructive',
        )}
      >
        {formatQty(row.runningBalance, dp, row.unitCode)}
      </td>
      <td className="whitespace-nowrap px-3 py-2 text-right font-mono tabular-nums text-muted-foreground">
        {row.rate > 0 ? formatAmount(row.rate) : '—'}
      </td>
      <td className="whitespace-nowrap px-3 py-2 text-right font-mono tabular-nums text-muted-foreground">
        {row.amount ? formatAmount(row.amount) : '—'}
      </td>
      {!compact && (
        <td className="max-w-[220px] truncate px-4 py-2 text-muted-foreground">
          {snapshot
            ? `Year-end snapshot of ${formatQty(row.quantity, dp, row.unitCode)}${
                row.remarks ? ` · ${row.remarks}` : ''
              }`
            : (row.remarks ?? '—')}
        </td>
      )}
    </tr>
  )
}
