import { cn } from '@/lib/utils'
import { MapPin } from 'lucide-react'
import { ErrorActions } from './error-actions'
import { ErrorDetails } from './error-details'
import { useAuthSafe } from './use-auth-safe'

interface NotFoundErrorProps extends React.HTMLAttributes<HTMLDivElement> {
  minimal?: boolean
}

export default function NotFoundError({
  className,
  minimal = false,
}: NotFoundErrorProps) {
  const { user, isAuthenticated } = useAuthSafe()

  return (
    <div
      className={cn(
        'flex w-full items-center justify-center bg-gradient-to-br from-background via-background to-blue-500/5',
        minimal ? 'min-h-full' : 'h-svh',
        className,
      )}
    >
      <div className="mx-auto flex w-full max-w-2xl flex-col items-center px-6 text-center">
        {/* Animated map pin icon */}
        <div className="relative mb-8">
          <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-blue-500/10 ring-1 ring-blue-500/20">
            <MapPin className="h-12 w-12 text-blue-500" strokeWidth={1.5} />
          </div>
        </div>

        {!minimal && (
          <h1 className="mb-2 text-6xl font-extrabold tracking-tight text-foreground sm:text-7xl">
            404
          </h1>
        )}

        <h2 className="mb-3 text-xl font-semibold text-foreground sm:text-2xl">
          Page Not Found
        </h2>

        {isAuthenticated && user ? (
          <p className="mb-3 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            Hi <span className="font-medium text-foreground">{user.name}</span>,
            the page you&apos;re looking for doesn&apos;t exist — the address
            may be mistyped, the page may have moved or been renamed, or an old
            bookmark may point here.
          </p>
        ) : (
          <p className="mb-3 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            The page you&apos;re looking for doesn&apos;t exist — the address
            may be mistyped, the page may have moved or been renamed, or an old
            bookmark may point here.
          </p>
        )}

        <ErrorDetails code="404">
          <li>Double-check the address for typos.</li>
          <li>
            Use the sidebar navigation, the search box, or the shortcuts page to
            find what you need.
          </li>
          <li>Refresh your bookmarks if the page was recently renamed.</li>
        </ErrorDetails>

        <ErrorActions showShortcuts />
      </div>
    </div>
  )
}
