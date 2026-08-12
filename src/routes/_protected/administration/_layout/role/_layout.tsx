import { requirePermission } from '@/lib/auth'
import ForbiddenError from '@/features/errors/403'
import GeneralError from '@/features/errors/general-error'
import RoleProvider from '@/features/modules/role/contexts/role-context'
import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/_protected/administration/_layout/role/_layout',
)({
  beforeLoad: requirePermission('ROLE_MENU_VIEW'),
  component: () => {
    return (
      <RoleProvider>
        <Outlet />
      </RoleProvider>
    )
  },
  notFoundComponent: () => <ForbiddenError minimal />,
  errorComponent: () => <GeneralError minimal />,
})
