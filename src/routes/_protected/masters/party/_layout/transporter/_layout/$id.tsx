import { transporterQueryOptions } from '@/features/modules/transporter/data/queryOptions'

// import TransporterDetails from '@/features/accounts/settings/transporter/details'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { Loader } from 'lucide-react'
import React, { Suspense } from 'react'
import z from 'zod'

const TransporterDetails = React.lazy(() =>
    import('@/features/modules/transporter/details')
)
// build queryOptions for transporter
const paramsSchema = z.object({
    id: z.union([
        z.literal("new"),
        z.coerce.number().refine((n) => !Number.isNaN(n), {
            message: "Invalid number",
        }),
    ]),
})
export const Route = createFileRoute(
    '/_protected/masters/party/_layout/transporter/_layout/$id',
)({
    params: {
        parse: (params) => paramsSchema.parse(params),
        stringify: ({ id }) => ({ id: `${id}` }),
    },
    loader: ({ context, params: { id } }) => {

        if (id === "new") return null
        return context.queryClient.ensureQueryData(transporterQueryOptions(id))
    },
    component: () => {
        const { id } = Route.useParams()
        if (id === "new") return <TransporterDetails />

        const { data: transporter } = useSuspenseQuery(transporterQueryOptions(id))
        return <Suspense fallback={<Loader className="animate-spin" />}>
            <TransporterDetails data={transporter?.data} />
        </Suspense>
    },
    errorComponent: () => <div> <span className='bg-red-400  '>By ID:</span> Error loading transporter data[]. </div>
    ,
    pendingComponent: () => <Loader className="animate-spin" />,
})
