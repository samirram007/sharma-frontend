import ForbiddenError from '@/features/errors/403'
import ProtectedLayout from '@/layouts/ProtectedLayout'
import GeneralError from '@/features/errors/general-error'
import { setForbiddenRoute } from '@/lib/forbidden-details'
import { guardMenuRoutes } from '@/features/modules/menu/data/menu-route-guard'
import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_protected')({
  beforeLoad: async ({ context, location, cause }) => {
    if (!context.auth?.isAuthenticated) {
      throw redirect({ to: '/sign-in' })
    }
    // NOTE: do NOT clear the forbidden store here. Preloads run beforeLoad
    // too, so clearing would un-block the page the user is currently sitting
    // on. ForbiddenGate clears on pathname mismatch instead.
    if (!context.auth?.permissions || context.auth.permissions.length === 0) {
      console.log('Blocking protected Route: no permissions assigned')
      setForbiddenRoute({ attemptedPath: location.pathname })
      return
    }
    // Menu-route guard: menus hidden from the sidebar (denied permission or
    // is_visible = false) are also unroutable — visiting their URL directly
    // renders the 403 content in the page area instead of the page.
    await guardMenuRoutes(context, location.pathname, cause)
  },

  component: ProtectedLayout,

  notFoundComponent: () => <ForbiddenError minimal />,
  errorComponent: () => <GeneralError minimal />,
})
