import SalesVoucherComponent from '@/features/modules/voucher/sales/index'
import { SalesQueryOptions } from '@/features/modules/voucher/sales/data/queryOptions'
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
    '/_protected/transactions/_provider/vouchers/_layout/sales/$id'
)({
    params: {
        parse: (params) => paramsSchema.parse(params),
        stringify: ({ id }) => ({ id: `${id}` }),
    },
    loader: ({ context, params: { id } }) => {
        if (id === 'new') return null
        return context.queryClient.ensureQueryData(SalesQueryOptions(id))
    },
    component: RouteComponent,
    errorComponent: () => (
        <div>
            <span className='bg-red-400'>By ID:</span> Error loading sales voucher.
        </div>
    ),
    pendingComponent: () => <Loader className='animate-spin' />,
})

function RouteComponent() {
    const { id } = Route.useParams()
    if (id === 'new') return <SalesVoucherComponent />

    const { data: sales } = useSuspenseQuery(SalesQueryOptions(id))
    return (
        <Suspense fallback={<Loader className='animate-spin' />}>
            <SalesVoucherComponent currentRow={sales?.data} />
        </Suspense>
    )
}
