import SalesOrderVoucherComponent from '@/features/modules/voucher/sales_order/index'
import { salesOrderQueryOptions } from '@/features/modules/voucher/sales_order/data/queryOptions'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { Loader } from 'lucide-react'
import { Suspense } from 'react'
import z from 'zod'

const paramsSchema = z.object({
  id: z.union([
    z.literal('new'),
    z.coerce.number().refine((n) => !Number.isNaN(n), {
      message: 'Invalid number',
    }),
  ]),
})

export const Route = createFileRoute(
  '/_protected/transactions/_provider/vouchers/_layout/sales_order/$id',
)({
  params: {
    parse: (params) => paramsSchema.parse(params),
    stringify: ({ id }) => ({ id: `${id}` }),
  },
  loader: ({ context, params: { id } }) => {
    if (id === 'new') return null
    return context.queryClient.ensureQueryData(salesOrderQueryOptions(id))
  },
  component: RouteComponent,
  errorComponent: () => (
    <div>
      <span className="bg-red-400">By ID:</span> Error loading sales order
      voucher.
    </div>
  ),
  pendingComponent: () => <Loader className="animate-spin" />,
})

function RouteComponent() {
  const { id } = Route.useParams()
  if (id === 'new') return <SalesOrderVoucherComponent />

  const { data: salesOrder } = useSuspenseQuery(salesOrderQueryOptions(id))
  return (
    <Suspense fallback={<Loader className="animate-spin" />}>
      <SalesOrderVoucherComponent currentRow={salesOrder?.data} />
    </Suspense>
  )
}
