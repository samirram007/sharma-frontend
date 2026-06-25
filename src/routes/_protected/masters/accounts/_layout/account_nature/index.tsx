
import AccountNature from '@/features/modules/account_nature'
import { fetchAccountNatureService } from '@/features/modules/account_nature/data/api'
import { queryOptions, useSuspenseQuery } from '@tanstack/react-query'

import { createFileRoute } from '@tanstack/react-router'
import { Loader } from 'lucide-react'


const accountNatureQueryOptions = (key: string) => {
  return queryOptions({
    queryKey: [key],
    queryFn: fetchAccountNatureService,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
  })
}

export const Route = createFileRoute(
  '/_protected/masters/accounts/_layout/account_nature/',
)({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(accountNatureQueryOptions("accountNatures")),
  component: () => {
    const { data: accountNature } = useSuspenseQuery(accountNatureQueryOptions("accountNatures"))
    return <AccountNature data={accountNature?.data} />
  },
  errorComponent: () => <div>Error loading account nature data.</div>,
  pendingComponent: () => <Loader className="animate-spin" />,
})

