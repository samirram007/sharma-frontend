import { fiscalYearQueryOptions } from '@/features/modules/fiscal_year/data/queryOptions'
// import FiscalYearDetails from '@/features/accounts/settings/fiscalyear/details'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { Loader } from 'lucide-react'
import React, { Suspense } from 'react'
import z from 'zod'

const FiscalYearDetails = React.lazy(() =>
    import('@/features/modules/fiscal_year/details')
)
// build queryOptions for fiscalyear
const paramsSchema = z.object({
    id: z.union([
        z.literal("new"),
        z.coerce.number().refine((n) => !Number.isNaN(n), {
            message: "Invalid number",
        }),
    ]),
})
export const Route = createFileRoute(
    '/_protected/masters/organization/_layout/fiscal_year/_layout/$id',
)({
    params: {
        parse: (params) => paramsSchema.parse(params),
        stringify: ({ id }) => ({ id: `${id}` }),
    },
    loader: ({ context, params: { id } }) => {

        if (id === "new") return null
        return context.queryClient.ensureQueryData(fiscalYearQueryOptions(id))
    },
    component: () => {
        const { id } = Route.useParams()
        if (id === "new") return <FiscalYearDetails />

        const { data: fiscalyear } = useSuspenseQuery(fiscalYearQueryOptions(id))
        return <Suspense fallback={<Loader className="animate-spin" />}>
            <FiscalYearDetails data={fiscalyear?.data} />
        </Suspense>
    },
    errorComponent: () => <div> <span className='bg-red-400  '>By ID:</span> Error loading fiscalyear data. </div>
    ,
    pendingComponent: () => <Loader className="animate-spin" />,
})
