import { stateQueryOptions } from '@/features/modules/state/data/queryOptions'
// import StateDetails from '@/features/accounts/settings/state/details'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { Loader } from 'lucide-react'
import React, { Suspense } from 'react'
import z from 'zod'

const StateDetails = React.lazy(() =>
    import('@/features/modules/state/details')
)
// build queryOptions for state
const paramsSchema = z.object({
    id: z.union([
        z.literal("new"),
        z.coerce.number().refine((n) => !Number.isNaN(n), {
            message: "Invalid number",
        }),
    ]),
})
export const Route = createFileRoute(
    '/_protected/masters/organization/_layout/state/_layout/$id',
)({
    params: {
        parse: (params) => paramsSchema.parse(params),
        stringify: ({ id }) => ({ id: `${id}` }),
    },
    loader: ({ context, params: { id } }) => {

        if (id === "new") return null
        return context.queryClient.ensureQueryData(stateQueryOptions(id))
    },
    component: () => {
        const { id } = Route.useParams()
        if (id === "new") return <StateDetails />

        const { data: state } = useSuspenseQuery(stateQueryOptions(id))
        return <Suspense fallback={<Loader className="animate-spin" />}>
            <StateDetails data={state?.data} />
        </Suspense>
    },
    errorComponent: () => <div> <span className='bg-red-400  '>By ID:</span> Error loading state data[]. </div>
    ,
    pendingComponent: () => <Loader className="animate-spin" />,
})
