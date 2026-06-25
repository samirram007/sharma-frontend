
import { distributorQueryOptions } from '@/features/modules/distributor/data/queryOptions'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { Loader } from 'lucide-react'
import React, { Suspense } from 'react'
const Distributor = React.lazy(() =>
  import('@/features/modules/distributor')
)

export const Route = createFileRoute('/_protected/masters/party/_layout/distributor/_layout/',)({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(distributorQueryOptions()),
  component: () => {
    const { data: distributor } = useSuspenseQuery(distributorQueryOptions())
    return (
      <Suspense fallback={<Loader className="animate-spin" />}>

        <Distributor data={distributor?.data} />
      </Suspense>
    )
  },
  errorComponent: () => <div>Error loading distributor data...</div>,
  pendingComponent: () => <Loader className="animate-spin" />,
})