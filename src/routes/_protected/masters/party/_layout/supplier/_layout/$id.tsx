import { supplierQueryOptions } from '@/features/modules/supplier/data/queryOptions'
// import SupplierDetails from '@/features/accounts/settings/supplier/details'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { Loader } from 'lucide-react'
import React, { Suspense } from 'react'
import z from 'zod'

const SupplierDetails = React.lazy(() =>
    import('@/features/modules/supplier/details')
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
    '/_protected/masters/party/_layout/supplier/_layout/$id',
)({
    params: {
        parse: (params) => paramsSchema.parse(params),
        stringify: ({ id }) => ({ id: `${id}` }),
    },
    loader: ({ context, params: { id } }) => {

        if (id === "new") return null
        return context.queryClient.ensureQueryData(supplierQueryOptions(id))
    },
    component: () => {
        const { id } = Route.useParams()
        if (id === "new") return <SupplierDetails />

        const { data: supplier } = useSuspenseQuery(supplierQueryOptions(id))
        return <Suspense fallback={<Loader className="animate-spin" />}>
            <SupplierDetails data={supplier?.data} />
        </Suspense>
    },
    errorComponent: () => <div> <span className='bg-red-400  '>By ID:</span> Error loading supplier data[]. </div>
    ,
    pendingComponent: () => <Loader className="animate-spin" />,
})
