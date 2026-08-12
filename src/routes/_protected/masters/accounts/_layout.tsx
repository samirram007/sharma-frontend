import ForbiddenError from '@/features/errors/403'
import GeneralError from '@/features/errors/general-error'
import Accounts from '@/features/masters/accounts'
import AccountProvider from '@/features/masters/accounts/contexts/account-context'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_protected/masters/accounts/_layout')({
  component: () => {
    return (
      <AccountProvider>
        <Accounts />
      </AccountProvider>
    )
  },
  notFoundComponent: () => <ForbiddenError minimal />,
  errorComponent: () => <GeneralError minimal />,
})
