import JournalVoucherComponent from '@/features/modules/voucher/journal/index'
import { journalQueryOptions } from '@/features/modules/voucher/journal/data/queryOptions'
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
  '/_protected/transactions/_provider/vouchers/_layout/journal/_layout/$id',
)({
  params: {
    parse: (params) => paramsSchema.parse(params),
    stringify: ({ id }) => ({ id: `${id}` }),
  },
  loader: ({ context, params: { id } }) => {
    if (id === 'new') return null
    return context.queryClient.ensureQueryData(journalQueryOptions(id))
  },
  component: RouteComponent,
  errorComponent: () => (
    <div>
      {' '}
      <span className="bg-red-400  ">By ID:</span> Error loading journal
      voucher.{' '}
    </div>
  ),
  pendingComponent: () => <Loader className="animate-spin" />,
})

function RouteComponent() {
  const { id } = Route.useParams()
  if (id === 'new') return <JournalVoucherComponent />

  const { data: journal } = useSuspenseQuery(journalQueryOptions(id))
  return (
    <Suspense fallback={<Loader className="animate-spin" />}>
      <JournalVoucherComponent currentRow={journal?.data} />
    </Suspense>
  )
}
