
import { supplierQueryOptions } from '@/features/modules/supplier/data/queryOptions'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { Loader } from 'lucide-react'
import React, { Suspense } from 'react'
const Supplier = React.lazy(() =>
  import('@/features/modules/supplier')
)

export const Route = createFileRoute('/_protected/masters/party/_layout/supplier/_layout/',)({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(supplierQueryOptions()),
  component: () => {
    const { data: supplier } = useSuspenseQuery(supplierQueryOptions())
    return (
      <Suspense fallback={<Loader className="animate-spin" />}>

        <Supplier data={supplier?.data} />
      </Suspense>
    )
  },
  errorComponent: () => <div>Error loading supplier data...</div>,
  pendingComponent: () => <Loader className="animate-spin" />,
})