import { fiscalYearQueryOptions } from '@/features/modules/fiscal_year/data/queryOptions'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { Loader } from 'lucide-react'
import React, { Suspense } from 'react'

const FiscalYearDetails = React.lazy(
  () => import('@/features/modules/fiscal_year/details'),
)

export const Route = createFileRoute(
  '/_protected/masters/organization/_layout/fiscal_year/_layout/$id/',
)({
  component: () => {
    const { id } = Route.useParams()
    if (id === 'new') return <FiscalYearDetails />

    const { data: fiscalyear } = useSuspenseQuery(fiscalYearQueryOptions(id))
    return (
      <Suspense fallback={<Loader className="animate-spin" />}>
        <FiscalYearDetails data={fiscalyear?.data} />
      </Suspense>
    )
  },
  errorComponent: () => (
    <div>
      <span className="bg-red-400">By ID:</span> Error loading fiscalyear data.
    </div>
  ),
  pendingComponent: () => <Loader className="animate-spin" />,
})
