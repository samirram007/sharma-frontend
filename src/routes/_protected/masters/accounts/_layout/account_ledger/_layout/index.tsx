
import AccountLedger from '@/features/modules/account_ledger'
import { accountLedgerQueryOptions } from '@/features/modules/account_ledger/data/queryOptions'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { Loader } from 'lucide-react'


export const Route = createFileRoute(
  '/_protected/masters/accounts/_layout/account_ledger/_layout/',
)({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(accountLedgerQueryOptions()),
  component: () => {
    const { data: accountLedger } = useSuspenseQuery(accountLedgerQueryOptions())
    return <AccountLedger data={accountLedger?.data} />
  },
  errorComponent: () => <div>Error loading account ledger data.</div>,
  pendingComponent: () => <Loader className="animate-spin" />,
})

