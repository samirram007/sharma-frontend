
import ForbiddenError from '@/features/errors/403'
import GeneralError from '@/features/errors/general-error'
import AccountGroupProvider from '@/features/modules/account_group/contexts/account_group-context'
import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/_protected/masters/accounts/_layout/customer/_layout')({
  component: () => {
    return (
      <AccountGroupProvider>
        <Outlet />
      </AccountGroupProvider>
    )
  },
  notFoundComponent: () => <ForbiddenError minimal />,
  errorComponent: () => <GeneralError minimal />,
})

