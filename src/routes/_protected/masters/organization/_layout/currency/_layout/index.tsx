
import { currencyQueryOptions } from '@/features/modules/currency/data/queryOptions'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { Loader } from 'lucide-react'
import React, { Suspense } from 'react'
const Currency = React.lazy(() =>
  import('@/features/modules/currency')
)

export const Route = createFileRoute('/_protected/masters/organization/_layout/currency/_layout/',)({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(currencyQueryOptions()),
  component: () => {
    const { data: currency } = useSuspenseQuery(currencyQueryOptions())
    return (
      <Suspense fallback={<Loader className="animate-spin" />}>

        <Currency data={currency?.data} />
      </Suspense>
    )
  },
  errorComponent: () => <div>Error loading currency data...</div>,
  pendingComponent: () => <Loader className="animate-spin" />,
})