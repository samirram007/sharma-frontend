import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useLocation } from '@tanstack/react-router'
import { AxiosError } from 'axios'
import { AlertTriangle, FileCode2, RefreshCcw } from 'lucide-react'
import { useState } from 'react'
import { ErrorActions } from './error-actions'

interface DataLoadErrorProps extends React.HTMLAttributes<HTMLDivElement> {
  /** The thrown error (failed request, validation, render, ...). */
  error?: unknown
  /** Short human-readable headline, e.g. "Couldn't load the company list". */
  title: string
}

/** Zod errors carry `.issues` — format them without importing the library. */
function isZodIssueList(err: unknown): err is {
  issues: Array<{ path: ReadonlyArray<PropertyKey>; message: string }>
} {
  return (
    typeof err === 'object' &&
    err !== null &&
    Array.isArray((err as { issues?: unknown }).issues)
  )
}

/**
 * Turn any thrown error into readable, diagnosable lines:
 * - Axios errors show the HTTP status, request URL and server message (plus
 *   per-field validation messages when present).
 * - Zod validation errors list each offending path with its message.
 * - Anything else falls back to the error message.
 */
export function describeLoadError(error?: unknown): string[] {
  if (!error) {
    return ['No further information was provided by the request.']
  }

  if (error instanceof AxiosError) {
    const status = error.response?.status
    const method = (error.config?.method ?? 'GET').toUpperCase()
    const url = error.config?.url ?? ''
    const serverMessage = ((error.response?.data as { message?: unknown })
      ?.message ?? error.message) as string

    const lines = [
      `Request failed: ${method} ${url}`,
      `Status: ${status ?? 'Network error (no response)'}`,
      `Server message: ${serverMessage}`,
    ]
    const fieldErrors = (
      error.response?.data as {
        errors?: Record<string, unknown>
      }
    )?.errors
    if (fieldErrors && typeof fieldErrors === 'object') {
      lines.push('Validation errors:')
      for (const [field, messages] of Object.entries(fieldErrors)) {
        const text = Array.isArray(messages)
          ? messages.join(', ')
          : String(messages)
        lines.push(`  - ${field}: ${text}`)
      }
    }
    return lines
  }

  if (isZodIssueList(error)) {
    if (error.issues.length === 0) {
      return ['The server response did not pass validation.']
    }
    return [
      'The server response did not match the expected format:',
      ...error.issues.map(
        (issue) => `  - ${issue.path.join('.') || '(root)'}: ${issue.message}`,
      ),
    ]
  }

  const message =
    error instanceof Error ? error.message : String(error ?? 'Unknown error')
  return [message || 'An unexpected error occurred.']
}

/**
 * Friendly data-loading error page: explains what happened and shows a
 * diagnostic panel (code, path, time and the concrete error details) so the
 * user can report it and the admin can act on it. Used by route error
 * components and by pages that validate server payloads before rendering.
 */
export default function DataLoadError({
  error,
  title,
  className,
  ...rest
}: DataLoadErrorProps) {
  const location = useLocation()
  const [renderedAt] = useState(() => new Date())
  const lines = describeLoadError(error)
  const code =
    error instanceof AxiosError
      ? String(error.response?.status ?? 'Network')
      : isZodIssueList(error)
        ? 'Data'
        : 'Error'

  const displayPath = location.pathname.trim() || '/'
  const timeLabel = renderedAt.toLocaleString()

  return (
    <div
      className={cn(
        'flex min-h-full w-full items-center justify-center bg-gradient-to-br from-background via-background to-amber-500/5 p-6',
        className,
      )}
      {...rest}
    >
      <div className="mx-auto flex w-full max-w-2xl flex-col items-center text-center">
        <div className="relative mb-6">
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-amber-500/10 ring-1 ring-amber-500/20">
            <AlertTriangle
              className="h-10 w-10 text-amber-500"
              strokeWidth={1.5}
            />
          </div>
        </div>

        <h2 className="mb-2 text-xl font-semibold text-foreground sm:text-2xl">
          {title}
        </h2>
        <p className="mb-1 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
          The page couldn&apos;t get the data it needs to display. This is
          usually temporary — try again in a moment. If it keeps failing, the
          details below will help your administrator find the cause.
        </p>

        {/* Diagnostic panel: code / path / time + concrete error text */}
        <div className="mt-6 w-full rounded-xl border border-slate-200/70 bg-background/60 p-4 text-left text-xs shadow-sm dark:border-white/10">
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
                className="mt-0.5 font-mono whitespace-nowrap text-foreground tabular-nums"
                title={timeLabel}
              >
                {timeLabel}
              </dd>
            </div>
          </dl>
          <pre className="mt-3 max-h-56 overflow-auto rounded-lg border border-red-500/15 bg-red-500/5 p-3 font-mono text-[11px] leading-relaxed whitespace-pre-wrap break-words text-red-700 dark:bg-red-950/20 dark:text-red-300">
            {lines.join('\n') || 'No details available.'}
          </pre>
        </div>

        <ErrorActions
          extra={
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => window.location.reload()}
            >
              <RefreshCcw className="h-4 w-4" />
              Retry
            </Button>
          }
        />
      </div>
    </div>
  )
}
