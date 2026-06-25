import { countryQueryOptions } from '@/features/modules/country/data/queryOptions'
// import CountryDetails from '@/features/accounts/settings/country/details'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { Loader } from 'lucide-react'
import React, { Suspense } from 'react'
import z from 'zod'

const CountryDetails = React.lazy(() =>
    import('@/features/modules/country/details')
)
// build queryOptions for country
const paramsSchema = z.object({
    id: z.union([
        z.literal("new"),
        z.coerce.number().refine((n) => !Number.isNaN(n), {
            message: "Invalid number",
        }),
    ]),
})
export const Route = createFileRoute(
    '/_protected/masters/organization/_layout/country/_layout/$id',
)({
    params: {
        parse: (params) => paramsSchema.parse(params),
        stringify: ({ id }) => ({ id: `${id}` }),
    },
    loader: ({ context, params: { id } }) => {

        if (id === "new") return null
        return context.queryClient.ensureQueryData(countryQueryOptions(id))
    },
    component: () => {
        const { id } = Route.useParams()
        if (id === "new") return <CountryDetails />

        const { data: country } = useSuspenseQuery(countryQueryOptions(id))
        return <Suspense fallback={<Loader className="animate-spin" />}>
            <CountryDetails data={country?.data} />
        </Suspense>
    },
    errorComponent: () => <div> <span className='bg-red-400  '>By ID:</span> Error loading country data[]. </div>
    ,
    pendingComponent: () => <Loader className="animate-spin" />,
})
