
import { fiscalYearQueryOptions } from '@/features/modules/fiscal_year/data/queryOptions'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { Loader } from 'lucide-react'
import React, { Suspense } from 'react'
const FiscalYear = React.lazy(() =>
  import('@/features/modules/fiscal_year')
)

export const Route = createFileRoute('/_protected/masters/organization/_layout/fiscal_year/_layout/',)({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(fiscalYearQueryOptions()),
  component: () => {
    const { data: fiscalyear } = useSuspenseQuery(fiscalYearQueryOptions())
    return (
      <Suspense fallback={<Loader className="animate-spin" />}>

        <FiscalYear data={fiscalyear?.data} />
      </Suspense>
    )
  },
  errorComponent: () => <div>Error loading fiscal year data...</div>,
  pendingComponent: () => <Loader className="animate-spin" />,
})