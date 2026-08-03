import { fiscalYearQueryOptions } from '@/features/modules/fiscal_year/data/queryOptions'
import { createFileRoute, Outlet } from '@tanstack/react-router'
import { Loader } from 'lucide-react'
import z from 'zod'

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
    component: () => <Outlet />,
    errorComponent: () => (
        <div>
            <span className='bg-red-400'>By ID:</span> Error loading fiscalyear data.
        </div>
    ),
    pendingComponent: () => <Loader className="animate-spin" />,
})
