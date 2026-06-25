
import GeneralError from '@/features/errors/general-error'
import NotFoundError from '@/features/errors/not-found-error'
import AccountGroupProvider from '@/features/modules/account_group/contexts/account_group-context'
import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/_protected/masters/accounts/_layout/account_group/_layout')({
  component: () => {
    return (
      <AccountGroupProvider>
        <Outlet />
      </AccountGroupProvider>
    )
  },
  notFoundComponent: NotFoundError,
  errorComponent: GeneralError,
})

