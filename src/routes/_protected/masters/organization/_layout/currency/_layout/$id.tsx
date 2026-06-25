import { currencyQueryOptions } from '@/features/modules/currency/data/queryOptions'
// import CurrencyDetails from '@/features/accounts/settings/currency/details'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { Loader } from 'lucide-react'
import React, { Suspense } from 'react'
import z from 'zod'

const CurrencyDetails = React.lazy(() =>
    import('@/features/modules/currency/details')
)
// build queryOptions for currency
const paramsSchema = z.object({
    id: z.union([
        z.literal("new"),
        z.coerce.number().refine((n) => !Number.isNaN(n), {
            message: "Invalid number",
        }),
    ]),
})
export const Route = createFileRoute(
    '/_protected/masters/organization/_layout/currency/_layout/$id',
)({
    params: {
        parse: (params) => paramsSchema.parse(params),
        stringify: ({ id }) => ({ id: `${id}` }),
    },
    loader: ({ context, params: { id } }) => {

        if (id === "new") return null
        return context.queryClient.ensureQueryData(currencyQueryOptions(id))
    },
    component: () => {
        const { id } = Route.useParams()
        if (id === "new") return <CurrencyDetails />

        const { data: currency } = useSuspenseQuery(currencyQueryOptions(id))
        return <Suspense fallback={<Loader className="animate-spin" />}>
            <CurrencyDetails data={currency?.data} />
        </Suspense>
    },
    errorComponent: () => <div> <span className='bg-red-400  '>By ID:</span> Error loading currency data[]. </div>
    ,
    pendingComponent: () => <Loader className="animate-spin" />,
})
