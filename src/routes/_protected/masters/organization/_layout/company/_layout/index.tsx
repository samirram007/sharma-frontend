import DataLoadError from '@/features/errors/data-load-error'
import { companyQueryOptions } from '@/features/modules/company/data/queryOptions'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { Loader } from 'lucide-react'
import React, { Suspense } from 'react'
const Company = React.lazy(() => import('@/features/modules/company'))

export const Route = createFileRoute(
  '/_protected/masters/organization/_layout/company/_layout/',
)({
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
  errorComponent: ({ error }) => (
    <DataLoadError error={error} title="Couldn't load the company list" />
  ),
  pendingComponent: () => <Loader className="animate-spin" />,
})
