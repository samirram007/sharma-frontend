import { Skeleton } from '@/components/ui/skeleton'

function SkeletonAvatar() {
  return (
    <div className="flex w-fit items-center gap-4">
      <Skeleton className="size-10 shrink-0 rounded-full" />
      <div className="grid gap-2">
        <Skeleton className="h-4 w-[150px]" />
        <Skeleton className="h-4 w-[100px]" />
      </div>
    </div>
  )
}

import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export function SkeletonCard() {
  return (
    <Card className="w-full max-w-xs">
      <CardHeader>
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-4 w-1/2" />
      </CardHeader>
      <CardContent>
        <Skeleton className="aspect-video w-full" />
      </CardContent>
    </Card>
  )
}

function SkeletonText() {
  return (
    <div className="flex w-full max-w-xs flex-col gap-2">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
    </div>
  )
}

export function SkeletonButton() {
  return <Skeleton className="h-8 w-16" />
}

/**
 * Page-header skeleton: title, subtitle and an action button — mirrors the
 * standard protected-page header card so the full-page skeleton reads as the
 * real page while loading.
 */
function SkeletonPageHeader({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'mb-3 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card/80 px-4 py-3 shadow-sm backdrop-blur-sm sm:px-5',
        className,
      )}
    >
      <div className="space-y-2">
        <Skeleton className="h-6 w-36 sm:w-40" />
        <Skeleton className="h-3.5 w-56 max-w-full sm:w-72" />
      </div>
      <div className="flex items-center gap-2">
        <Skeleton className="h-8 w-28 rounded-lg" />
      </div>
    </div>
  )
}

/**
 * Full-page loading skeleton: page header card + table card, matching the
 * standard protected-page layout. Use as route pendingComponent / Suspense
 * fallback so navigation loads look like the real page.
 */
export function FullPageSkeleton({
  className,
  colCount,
  rowCount,
}: {
  className?: string
  colCount?: number
  rowCount?: number
}) {
  return (
    <div className={cn('flex min-h-svh w-full flex-col', className)}>
      <SkeletonPageHeader />
      <div className="min-h-0 flex-1 rounded-xl border border-border bg-card p-4 shadow-xs">
        <SkeletonTable colCount={colCount} rowCount={rowCount} />
      </div>
    </div>
  )
}

function SkeletonForm() {
  return (
    <div className="flex w-full max-w-xs flex-col gap-7">
      <div className="flex flex-col gap-3">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-8 w-full" />
      </div>
      <div className="flex flex-col gap-3">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-full" />
      </div>
      <Skeleton className="h-8 w-24" />
    </div>
  )
}

function SkeletonTable({
  className,
  colCount,
  rowCount,
}: {
  className?: string
  colCount?: number
  rowCount?: number
}) {
  const cols = Math.max(colCount || 6, 2)
  const rows = Math.max(rowCount || 6, 1)

  // Deterministic pseudo-random bar width (%) per cell so the skeleton reads
  // like real uneven data instead of identical blocks.
  const barWidth = (row: number, col: number) =>
    45 + ((row * 7 + col * 13) % 45)

  // The last column mimics the real grids' actions column — a distinct,
  // consistently wider block.
  const actionWidth = (row: number) => 70 + ((row * 11) % 25)

  // Tiny skeletons (e.g. freight_receipt's 2-row placeholder) don't need the
  // full toolbar + footer chrome — keep those light.
  const showChrome = rows >= 3

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      {/* ── Toolbar: search + filter pills + export/columns buttons ── */}
      {showChrome && (
        <div className="flex flex-wrap items-center justify-between gap-3 px-2 pt-1">
          <div className="flex items-center gap-3">
            <Skeleton className="h-8 w-[200px]" />
            <Skeleton className="h-8 w-[150px] rounded-lg" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-16 rounded-lg" />
            <Skeleton className="h-8 w-16 rounded-lg" />
            <Skeleton className="h-8 w-[92px] rounded-lg" />
          </div>
        </div>
      )}

      {/* ── Table ── */}
      <div className="overflow-hidden rounded-lg border border-border">
        {/* Header row */}
        <div className="flex items-center border-b border-border bg-muted/50 px-3">
          {Array.from({ length: cols }).map((_, col) => (
            <div className="min-w-0 flex-1 px-2 py-3" key={col}>
              <Skeleton className="h-3 w-2/3" />
            </div>
          ))}
        </div>

        {/* Body rows (zebra-striped like the real grid) */}
        {Array.from({ length: rows }).map((_row, row) => (
          <div
            key={row}
            className={cn(
              'flex items-center border-b border-border/60 px-3',
              row % 2 === 0 ? 'bg-background' : 'bg-muted/20',
            )}
          >
            {Array.from({ length: cols }).map((_col, col) => (
              <div className="min-w-0 flex-1 px-2 py-3" key={col}>
                <Skeleton
                  className="h-3.5"
                  style={{
                    width:
                      col === cols - 1
                        ? `${actionWidth(row)}%`
                        : `${barWidth(row, col)}%`,
                  }}
                />
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* ── Footer: totals + pagination ── */}
      {showChrome && (
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-border bg-muted/40 px-5 py-3 dark:bg-muted/30">
          <div className="flex items-center gap-6">
            <Skeleton className="h-3.5 w-24" />
            <Skeleton className="h-3.5 w-28" />
            <Skeleton className="h-3.5 w-28" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-7 w-7 rounded-md" />
            <Skeleton className="h-7 w-24 rounded-md" />
            <Skeleton className="h-7 w-7 rounded-md" />
          </div>
        </div>
      )}
    </div>
  )
}

export { SkeletonAvatar, SkeletonText, SkeletonForm, SkeletonTable }
