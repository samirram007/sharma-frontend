
import { storageUnitQueryOptions } from '@/features/modules/storage_unit/data/queryOptions'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { Loader } from 'lucide-react'
import React, { Suspense } from 'react'
const StorageUnit = React.lazy(() =>
  import('@/features/modules/storage_unit')
)

export const Route = createFileRoute('/_protected/masters/inventory/_layout/storage_unit/_layout/',)({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(storageUnitQueryOptions()),
  component: () => {
    const { data: storageUnits } = useSuspenseQuery(storageUnitQueryOptions())
    return (
      <Suspense fallback={<Loader className="animate-spin" />}>

        <StorageUnit data={storageUnits?.data} />
      </Suspense>
    )
  },
  errorComponent: () => <div>Error loading storage unit data...</div>,
  pendingComponent: () => <Loader className="animate-spin" />,
})