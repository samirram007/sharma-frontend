import { IconLock, IconLockOpen } from '@tabler/icons-react'
import { Badge } from '@/components/ui/badge'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { deliveryLockMoment } from '../../shared/delivery-lock'
import { useDeliveryLockPermissions } from '../../shared/delivery-lock-permissions'
import { resolveDeliveryLockSource } from '../data/delivery-lock-source'
import type { DayBookSchema } from '../data/schema'

/**
 * Lock chip shown next to the row status: "Postponed" while the lock is open,
 * "Released" once it was lifted. Hovering shows the reason, note, moment and
 * user. Renders nothing when the delivery was never postponed.
 */
export default function DeliveryLockBadge({ row }: { row: DayBookSchema }) {
  // DELIVERY_LOCK_VIEW gates the state; without it the chip is not shown.
  const { canView } = useDeliveryLockPermissions()
  const source = resolveDeliveryLockSource(row)
  if (!canView || !source) {
    return null
  }

  const lockedAt = deliveryLockMoment(source.deliveryLockedAt)
  const releasedAt = deliveryLockMoment(source.deliveryUnlockedAt)

  if (source.deliveryLocked) {
    const reason = source.deliveryLockReason
      ?.replaceAll('_', ' ')
      .replace(/^./, (c) => c.toUpperCase())

    return (
      <TooltipProvider delayDuration={300}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge
              variant="outline"
              className="shrink-0 cursor-help gap-1 whitespace-nowrap text-xs text-rose-700 border-rose-300 bg-rose-50/60 dark:text-rose-300 dark:border-rose-800 dark:bg-rose-950/30"
            >
              <IconLock className="h-3 w-3 shrink-0" /> Postponed
            </Badge>
          </TooltipTrigger>
          <TooltipContent side="top" align="start" className="max-w-[280px]">
            <div className="space-y-0.5 text-xs leading-snug">
              <div className="font-semibold">Postponed</div>
              {reason && <div className="whitespace-pre-wrap">{reason}</div>}
              {source.deliveryLockNote && (
                <div className="whitespace-pre-wrap">
                  {source.deliveryLockNote}
                </div>
              )}
              {lockedAt && (
                <div className="text-muted-foreground">Locked: {lockedAt}</div>
              )}
              {source.deliveryLockedByName && (
                <div className="text-muted-foreground">
                  By {source.deliveryLockedByName}
                </div>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  if (!releasedAt) {
    return null
  }

  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge
            variant="outline"
            className="shrink-0 cursor-help gap-1 whitespace-nowrap text-xs text-emerald-700 border-emerald-300 bg-emerald-50/60 dark:text-emerald-300 dark:border-emerald-800 dark:bg-emerald-950/30"
          >
            <IconLockOpen className="h-3 w-3 shrink-0" /> Released
          </Badge>
        </TooltipTrigger>
        <TooltipContent side="top" align="start" className="max-w-[280px]">
          <div className="space-y-0.5 text-xs leading-snug">
            <div className="font-semibold">Released</div>
            {lockedAt && (
              <div className="text-muted-foreground">Locked: {lockedAt}</div>
            )}
            <div className="text-muted-foreground">Released: {releasedAt}</div>
            {source.deliveryUnlockedByName && (
              <div className="text-muted-foreground">
                By {source.deliveryUnlockedByName}
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
