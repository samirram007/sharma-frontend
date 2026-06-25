import CreditNoteVoucherComponent from '@/features/modules/voucher/credit_note'
import { CreditNoteQueryOptions } from '@/features/modules/voucher/credit_note/data/queryOptions'
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
    '/_protected/transactions/_provider/vouchers/_layout/credit_note/$id'
)({
    params: {
        parse: (params) => paramsSchema.parse(params),
        stringify: ({ id }) => ({ id: `${id}` }),
    },
    loader: ({ context, params: { id } }) => {
        if (id === 'new') return null
        return context.queryClient.ensureQueryData(CreditNoteQueryOptions(id))
    },
    component: RouteComponent,
    errorComponent: () => (
        <div>
            <span className='bg-red-400'>By ID:</span> Error loading credit note.
        </div>
    ),
    pendingComponent: () => <Loader className='animate-spin' />,
})

function RouteComponent() {
    const { id } = Route.useParams()
    if (id === 'new') return <CreditNoteVoucherComponent />

    const { data: creditNote } = useSuspenseQuery(CreditNoteQueryOptions(id))
    return (
        <Suspense fallback={<Loader className='animate-spin' />}>
            <CreditNoteVoucherComponent currentRow={creditNote?.data} />
        </Suspense>
    )
}
