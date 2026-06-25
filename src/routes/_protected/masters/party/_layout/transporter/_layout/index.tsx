

import { transporterQueryOptions } from '@/features/modules/transporter/data/queryOptions'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { Loader } from 'lucide-react'
import React, { Suspense } from 'react'
const Transporter = React.lazy(() =>
  import('@/features/modules/transporter')
)

export const Route = createFileRoute('/_protected/masters/party/_layout/transporter/_layout/',)({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(transporterQueryOptions()),
  component: () => {
    const { data: transporter } = useSuspenseQuery(transporterQueryOptions())
    return (
      <Suspense fallback={<Loader className="animate-spin" />}>

        <Transporter data={transporter?.data} />
      </Suspense>
    )
  },
  errorComponent: () => <div>Error loading transporter data...</div>,
  pendingComponent: () => <Loader className="animate-spin" />,
})