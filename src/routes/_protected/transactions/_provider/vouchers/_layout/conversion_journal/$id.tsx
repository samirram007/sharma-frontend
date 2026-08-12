import ConversionJournalVoucherComponent from '@/features/modules/voucher/conversion_journal'
import { ConversionJournalQueryOptions } from '@/features/modules/voucher/conversion_journal/data/queryOptions'
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
  '/_protected/transactions/_provider/vouchers/_layout/conversion_journal/$id',
)({
  params: {
    parse: (params) => paramsSchema.parse(params),
    stringify: ({ id }) => ({ id: `${id}` }),
  },
  loader: ({ context, params: { id } }) => {
    if (id === 'new') return null
    return context.queryClient.ensureQueryData(
      ConversionJournalQueryOptions(id),
    )
  },
  component: RouteComponent,
  errorComponent: () => (
    <div>
      <span className="bg-red-400">By ID:</span> Error loading conversion
      journal.
    </div>
  ),
  pendingComponent: () => <Loader className="animate-spin" />,
})

function RouteComponent() {
  const { id } = Route.useParams()
  if (id === 'new') return <ConversionJournalVoucherComponent />

  const { data: conversionJournal } = useSuspenseQuery(
    ConversionJournalQueryOptions(id),
  )
  return (
    <Suspense fallback={<Loader className="animate-spin" />}>
      <ConversionJournalVoucherComponent currentRow={conversionJournal?.data} />
    </Suspense>
  )
}
