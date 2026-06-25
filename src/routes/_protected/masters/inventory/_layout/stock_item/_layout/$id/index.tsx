import { stockItemQueryOptions } from '@/features/modules/stock_item/data/queryOptions'
// import StockItemDetails from '@/features/accounts/settings/stockitem/details'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { Loader } from 'lucide-react'
import React, { Suspense } from 'react'
import z from 'zod'

const StockItemDetails = React.lazy(() =>
    import('@/features/modules/stock_item/details')
)
// build queryOptions for stockitem
const paramsSchema = z.object({
    id: z.union([
        z.literal("new"),
        z.coerce.number().refine((n) => !Number.isNaN(n), {
            message: "Invalid number",
        }),
    ]),
})
export const Route = createFileRoute(
    '/_protected/masters/inventory/_layout/stock_item/_layout/$id/',
)({
    params: {
        parse: (params) => paramsSchema.parse(params),
        stringify: ({ id }) => ({ id: `${id}` }),
    },
    loader: ({ context, params: { id } }) => {

        if (id === "new") return null
        return context.queryClient.ensureQueryData(stockItemQueryOptions(id))
    },
    component: () => {
        const { id } = Route.useParams()

        if (id === "new") return <StockItemDetails />

        const { data: stockItem } = useSuspenseQuery(stockItemQueryOptions(id))
        return <Suspense fallback={<Loader className="animate-spin" />}>
            <StockItemDetails data={stockItem?.data} />
        </Suspense>
    },
    errorComponent: () => <div> <span className='bg-red-400  '>By ID:</span> Error loading stockItem data[]. </div>
    ,
    pendingComponent: () => <Loader className="animate-spin" />,
})
