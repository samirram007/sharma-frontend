import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Link, useRouter } from '@tanstack/react-router'
import { ServerCrash, ArrowLeft, Home, RefreshCcw, LogIn } from 'lucide-react'
import { useAuthSafe } from './use-auth-safe'

interface GeneralErrorProps extends React.HTMLAttributes<HTMLDivElement> {
  minimal?: boolean
}

export default function GeneralError({
  className,
  minimal = false,
}: GeneralErrorProps) {
  const { history } = useRouter()
  const { user, isAuthenticated } = useAuthSafe()

  return (
    <div
      className={cn(
        'flex w-full items-center justify-center bg-gradient-to-br from-background via-background to-red-500/5',
        minimal ? 'min-h-full' : 'h-svh',
        className,
      )}
    >
      <div className="mx-auto flex w-full max-w-lg flex-col items-center px-6 text-center">
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
          <p className="mb-8 max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base">
            Hi <span className="font-medium text-foreground">{user.name}</span>,
            we apologize for the inconvenience. An unexpected error occurred.
            Please try again or contact your administrator.
          </p>
        ) : (
          <p className="mb-8 max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base">
            We apologize for the inconvenience. An unexpected error occurred.
            Please try again later.
          </p>
        )}

        {!minimal && (
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              variant="outline"
              size="lg"
              onClick={() => history.go(-1)}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Go Back
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => window.location.reload()}
              className="gap-2"
            >
              <RefreshCcw className="h-4 w-4" />
              Retry
            </Button>
            {isAuthenticated ? (
              <Button asChild variant="default" size="lg" className="gap-2">
                <Link to="/">
                  <Home className="h-4 w-4" />
                  Back to Dashboard
                </Link>
              </Button>
            ) : (
              <Button asChild variant="default" size="lg" className="gap-2">
                <Link to="/sign-in">
                  <LogIn className="h-4 w-4" />
                  Sign In
                </Link>
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
