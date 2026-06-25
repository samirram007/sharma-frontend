import { userQueryOptions } from '@/features/modules/user/data/queryOptions'
// import UserDetails from '@/features/accounts/settings/user/details'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { Loader } from 'lucide-react'
import React, { Suspense } from 'react'
import z from 'zod'

const UserDetails = React.lazy(() =>
    import('@/features/modules/user/details')
)
// build queryOptions for user
const paramsSchema = z.object({
    id: z.union([
        z.literal("new"),
        z.coerce.number().refine((n) => !Number.isNaN(n), {
            message: "Invalid number",
        }),
    ]),
})
export const Route = createFileRoute(
    '/_protected/administration/_layout/user/_layout/$id',
)({
    params: {
        parse: (params) => paramsSchema.parse(params),
        stringify: ({ id }) => ({ id: `${id}` }),
    },
    loader: ({ context, params: { id } }) => {

        if (id === "new") return null
        return context.queryClient.ensureQueryData(userQueryOptions(id))
    },
    component: () => {
        const { id } = Route.useParams()
        if (id === "new") return <UserDetails />

        const { data: user } = useSuspenseQuery(userQueryOptions(id))
        return <Suspense fallback={<Loader className="animate-spin" />}>
            <UserDetails data={user?.data} />
        </Suspense>
    },
    errorComponent: () => <div> <span className='bg-red-400  '>By ID:</span> Error loading user data[]. </div>
    ,
    pendingComponent: () => <Loader className="animate-spin" />,
})
