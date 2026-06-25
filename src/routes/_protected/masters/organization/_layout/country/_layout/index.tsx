
import { countryQueryOptions } from '@/features/modules/country/data/queryOptions'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { Loader } from 'lucide-react'
import React, { Suspense } from 'react'
const Country = React.lazy(() =>
  import('@/features/modules/country')
)

export const Route = createFileRoute('/_protected/masters/organization/_layout/country/_layout/',)({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(countryQueryOptions()),
  component: () => {
    const { data: country } = useSuspenseQuery(countryQueryOptions())
    return (
      <Suspense fallback={<Loader className="animate-spin" />}>

        <Country data={country?.data} />
      </Suspense>
    )
  },
  errorComponent: () => <div>Error loading country data...</div>,
  pendingComponent: () => <Loader className="animate-spin" />,
})