import { Outlet, useLocation } from '@tanstack/react-router'
import { useEffect, useSyncExternalStore } from 'react'
import ForbiddenError from '@/features/errors/403'
import {
  clearForbiddenRoute,
  getForbiddenRoute,
  isForbiddenRoute,
  subscribeForbiddenRoute,
} from '@/lib/forbidden-details'

/**
 * Renders the page area of the protected layout.
 *
 * When a route guard blocked the current navigation, the 403 "Access Denied"
 * content replaces the page — on the blocked URL itself (no redirect to
 * /forbidden), so the address bar keeps showing the page the user tried to
 * open.
 *
 * The block state is cleared whenever the user navigates to a different
 * pathname, so a later navigation to an allowed page renders normally again.
 */
export function ForbiddenGate() {
  const location = useLocation()
  const blocked = useSyncExternalStore(
    subscribeForbiddenRoute,
    getForbiddenRoute,
  )

  // Navigating away from the blocked path clears the flag so the next page
  // renders normally. useSyncExternalStore's getSnapshot must be stable, so
  // the reset happens in an effect instead of during render.
  useEffect(() => {
    if (blocked && !isForbiddenRoute(location.pathname)) {
      clearForbiddenRoute()
    }
  }, [blocked, location.pathname])

  if (blocked && isForbiddenRoute(location.pathname)) {
    return <ForbiddenError minimal details={blocked} className="h-full" />
  }

  return <Outlet />
}
