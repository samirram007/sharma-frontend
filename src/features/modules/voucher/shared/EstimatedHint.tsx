import { cn } from '@/lib/utils'

/**
 * Small amber suffix badge marking a *calculated* value that has not been
 * saved yet (e.g. a weight derived from the stock-journal quantities rather
 * than stored on the dispatch detail). Rendered next to the value; carries a
 * tooltip explaining where the number came from.
 */
export function EstimatedHint({
  className,
  title = 'Calculated from the stock items — not yet saved',
}: {
  className?: string
  title?: string
}) {
  return (
    <span
      title={title}
      className={cn(
        'rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-700 dark:bg-amber-950/40 dark:text-amber-400',
        className,
      )}
    >
      estimated
    </span>
  )
}

export default EstimatedHint
