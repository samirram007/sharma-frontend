import { freightGodownWiseQueryOptions } from '@/features/modules/voucher/freight/godown-wise/data/queryOptions'

import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { Loader } from 'lucide-react'

import FreightGodownWise from '@/features/modules/voucher/freight/godown-wise'

export const Route = createFileRoute(
  '/_protected/reports/freight/_layout/freight-godown-wise',
)({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(
      freightGodownWiseQueryOptions(),
    ),
  component: () => {
    const { data: freightGodownWise } = useSuspenseQuery(
      freightGodownWiseQueryOptions(),
    )

    return <FreightGodownWise data={freightGodownWise?.data} />
  },
  errorComponent: () => <div>Error loading freight godown wise data.</div>,
  pendingComponent: () => <Loader className="animate-spin" />,
})
