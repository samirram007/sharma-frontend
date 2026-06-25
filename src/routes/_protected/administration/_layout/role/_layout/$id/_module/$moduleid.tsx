import { appModuleFeatureRoleQueryOptions } from '@/features/modules/app_module_feature/data/queryOptions'
import FeaturePermissionList from '@/features/modules/role/components/permission/feature_permission-list'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { Loader } from 'lucide-react'
import { Suspense } from 'react'
import z from 'zod'



const paramsSchema = z.object({
  id: z.union([z.literal("new"), z.coerce.number().refine((n) => !Number.isNaN(n), { message: "Invalid number", }),]),
  moduleid: z.union([z.literal("new"), z.coerce.number().refine((n) => !Number.isNaN(n), { message: "Invalid number", }),]),
})
export const Route = createFileRoute(
  '/_protected/administration/_layout/role/_layout/$id/_module/$moduleid',
)({
  params: {
    parse: (params) => paramsSchema.parse(params),
    stringify: ({ id, moduleid }) => ({ id: `${id}`, moduleid: `${moduleid}` }),
  },
  loader: ({ context, params: { id, moduleid } }) => {

    if (id === "new") return null
    if (moduleid === "new") return null
    return context.queryClient.ensureQueryData(appModuleFeatureRoleQueryOptions(id, moduleid))
  },
  component: () => {
    const { id, moduleid } = Route.useParams()
    if (id === "new") return <FeaturePermissionList />
    if (moduleid === "new") return <FeaturePermissionList />

    const { data: feature } = useSuspenseQuery(appModuleFeatureRoleQueryOptions(id, moduleid))
    return <Suspense fallback={<Loader className="animate-spin text-green-600" />}>
      <FeaturePermissionList data={feature?.data} roleId={id} moduleId={moduleid} />
    </Suspense>
  },
  errorComponent: () => <div> <span className='bg-red-400  '>By ID:</span> Error loading feature data[]. </div>
  ,
  pendingComponent: () => <Loader className="animate-spin" />,
})


