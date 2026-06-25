import { distributorQueryOptions } from '@/features/modules/distributor/data/queryOptions'
// import DistributorDetails from '@/features/accounts/settings/distributor/details'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { Loader } from 'lucide-react'
import React, { Suspense } from 'react'
import z from 'zod'

const DistributorDetails = React.lazy(() =>
    import('@/features/modules/distributor/details')
)
// build queryOptions for distributor
const paramsSchema = z.object({
    id: z.union([
        z.literal("new"),
        z.coerce.number().refine((n) => !Number.isNaN(n), {
            message: "Invalid number",
        }),
    ]),
})
export const Route = createFileRoute(
    '/_protected/masters/party/_layout/distributor/_layout/$id',
)({
    params: {
        parse: (params) => paramsSchema.parse(params),
        stringify: ({ id }) => ({ id: `${id}` }),
    },
    loader: ({ context, params: { id } }) => {

        if (id === "new") return null
        return context.queryClient.ensureQueryData(distributorQueryOptions(id))
    },
    component: () => {
        const { id } = Route.useParams()
        if (id === "new") return <DistributorDetails />

        const { data: distributor } = useSuspenseQuery(distributorQueryOptions(id))
        return <Suspense fallback={<Loader className="animate-spin" />}>
            <DistributorDetails data={distributor?.data} />
        </Suspense>
    },
    errorComponent: () => <div> <span className='bg-red-400  '>By ID:</span> Error loading distributor data[]. </div>
    ,
    pendingComponent: () => <Loader className="animate-spin" />,
})
