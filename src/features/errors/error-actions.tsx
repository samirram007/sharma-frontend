import { Button } from '@/components/ui/button'
import { useAuthSafe } from './use-auth-safe'
import { Link, useNavigate, useRouter } from '@tanstack/react-router'
import { Home, LayoutGrid, LifeBuoy, LogIn, LogOut, Undo2 } from 'lucide-react'
import { useState, type ReactNode } from 'react'

interface ErrorActionsProps {
  /** Extra context action rendered right after the primary CTA (e.g. Retry). */
  extra?: ReactNode
  /** Show "Browse Shortcuts" (used by the 404 page). */
  showShortcuts?: boolean
}

/**
 * Convenient quick-actions row shared by every error page:
 * back to the dashboard (or sign in), back to the last visited page,
 * sign out (when signed in) and the help center — plus page-specific
 * extras like Retry or Browse Shortcuts.
 */
export function ErrorActions({
  extra,
  showShortcuts = false,
}: ErrorActionsProps) {
  const { history } = useRouter()
  const navigate = useNavigate()
  const { isAuthenticated, logout } = useAuthSafe()
  const [loggingOut, setLoggingOut] = useState(false)

  const handleSignOut = async () => {
    if (loggingOut) return
    setLoggingOut(true)
    try {
      await logout()
      navigate({ to: '/sign-in' })
    } finally {
      setLoggingOut(false)
    }
  }

  return (
    <div className="mt-7 flex flex-wrap items-center justify-center gap-2.5">
      {isAuthenticated ? (
        <Button asChild className="gap-2">
          <Link to="/">
            <Home className="h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
      ) : (
        <Button asChild className="gap-2">
          <Link to="/sign-in">
            <LogIn className="h-4 w-4" />
            Sign In
          </Link>
        </Button>
      )}

      {extra}

      <Button
        variant="outline"
        className="gap-2"
        onClick={() => history.go(-1)}
        title="Go back to the page you visited before this one"
      >
        <Undo2 className="h-4 w-4" />
        Last Visited Page
      </Button>

      {showShortcuts && isAuthenticated && (
        <Button asChild variant="outline" className="gap-2">
          <Link to="/new-tab">
            <LayoutGrid className="h-4 w-4" />
            Browse Shortcuts
          </Link>
        </Button>
      )}

      <Button asChild variant="ghost" className="gap-2">
        <Link to="/help-center">
          <LifeBuoy className="h-4 w-4" />
          Help Center
        </Link>
      </Button>

      {isAuthenticated && (
        <Button
          variant="ghost"
          className="gap-2 text-destructive hover:bg-destructive/10 hover:text-destructive"
          onClick={handleSignOut}
          disabled={loggingOut}
        >
          <LogOut className="h-4 w-4" />
          {loggingOut ? 'Signing Out…' : 'Sign Out'}
        </Button>
      )}
    </div>
  )
}
