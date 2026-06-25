import { storageUnitQueryOptions } from '@/features/modules/storage_unit/data/queryOptions'
// import CompanyDetails from '@/features/accounts/settings/company/details'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { Loader } from 'lucide-react'
import React, { Suspense } from 'react'
import z from 'zod'

const StorageUnitDetails = React.lazy(() =>
    import('@/features/modules/storage_unit/details')
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
    '/_protected/masters/inventory/_layout/storage_unit/_layout/$id',
)({
    params: {
        parse: (params) => paramsSchema.parse(params),
        stringify: ({ id }) => ({ id: `${id}` }),
    },
    loader: ({ context, params: { id } }) => {

        if (id === "new") return null
        return context.queryClient.ensureQueryData(storageUnitQueryOptions(id))
    },
    component: () => {
        const { id } = Route.useParams()
        if (id === "new") return <StorageUnitDetails />
        const { data: storageUnits } = useSuspenseQuery(storageUnitQueryOptions(id))
        return <Suspense fallback={<Loader className="animate-spin" />}>
            <StorageUnitDetails data={storageUnits?.data} />
        </Suspense>
    },
    errorComponent: () => <div> <span className='bg-red-400  '>By ID:</span> Error loading storage unit data[]. </div>
    ,
    pendingComponent: () => <Loader className="animate-spin" />,
})
