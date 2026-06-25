
import { distributorBookQueryOptions } from '@/features/modules/voucher/distributor_book/data/queryOptions'


// import SupplierDetails from '@/features/accounts/settings/supplier/details'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { Loader } from 'lucide-react'
import React, { Suspense } from 'react'
import z from 'zod'

const DistributorBookDetails = React.lazy(() =>
    import('@/features/modules/voucher/distributor_book/details')
)
// build queryOptions for supplier
const paramsSchema = z.object({
    id: z.union([
        z.literal("new"),
        z.coerce.number().refine((n) => !Number.isNaN(n), {
            message: "Invalid number",
        }),
    ]),
})
export const Route = createFileRoute(
    '/_protected/reports/distributor_book/_layout/$id',
)({
    params: {
        parse: (params) => paramsSchema.parse(params),
        stringify: ({ id }) => ({ id: `${id}` }),
    },
    loader: ({ context, params: { id } }) => {

        if (id === "new") return null
        return context.queryClient.ensureQueryData(distributorBookQueryOptions(id))
    },
    component: () => {
        const { id } = Route.useParams()
        if (id === "new") return <DistributorBookDetails />

        const { data: distributorBookDetails } = useSuspenseQuery(distributorBookQueryOptions(id))
        //  console.log("Distributor Data: ", distributorBookDetails)
        return <Suspense fallback={<Loader className="animate-spin" />}>
            <DistributorBookDetails data={distributorBookDetails?.data} />
        </Suspense>
    },
    errorComponent: () => <div> <span className='bg-red-400  '>By ID:</span> Error loading distributor data[]. </div>
    ,
    pendingComponent: () => <Loader className="animate-spin" />,
})
