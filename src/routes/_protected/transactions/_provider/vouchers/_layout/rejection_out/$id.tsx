import RejectionOutVoucherComponent from '@/features/modules/voucher/rejection_out'
import { RejectionOutQueryOptions } from '@/features/modules/voucher/rejection_out/data/queryOptions'
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
    '/_protected/transactions/_provider/vouchers/_layout/rejection_out/$id'
)({
    params: {
        parse: (params) => paramsSchema.parse(params),
        stringify: ({ id }) => ({ id: `${id}` }),
    },
    loader: ({ context, params: { id } }) => {
        if (id === 'new') return null
        return context.queryClient.ensureQueryData(RejectionOutQueryOptions(id))
    },
    component: RouteComponent,
    pendingComponent: () => <Loader className='animate-spin' />,
})

function RouteComponent() {
    const { id } = Route.useParams()
    if (id === 'new') return <RejectionOutVoucherComponent />

    const { data: rejectionOut } = useSuspenseQuery(RejectionOutQueryOptions(id))
    return (
        <Suspense fallback={<Loader className='animate-spin' />}>
            <RejectionOutVoucherComponent currentRow={rejectionOut?.data} />
        </Suspense>
    )
}
