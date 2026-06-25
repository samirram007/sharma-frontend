
import { companyQueryOptions } from '@/features/modules/company/data/queryOptions'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { Loader } from 'lucide-react'
import React, { Suspense } from 'react'
const Company = React.lazy(() =>
  import('@/features/modules/company')
)

export const Route = createFileRoute('/_protected/masters/organization/_layout/company/_layout/',)({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(companyQueryOptions()),
  component: () => {
    const { data: company } = useSuspenseQuery(companyQueryOptions())


    return (
      <Suspense fallback={<Loader className="animate-spin" />}>

        <Company data={company?.data} />
      </Suspense>
    )
  },
  errorComponent: () => <div>Error loading company data...</div>,
  pendingComponent: () => <Loader className="animate-spin" />,
})