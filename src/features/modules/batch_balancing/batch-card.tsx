import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { formatQty } from '@/utils/format-num'
import {
  IconAlertTriangle,
  IconBuildingWarehouse,
  IconChevronDown,
  IconChevronRight,
  IconCoins,
  IconPackage,
  IconSearch,
} from '@tabler/icons-react'
import { BatchMovementTable } from './batch-movement-table'
import { formatAmount, formatDate, formatDayCount } from './format'
import { ISSUE_META, batchSeverity, issuesOf } from './views'
import type { BatchBalance } from './data/schema'

const ISSUE_BADGE_CLASSES: Record<string, string> = {
  danger:
    'border-destructive/40 bg-destructive/10 text-destructive dark:text-red-400',
  warning:
    'border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400',
  neutral: 'border-border bg-muted/40 text-muted-foreground',
  success: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-600',
}

/**
 * One batch: header (item / godown / batch + O/I/O/C + value), the integrity
 * badges, and the expandable chronological movement trail.
 */
export function BatchCard({
  batch,
  expanded,
  onToggle,
  onInspect,
  openingAsOnDate,
}: {
  batch: BatchBalance
  expanded: boolean
  onToggle: () => void
  onInspect: () => void
  /** "Opening as on" date (yyyy-MM-dd) used to label the opening row. */
  openingAsOnDate?: string | null
}) {
  const dp = batch.noOfDecimalPlaces
  const issues = issuesOf(batch)
  const severity = batchSeverity(batch)
  const carryForwardOnly = batch.flags?.carryForwardOpening === true

  return (
    <Card
      className={cn(
        'overflow-hidden',
        severity === 'danger' && 'border-l-4 border-l-destructive',
        severity === 'warning' && 'border-l-4 border-l-amber-500',
      )}
    >
      {/* Summary row */}
      <div className="flex items-stretch">
        <button
          onClick={onToggle}
          aria-expanded={expanded}
          className="flex flex-1 flex-wrap items-center justify-between gap-3 p-4 text-left transition-colors hover:bg-muted/40"
        >
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            {expanded ? (
              <IconChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
            ) : (
              <IconChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
            )}
            <IconPackage className="h-4 w-4 shrink-0 text-emerald-500" />
            <span className="shrink-0 font-mono text-[11px] font-normal uppercase text-muted-foreground">
              Item:
            </span>
            <span className="min-w-0 break-words font-semibold">
              {batch.itemName}
            </span>
            {batch.itemCode && (
              <span className="shrink-0 font-mono text-xs font-normal text-muted-foreground">
                {batch.itemCode}
              </span>
            )}
            <span className="flex min-w-0 shrink-0 items-center gap-1 text-sm">
              <IconBuildingWarehouse className="h-3.5 w-3.5 text-blue-500" />
              <span className="font-mono text-[11px] font-normal uppercase text-muted-foreground">
                Godown:
              </span>
              <span className="break-words">
                {batch.godownName ?? `Godown #${batch.godownId}`}
              </span>
            </span>
            <Badge variant="outline" className="shrink-0 font-mono text-[11px]">
              BatchNo: {batch.batchNo}
            </Badge>
            {carryForwardOnly && (
              <Badge
                variant="outline"
                title={ISSUE_META.carryForwardOpening.detail}
                className={cn(
                  'shrink-0 gap-1 px-1.5 py-0 text-[11px]',
                  ISSUE_BADGE_CLASSES.warning,
                )}
              >
                <IconAlertTriangle className="h-3 w-3 shrink-0" />
                No opening voucher — carried from history
              </Badge>
            )}
            {issues
              .filter((code) => code !== 'carryForwardOpening')
              .map((code) => (
                <Badge
                  key={code}
                  variant="outline"
                  title={ISSUE_META[code].detail}
                  className={cn(
                    'shrink-0 gap-1 px-1.5 py-0 text-[11px]',
                    ISSUE_BADGE_CLASSES[ISSUE_META[code].tone],
                  )}
                >
                  {ISSUE_META[code].label}
                </Badge>
              ))}
            {batch.expiryDate && (
              <span
                className={cn(
                  'shrink-0 text-xs',
                  batch.expiryStatus === 'expired'
                    ? 'font-medium text-destructive'
                    : batch.expiryStatus === 'expiring'
                      ? 'text-amber-600 dark:text-amber-400'
                      : 'text-muted-foreground',
                )}
              >
                exp {formatDate(batch.expiryDate)}
                {batch.daysToExpiry != null
                  ? ` · ${formatDayCount(batch.daysToExpiry)}`
                  : ''}
              </span>
            )}
            <span className="shrink-0 text-xs text-muted-foreground">
              {batch.movementCount} movement
              {batch.movementCount === 1 ? '' : 's'}
              {batch.lastMovementDate
                ? ` · last ${formatDate(batch.lastMovementDate)}`
                : ''}
            </span>
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-x-5 gap-y-1 text-sm">
            <MiniStat
              label="Open"
              value={batch.openingQuantity}
              dp={dp}
              unit={batch.unitCode}
            />
            <MiniStat
              label="In"
              value={batch.inwardQuantity}
              dp={dp}
              unit={batch.unitCode}
              className="text-emerald-600"
            />
            <MiniStat
              label="Out"
              value={batch.outwardQuantity}
              dp={dp}
              unit={batch.unitCode}
              className="text-orange-600"
            />
            <MiniStat
              label="Close"
              value={batch.closingQuantity}
              dp={dp}
              unit={batch.unitCode}
              className={cn(
                'font-semibold text-primary',
                batch.closingQuantity < 0 && 'text-destructive',
              )}
            />
            <div className="text-right">
              <div className="flex items-center justify-end gap-1 text-xs text-muted-foreground">
                <IconCoins className="h-3 w-3" />
                Value
              </div>
              <div
                className={cn(
                  'font-mono tabular-nums',
                  batch.closingValue < 0 && 'text-destructive',
                )}
              >
                {formatAmount(batch.closingValue)}
              </div>
            </div>
          </div>
        </button>
        <div className="flex items-center pr-3">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            title="Inspect this batch"
            aria-label={`Inspect batch ${batch.batchNo}`}
            onClick={onInspect}
          >
            <IconSearch className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Movement trail */}
      {expanded && (
        <div className="border-t">
          <BatchMovementTable batch={batch} openingAsOnDate={openingAsOnDate} />
        </div>
      )}
    </Card>
  )
}

function MiniStat({
  label,
  value,
  dp,
  unit,
  className,
}: {
  label: string
  value: number
  dp: number
  unit: string | null
  className?: string
}) {
  return (
    <div className={cn('text-right', className)}>
      <span className="mr-1 text-xs text-muted-foreground">{label}</span>
      <span className="font-mono tabular-nums">
        {formatQty(value, dp, unit)}
      </span>
    </div>
  )
}
