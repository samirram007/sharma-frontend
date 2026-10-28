import { IconLock, IconLockOpen } from '@tabler/icons-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useFreight } from '../contexts/freight-context'
import {
  deliveryLockMoment,
  deliveryLockReasonLabel,
} from '../../shared/delivery-lock'
import { useDeliveryLockPermissions } from '../../shared/delivery-lock-permissions'
import { cn } from '@/lib/utils'
import type { VoucherSchema } from '../../data-schema/voucher-schema'
import type { CellContext } from '@tanstack/react-table'

/**
 * Status column of the Freight grid: shows the postponed (locked) badge with
 * the recorded reason, lock time and user on hover, plus the lock/unlock
 * action that opens the postpone dialog. A delivery that was postponed and
 * later released keeps a muted "Released …" line so the lock history stays
 * visible in the list. The lock is an indicator only — nothing else is
 * disabled.
 */
export default function StatusCell({
  row,
}: CellContext<VoucherSchema, unknown>) {
  const data = row.original
  const { openLock } = useFreight()
  const { canView, canPostpone, canRelease } = useDeliveryLockPermissions()
  const isLocked = !!data.deliveryLocked
  // Releasing needs DELIVERY_LOCK_RELEASE; postponing (or editing the reason of
  // an existing lock) needs DELIVERY_LOCK_POSTPONE.
  const canChangeLock = isLocked ? canPostpone || canRelease : canPostpone
  const lockReason = deliveryLockReasonLabel(data.deliveryLockReason)
  const lockedAt = deliveryLockMoment(data.deliveryLockedAt)
  const releasedAt = deliveryLockMoment(data.deliveryUnlockedAt)

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {!canView ? null : isLocked ? (
        <TooltipProvider delayDuration={300}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge
                variant="outline"
                className={cn(
                  'cursor-help gap-1 text-xs text-rose-700 border-rose-300 bg-rose-50/60 dark:text-rose-300 dark:border-rose-800 dark:bg-rose-950/30',
                )}
              >
                <IconLock className="h-3 w-3" />
                {lockReason ?? 'Postponed'}
              </Badge>
            </TooltipTrigger>
            <TooltipContent side="top" align="start" className="max-w-[280px]">
              <div className="space-y-0.5 text-xs leading-snug">
                <div className="font-semibold">
                  Postponed — {lockReason ?? 'locked'}
                </div>
                {data.deliveryLockNote && (
                  <div className="whitespace-pre-wrap">
                    {data.deliveryLockNote}
                  </div>
                )}
                {lockedAt && (
                  <div className="text-muted-foreground">
                    Locked: {lockedAt}
                  </div>
                )}
                {data.deliveryLockedByName && (
                  <div className="text-muted-foreground">
                    By {data.deliveryLockedByName}
                  </div>
                )}
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ) : releasedAt ? (
        <TooltipProvider delayDuration={300}>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="cursor-help text-xs text-muted-foreground">
                Released {releasedAt}
              </span>
            </TooltipTrigger>
            <TooltipContent side="top" align="start" className="max-w-[280px]">
              <div className="space-y-0.5 text-xs leading-snug">
                <div className="font-semibold">Released</div>
                {lockedAt && (
                  <div className="text-muted-foreground">
                    Locked: {lockedAt}
                  </div>
                )}
                <div className="text-muted-foreground">
                  Released: {releasedAt}
                </div>
                {data.deliveryUnlockedByName && (
                  <div className="text-muted-foreground">
                    By {data.deliveryUnlockedByName}
                  </div>
                )}
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ) : (
        <span className="text-xs text-muted-foreground/50">—</span>
      )}

      {canChangeLock && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-7 w-7 shrink-0"
          title={
            isLocked
              ? 'Edit reason or unlock this delivery'
              : 'Postpone (lock) this delivery'
          }
          onClick={() => openLock(data)}
        >
          {isLocked ? (
            <IconLockOpen className="h-4 w-4 text-rose-600 dark:text-rose-400" />
          ) : (
            <IconLock className="h-4 w-4 text-muted-foreground" />
          )}
        </Button>
      )}
    </div>
  )
}
