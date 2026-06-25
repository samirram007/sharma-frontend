import { employeeQueryOptions } from '@/features/modules/employee/data/queryOptions'
// import EmployeeDetails from '@/features/accounts/settings/employee/details'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { Loader } from 'lucide-react'
import React, { Suspense } from 'react'
import z from 'zod'

const EmployeeDetails = React.lazy(() =>
    import('@/features/modules/employee/details')
)
// build queryOptions for employee
const paramsSchema = z.object({
    id: z.union([
        z.literal("new"),
        z.coerce.number().refine((n) => !Number.isNaN(n), {
            message: "Invalid number",
        }),
    ]),
})
export const Route = createFileRoute(
    '/_protected/masters/payroll/_layout/employee/_layout/$id',
)({
    params: {
        parse: (params) => paramsSchema.parse(params),
        stringify: ({ id }) => ({ id: `${id}` }),
    },
    loader: ({ context, params: { id } }) => {

        if (id === "new") return null
        return context.queryClient.ensureQueryData(employeeQueryOptions(id))
    },
    component: () => {
        const { id } = Route.useParams()
        if (id === "new") return <EmployeeDetails />

        const { data: employee } = useSuspenseQuery(employeeQueryOptions(id))
        return <Suspense fallback={<Loader className="animate-spin" />}>
            <EmployeeDetails data={employee?.data} />
        </Suspense>
    },
    errorComponent: () => <div> <span className='bg-red-400  '>By ID:</span> Error loading employee data[]. </div>
    ,
    pendingComponent: () => <Loader className="animate-spin" />,
})
