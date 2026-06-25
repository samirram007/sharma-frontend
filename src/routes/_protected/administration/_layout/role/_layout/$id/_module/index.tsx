import { getData } from '@/utils/dataClient'
import { queryOptions } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { Loader } from 'lucide-react'
import z from 'zod'

const BASE_KEY = "AppModuleFeatures"
export const appModuleFeatureRoleQueryOptions = (id?: number, moduleid?: number) => {

    return queryOptions({
        queryKey: id ? [BASE_KEY, id] : [BASE_KEY],
        queryFn: () => {
            return getData(`/role/${id}/module-features/${moduleid}`)
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
        retry: 1,
    })
}


const paramsSchema = z.object({
    id: z.union([z.literal("new"), z.coerce.number().refine((n) => !Number.isNaN(n), { message: "Invalid number", }),]),
})
export const Route = createFileRoute(
    '/_protected/administration/_layout/role/_layout/$id/_module/',
)({
    params: {
        parse: (params) => paramsSchema.parse(params),
        stringify: ({ id }) => ({ id: `${id}` }),
    },
    loader: ({ params: { id } }) => {
        if (id === "new") return null

        return
    },
    component: () => {

        return <div>Please Select a module</div>
    },
    errorComponent: () => <div> <span className='bg-red-400  '>By ID:</span> Error loading feature data[]. </div>
    ,
    pendingComponent: () => <Loader className="animate-spin" />,
})


