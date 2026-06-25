
import { voucherTypeQueryOptions } from '@/features/modules/voucher_type/data/queryOptions'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { Loader } from 'lucide-react'
import React from 'react'

const VoucherType = React.lazy(() => import('@/features/modules/voucher_type'))

export const Route = createFileRoute(
  '/_protected/masters/accounts/_layout/voucher_type/_layout/',
)({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(voucherTypeQueryOptions()),
  component: () => {
    const { data: voucherType } = useSuspenseQuery(voucherTypeQueryOptions())
    return <VoucherType data={voucherType?.data} />
  },
  errorComponent: () => <div>Error loading voucher type data.</div>,
  pendingComponent: () => <Loader className="animate-spin" />,
})