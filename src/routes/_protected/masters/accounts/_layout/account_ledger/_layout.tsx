
import GeneralError from '@/features/errors/general-error'
import NotFoundError from '@/features/errors/not-found-error'
import AccountLedgerProvider from '@/features/modules/account_ledger/contexts/account-ledger-context'
import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/_protected/masters/accounts/_layout/account_ledger/_layout')({
  component: () => {
    return (
      <AccountLedgerProvider>
        <Outlet />
      </AccountLedgerProvider>
    )
  },
  notFoundComponent: NotFoundError,
  errorComponent: GeneralError,
})

