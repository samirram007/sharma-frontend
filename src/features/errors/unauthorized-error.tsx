import { cn } from '@/lib/utils'
import { AlertCircle, LogOut } from 'lucide-react'
import { ErrorActions } from './error-actions'
import { ErrorDetails } from './error-details'
import { useAuthSafe } from './use-auth-safe'

interface UnauthorisedErrorProps extends React.HTMLAttributes<HTMLDivElement> {
  minimal?: boolean
}

export default function UnauthorisedError({
  className,
  minimal = false,
}: UnauthorisedErrorProps) {
  const { user, isAuthenticated } = useAuthSafe()

  return (
    <div
      className={cn(
        'flex w-full items-center justify-center bg-gradient-to-br from-background via-background to-amber-500/5',
        minimal ? 'min-h-full' : 'h-svh',
        className,
      )}
    >
      <div className="mx-auto flex w-full max-w-2xl flex-col items-center px-6 text-center">
        {/* Animated alert icon */}
        <div className="relative mb-8">
          <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-amber-500/10 ring-1 ring-amber-500/20">
            <AlertCircle
              className="h-12 w-12 text-amber-500"
              strokeWidth={1.5}
            />
          </div>
          <div className="absolute -bottom-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-red-100 ring-4 ring-background dark:bg-red-900/40">
            <LogOut className="h-4 w-4 text-red-600 dark:text-red-400" />
          </div>
        </div>

        {!minimal && (
          <h1 className="mb-2 text-6xl font-extrabold tracking-tight text-foreground sm:text-7xl">
            401
          </h1>
        )}

        {isAuthenticated && user ? (
          <>
            <h2 className="mb-1 text-xl font-semibold text-foreground sm:text-2xl">
              Session Expired
            </h2>
            <p className="mb-3 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
              Hi{' '}
              <span className="font-medium text-foreground">{user.name}</span>,
              your session has expired. For security, sessions end after a
              period of inactivity — please sign in again to continue where you
              left off.
            </p>
          </>
        ) : (
          <>
            <h2 className="mb-3 text-xl font-semibold text-foreground sm:text-2xl">
              Unauthorized Access
            </h2>
            <p className="mb-3 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
              This page requires you to be signed in with the appropriate
              credentials. If you were signed in, your session may have expired
              — sign in again to continue.
            </p>
          </>
        )}

        <ErrorDetails code="401">
          <li>Re-enter your credentials on the sign-in page and try again.</li>
          <li>
            If you keep being signed out, clear your browser cookies and cache
            for this site.
          </li>
          <li>
            Still stuck? Contact your administrator — they can confirm your
            account is active.
          </li>
        </ErrorDetails>

        <ErrorActions />
      </div>
    </div>
  )
}
