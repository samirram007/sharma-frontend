import NotFoundError from '@/features/errors/not-found-error'
import { appModuleQueryOptions } from '@/features/modules/app_module/data/queryOptions'
import RolePermissionProvider from '@/features/modules/role/components/permission/contexts/role_permission-context'
import { roleQueryOptions } from '@/features/modules/role/data/queryOptions'
import RolePermissionLayout from '@/features/modules/role/role_permission-layout'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { Loader } from 'lucide-react'
import z from 'zod'


const paramsSchema = z.object({
    id: z.union([
        z.literal("new"),
        z.coerce.number().refine((n) => !Number.isNaN(n), {
            message: "Invalid number",
        }),
    ]),
})
export const Route = createFileRoute(
    '/_protected/administration/_layout/role/_layout/$id/_module',
)({
    params: {
        parse: (params) => paramsSchema.parse(params),
        stringify: ({ id }) => ({ id: `${id}` }),
    },
    loader: async ({ context, params: { id } }) => {

        if (id === "new") return null
        await context.queryClient.ensureQueryData(roleQueryOptions(id))
        await context.queryClient.ensureQueryData(appModuleQueryOptions())
        return null
    },
    component: () => {
        const { id } = Route.useParams()
        if (id === "new") return <NotFoundError />
        const { data: modules } = useSuspenseQuery(appModuleQueryOptions())
        const { data: role } = useSuspenseQuery(roleQueryOptions(id))
        return (
            <RolePermissionProvider>
                <RolePermissionLayout modules={modules?.data} role={role?.data} />
            </RolePermissionProvider>
        )
    },
    errorComponent: () => <div> <span className='bg-red-400  '>Layout:</span> Error loading module data[]. </div>
    ,
    pendingComponent: () => <Loader className="animate-spin" />,
})


