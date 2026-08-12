import TransferVoucherVoucherComponent from '@/features/modules/voucher/transfer_voucher'
import { TransferVoucherQueryOptions } from '@/features/modules/voucher/transfer_voucher/data/queryOptions'
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
  '/_protected/transactions/_provider/vouchers/_layout/transfer_voucher/$id',
)({
  params: {
    parse: (params) => paramsSchema.parse(params),
    stringify: ({ id }) => ({ id: `${id}` }),
  },
  loader: ({ context, params: { id } }) => {
    if (id === 'new') return null
    return context.queryClient.ensureQueryData(TransferVoucherQueryOptions(id))
  },
  component: RouteComponent,
  pendingComponent: () => <Loader className="animate-spin" />,
})

function RouteComponent() {
  const { id } = Route.useParams()
  if (id === 'new') return <TransferVoucherVoucherComponent />

  const { data: transferVoucher } = useSuspenseQuery(
    TransferVoucherQueryOptions(id),
  )
  return (
    <Suspense fallback={<Loader className="animate-spin" />}>
      <TransferVoucherVoucherComponent currentRow={transferVoucher?.data} />
    </Suspense>
  )
}
