import { cn } from '@/lib/utils'

function Skeleton({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="skeleton"
      className={cn(
        'relative isolate overflow-hidden rounded-md bg-accent/80',
        className,
      )}
      {...props}
    >
      {/* Shimmer sweep — animates across the bar on a loop. The keyframes
          animate transform only; no translate-* utility here because Tailwind
          v4 sets the standalone `translate` property, which would compose with
          the animated transform and throw the sweep off. */}
      <div
        aria-hidden
        className="absolute inset-0 animate-[skeleton-shimmer_1.6s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-white/40 to-transparent dark:via-white/10"
      />
    </div>
  )
}

export { Skeleton }
