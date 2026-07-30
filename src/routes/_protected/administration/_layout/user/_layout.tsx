import GeneralError from '@/features/errors/general-error'
import { requirePermission } from '@/lib/auth';
import UserProvider from '@/features/modules/user/contexts/user-context'
import { createFileRoute, Outlet } from '@tanstack/react-router'
import { Loader } from 'lucide-react'

export const Route = createFileRoute(
  '/_protected/administration/_layout/user/_layout',
)({
  beforeLoad: requirePermission('USER_MENU_VIEW'),
  component: () => {
    //const { data: supplier } = useSuspenseQuery(supplierQueryOptions())
    return (
      <UserProvider>
        <Outlet />
      </UserProvider>
    )
  },
  errorComponent: () => <GeneralError minimal />,
  pendingComponent: () => <Loader className="animate-spin" />,
})


