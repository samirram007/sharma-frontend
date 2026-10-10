import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { formatQty } from '@/utils/format-num'
import { IconHistory, IconRefresh } from '@tabler/icons-react'
import { useQuery } from '@tanstack/react-query'
import { formatDate } from './format'
import { LifelineTimeline } from '@/features/modules/batch_lifeline/lifeline-timeline'
import { batchLifelineQueryOptions } from '@/features/modules/batch_lifeline/data/queryOptions'
import type { BatchBalance } from './data/schema'
import type { BatchLifeline } from '@/features/modules/batch_lifeline/data/schema'

/**
 * The Lifeline tab: fetches the *whole* history of the batch number (across
 * items and fiscal years) only while the tab is visible, because the balancing
 * report itself deliberately windows its trail to the reporting period.
 */
export function BatchLifelinePanel({
  batch,
  enabled,
}: {
  batch: BatchBalance | null
  enabled: boolean
}) {
  const { data, isLoading, isError, refetch } = useQuery({
    ...batchLifelineQueryOptions({
      batchNo: batch?.batchNo ?? '',
      limit: 500,
    }),
    enabled: enabled && !!batch?.batchNo,
  })

  const lifeline = data?.data as BatchLifeline | undefined

  if (!batch) return null

  if (isLoading) {
    return (
      <div className="space-y-2 p-5">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="p-5 text-center text-sm">
        <p className="text-destructive">
          Failed to load the history for batch {batch.batchNo}.
        </p>
        <Button
          variant="outline"
          size="sm"
          className="mt-3"
          onClick={() => refetch()}
        >
          <IconRefresh className="mr-1.5 h-3.5 w-3.5" />
          Retry
        </Button>
      </div>
    )
  }

  if (!lifeline || lifeline.rows.length === 0) {
    return (
      <div className="flex items-center justify-center gap-2 p-8 text-sm text-muted-foreground">
        <IconHistory className="h-4 w-4" />
        No earlier lines recorded against {batch.batchNo}.
      </div>
    )
  }

  const multipleBuckets = lifeline.buckets.length > 1
  const otherItems = lifeline.buckets.filter(
    (bucket) => bucket.itemId !== batch.itemId,
  )

  return (
    <div className="space-y-3 p-5">
      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <Badge variant="outline" className="font-mono text-[11px]">
          BatchNo: {lifeline.batchNo}
        </Badge>
        <span>
          {lifeline.totals.rowCount} line(s) since{' '}
          {lifeline.totals.firstDate
            ? formatDate(lifeline.totals.firstDate)
            : '—'}
          {lifeline.totals.lastDate
            ? ` → ${formatDate(lifeline.totals.lastDate)}`
            : ''}
        </span>
        {multipleBuckets && (
          <span className="text-amber-600 dark:text-amber-400">
            shared by {lifeline.buckets.length} item/godown bucket(s)
          </span>
        )}
      </div>

      {otherItems.length > 0 && (
        <p className="rounded-md border border-amber-500/40 bg-amber-500/[0.06] px-3 py-2 text-[11px] text-amber-700 dark:text-amber-400">
          This batch number is also used by {otherItems.length} other item(s) —
          their lines are listed too, each with its own unit and running
          balance.
        </p>
      )}

      {lifeline.meta.truncated && (
        <p className="rounded-md border border-amber-500/40 bg-amber-500/[0.06] px-3 py-2 text-[11px] text-amber-700 dark:text-amber-400">
          Showing the first {lifeline.meta.limit} line(s) — open the Batch
          Lifeline report for the full history.
        </p>
      )}

      <p className="text-[11px] text-muted-foreground">
        Closing balance on this page:{' '}
        <span className="font-mono tabular-nums text-foreground">
          {formatQty(
            lifeline.totals.closingQuantity,
            lifeline.buckets[0]?.noOfDecimalPlaces ?? 2,
          )}
        </span>{' '}
        across {lifeline.buckets.length} bucket(s)
      </p>

      <div className="rounded-md border">
        <LifelineTimeline
          rows={lifeline.rows}
          years={lifeline.years}
          showItem={multipleBuckets}
          compact
          asOnDate={lifeline.asOnDate}
          seedRowCount={lifeline.meta.seedRowCount}
        />
      </div>
    </div>
  )
}
