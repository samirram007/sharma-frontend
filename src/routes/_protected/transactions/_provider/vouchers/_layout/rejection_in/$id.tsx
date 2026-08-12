import RejectionInVoucherComponent from '@/features/modules/voucher/rejection_in'
import { RejectionInQueryOptions } from '@/features/modules/voucher/rejection_in/data/queryOptions'
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
  '/_protected/transactions/_provider/vouchers/_layout/rejection_in/$id',
)({
  params: {
    parse: (params) => paramsSchema.parse(params),
    stringify: ({ id }) => ({ id: `${id}` }),
  },
  loader: ({ context, params: { id } }) => {
    if (id === 'new') return null
    return context.queryClient.ensureQueryData(RejectionInQueryOptions(id))
  },
  component: RouteComponent,
  errorComponent: () => (
    <div>
      <span className="bg-red-400">By ID:</span> Error loading rejection in.
    </div>
  ),
  pendingComponent: () => <Loader className="animate-spin" />,
})

function RouteComponent() {
  const { id } = Route.useParams()
  if (id === 'new') return <RejectionInVoucherComponent />

  const { data: rejectionIn } = useSuspenseQuery(RejectionInQueryOptions(id))
  return (
    <Suspense fallback={<Loader className="animate-spin" />}>
      <RejectionInVoucherComponent currentRow={rejectionIn?.data} />
    </Suspense>
  )
}
