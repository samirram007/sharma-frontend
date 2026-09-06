import { useLocation } from '@tanstack/react-router'
import { FileCode2 } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface ErrorDetailsProps {
  /** HTTP status / error code shown on the page. */
  code: string
  /** Optional list of actionable hints ("What you can do"). */
  children?: ReactNode
  className?: string
  /**
   * Overrides the location-derived path — used by the 403 page when the user
   * was redirected here from the path they originally tried to open.
   */
  path?: string
}

/**
 * Compact diagnostic panel for error pages: shows the error code, the path
 * where it happened, and when, plus actionable hints.
 */
export function ErrorDetails({
  code,
  children,
  className,
  path,
}: ErrorDetailsProps) {
  const location = useLocation()
  const [renderedAt] = useState(() => new Date())

  const displayPath = (path ?? location.pathname).trim() || '/'
  const timeLabel = renderedAt.toLocaleString()

  return (
    <div
      className={cn(
        'mt-6 w-full rounded-xl border border-slate-200/70 bg-background/60 p-4 text-left text-xs shadow-sm dark:border-white/10',
        className,
      )}
    >
      <div className="flex items-center gap-1.5 font-semibold text-foreground">
        <FileCode2 className="h-3.5 w-3.5 text-muted-foreground" />
        Error details
      </div>
      <dl className="mt-2.5 grid grid-cols-1 gap-y-2.5 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:divide-x sm:divide-slate-200/70 sm:[&>*:not(:first-child)]:pl-6 dark:sm:divide-white/10">
        <div className="min-w-0">
          <dt className="text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
            Code
          </dt>
          <dd className="mt-0.5 font-mono font-semibold text-foreground">
            {code}
          </dd>
        </div>
        <div className="min-w-0">
          <dt className="text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
            Path
          </dt>
          <dd
            className="mt-0.5 truncate font-mono text-foreground"
            title={displayPath}
          >
            {displayPath}
          </dd>
        </div>
        <div className="min-w-0">
          <dt className="text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
            Time
          </dt>
          <dd
            className="mt-0.5 font-mono text-foreground whitespace-nowrap tabular-nums"
            title={timeLabel}
          >
            {timeLabel}
          </dd>
        </div>
      </dl>
      {children && (
        <div className="mt-3 border-t border-slate-200/70 pt-3 dark:border-white/10">
          <div className="mb-1 font-medium text-foreground">
            What you can do
          </div>
          <ul className="list-disc space-y-1 pl-4 leading-relaxed text-muted-foreground">
            {children}
          </ul>
        </div>
      )}
    </div>
  )
}
