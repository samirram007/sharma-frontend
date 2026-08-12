import ForbiddenError from '@/features/errors/403'
import ProtectedLayout from '@/layouts/ProtectedLayout'
import GeneralError from '@/features/errors/general-error'
import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_protected')({
  // eslint-disable-next-line @typescript-eslint/require-await
  beforeLoad: async ({ context }) => {
    if (!context.auth?.isAuthenticated) {
      throw redirect({ to: '/sign-in' })
    }
    if (!context.auth?.permissions || context.auth.permissions.length === 0) {
      console.log('Redirecting from protected Route: no permissions assigned')
      throw redirect({ to: '/forbidden' })
    }
  },

  component: ProtectedLayout,

  notFoundComponent: () => <ForbiddenError minimal />,
  errorComponent: () => <GeneralError minimal />,
})
