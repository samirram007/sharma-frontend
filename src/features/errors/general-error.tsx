import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { ServerCrash, RefreshCcw } from 'lucide-react'
import { ErrorActions } from './error-actions'
import { ErrorDetails } from './error-details'
import { useAuthSafe } from './use-auth-safe'

interface GeneralErrorProps extends React.HTMLAttributes<HTMLDivElement> {
  minimal?: boolean
}

export default function GeneralError({
  className,
  minimal = false,
}: GeneralErrorProps) {
  const { user, isAuthenticated } = useAuthSafe()

  return (
    <div
      className={cn(
        'flex w-full items-center justify-center bg-gradient-to-br from-background via-background to-red-500/5',
        minimal ? 'min-h-full' : 'h-svh',
        className,
      )}
    >
      <div className="mx-auto flex w-full max-w-2xl flex-col items-center px-6 text-center">
        {/* Animated server crash icon */}
        <div className="relative mb-8">
          <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-red-500/10 ring-1 ring-red-500/20">
            <ServerCrash className="h-12 w-12 text-red-500" strokeWidth={1.5} />
          </div>
        </div>

        {!minimal && (
          <h1 className="mb-2 text-6xl font-extrabold tracking-tight text-foreground sm:text-7xl">
            500
          </h1>
        )}

        <h2 className="mb-3 text-xl font-semibold text-foreground sm:text-2xl">
          Something Went Wrong
        </h2>

        {isAuthenticated && user ? (
          <p className="mb-3 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            Hi <span className="font-medium text-foreground">{user.name}</span>,
            an unexpected error occurred while loading this page. This is
            usually temporary — a server hiccup, a timeout, or a slow
            connection.
          </p>
        ) : (
          <p className="mb-3 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            An unexpected error occurred while loading this page. This is
            usually temporary — a server hiccup, a timeout, or a slow
            connection.
          </p>
        )}

        <ErrorDetails code="500">
          <li>Click Retry — a temporary glitch often clears on refresh.</li>
          <li>Wait a moment, then reload the page from the navigation menu.</li>
          <li>
            If it keeps happening, note the page and time above and contact your
            administrator.
          </li>
        </ErrorDetails>

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
