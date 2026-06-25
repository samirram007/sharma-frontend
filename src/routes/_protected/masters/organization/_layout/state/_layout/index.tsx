
import { stateQueryOptions } from '@/features/modules/state/data/queryOptions'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { Loader } from 'lucide-react'
import React, { Suspense } from 'react'
const State = React.lazy(() =>
  import('@/features/modules/state')
)

export const Route = createFileRoute('/_protected/masters/organization/_layout/state/_layout/',)({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(stateQueryOptions()),
  component: () => {
    const { data: state } = useSuspenseQuery(stateQueryOptions())
    return (
      <Suspense fallback={<Loader className="animate-spin" />}>

        <State data={state?.data} />
      </Suspense>
    )
  },
  errorComponent: () => <div>Error loading state data...</div>,
  pendingComponent: () => <Loader className="animate-spin" />,
})