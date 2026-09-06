import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Wrench } from 'lucide-react'
import { ErrorActions } from './error-actions'
import { ErrorDetails } from './error-details'
import { useAuthSafe } from './use-auth-safe'

interface MaintenanceErrorProps extends React.HTMLAttributes<HTMLDivElement> {
  minimal?: boolean
}

export default function MaintenanceError({
  className,
  minimal = false,
}: MaintenanceErrorProps) {
  const { user, isAuthenticated } = useAuthSafe()

  return (
    <div
      className={cn(
        'flex w-full items-center justify-center bg-gradient-to-br from-background via-background to-orange-500/5',
        minimal ? 'min-h-full' : 'h-svh',
        className,
      )}
    >
      <div className="mx-auto flex w-full max-w-2xl flex-col items-center px-6 text-center">
        {/* Animated wrench icon */}
        <div className="relative mb-8">
          <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-orange-500/10 ring-1 ring-orange-500/20">
            <Wrench className="h-12 w-12 text-orange-500" strokeWidth={1.5} />
          </div>
        </div>

        {!minimal && (
          <h1 className="mb-2 text-6xl font-extrabold tracking-tight text-foreground sm:text-7xl">
            503
          </h1>
        )}

        <h2 className="mb-3 text-xl font-semibold text-foreground sm:text-2xl">
          Under Maintenance
        </h2>

        {isAuthenticated && user ? (
          <p className="mb-3 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            Hi <span className="font-medium text-foreground">{user.name}</span>,
            the system is temporarily offline for scheduled maintenance.
            We&apos;re making improvements behind the scenes and will be back
            online shortly. Thank you for your patience.
          </p>
        ) : (
          <p className="mb-3 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            The system is temporarily offline for scheduled maintenance.
            We&apos;re making improvements behind the scenes and will be back
            online shortly. Thank you for your patience.
          </p>
        )}

        <ErrorDetails code="503">
          <li>
            No action is needed on your side — check back in a few minutes.
          </li>
          <li>Your data is safe; nothing has been lost.</li>
          <li>
            If maintenance lasts longer than expected, contact your
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
              <Wrench className="h-4 w-4" />
              Try Again
            </Button>
          }
        />
      </div>
    </div>
  )
}
