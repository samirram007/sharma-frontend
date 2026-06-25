import { companyQueryOptions } from '@/features/modules/company/data/queryOptions'
// import CompanyDetails from '@/features/accounts/settings/company/details'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { Loader } from 'lucide-react'
import React, { Suspense } from 'react'
import z from 'zod'

const CompanyDetails = React.lazy(() =>
    import('@/features/modules/company/details')
)
// build queryOptions for company
const paramsSchema = z.object({
    id: z.union([
        z.literal("new"),
        z.coerce.number().refine((n) => !Number.isNaN(n), {
            message: "Invalid number",
        }),
    ]),
})
export const Route = createFileRoute(
    '/_protected/masters/organization/_layout/company/_layout/$id',
)({
    params: {
        parse: (params) => paramsSchema.parse(params),
        stringify: ({ id }) => ({ id: `${id}` }),
    },
    loader: ({ context, params: { id } }) => {

        if (id === "new") return null
        return context.queryClient.ensureQueryData(companyQueryOptions(id))
    },
    component: () => {
        const { id } = Route.useParams()

        if (id === "new") return <CompanyDetails />

        const { data: company } = useSuspenseQuery(companyQueryOptions(id))


        return <Suspense fallback={<Loader className="animate-spin" />}>
            <CompanyDetails data={company?.data} />
        </Suspense>
    },
    errorComponent: () => <div> <span className='bg-red-400  '>By ID:</span> Error loading company data  . </div>
    ,
    pendingComponent: () => <Loader className="animate-spin" />,
})
