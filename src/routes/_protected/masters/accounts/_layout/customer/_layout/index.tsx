import AccountGroup from '@/features/modules/account_group'
import { accountGroupQueryOptions } from '@/features/modules/account_group/data/queryOptions'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { Loader } from 'lucide-react'



export const Route = createFileRoute(
  '/_protected/masters/accounts/_layout/customer/_layout/',
)({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(accountGroupQueryOptions()),
  component: () => {
    const { data: accountGroup } = useSuspenseQuery(accountGroupQueryOptions())

    return <AccountGroup data={accountGroup?.data} />
  },
  errorComponent: () => <div>Error loading account group data.</div>,
  pendingComponent: () => <Loader className="animate-spin" />,
})
