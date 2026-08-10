import OpeningStockVoucherComponent from '@/features/modules/voucher/opening_stock'
import { OpeningStockQueryOptions } from '@/features/modules/voucher/opening_stock/data/queryOptions'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { requirePermission } from '@/lib/auth'
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
  '/_protected/transactions/_provider/vouchers/_layout/opening_stock/$id'
)({
  beforeLoad: requirePermission('OPENING_STOCK_MENU_VIEW'),
  params: {
    parse: (params) => paramsSchema.parse(params),
    stringify: ({ id }) => ({ id: `${id}` }),
  },
  loader: ({ context, params: { id } }) => {
    if (id === 'new') return null
    return context.queryClient.ensureQueryData(OpeningStockQueryOptions(id))
  },
  component: RouteComponent,
  errorComponent: () => (
    <div>
      <span className='bg-red-400'>By ID:</span> Error loading opening stock.
    </div>
  ),
  pendingComponent: () => <Loader className='animate-spin' />,
})

function RouteComponent() {
  const { id } = Route.useParams()
  if (id === 'new') return <OpeningStockVoucherComponent />

  const { data: openingStock } = useSuspenseQuery(OpeningStockQueryOptions(id))
  return (
    <Suspense fallback={<Loader className='animate-spin' />}>
      <OpeningStockVoucherComponent currentRow={openingStock?.data} />
    </Suspense>
  )
}
