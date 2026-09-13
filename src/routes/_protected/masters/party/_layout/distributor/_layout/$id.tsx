import { distributorQueryOptions } from '@/features/modules/distributor/data/queryOptions'
import DistributorDetails from '@/features/modules/distributor/details'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { Loader2 } from 'lucide-react'
import z from 'zod'

// build queryOptions for distributor
const paramsSchema = z.object({
  id: z.union([
    z.literal('new'),
    z.coerce.number().refine((n) => !Number.isNaN(n), {
      message: 'Invalid number',
    }),
  ]),
})

export const Route = createFileRoute(
  '/_protected/masters/party/_layout/distributor/_layout/$id',
)({
  params: {
    parse: (params) => paramsSchema.parse(params),
    stringify: ({ id }) => ({ id: `${id}` }),
  },
  loader: ({ context, params: { id } }) => {
    if (id === 'new') return null
    return context.queryClient.ensureQueryData(distributorQueryOptions(id))
  },
  component: DistributorIdRoute,
  errorComponent: () => (
    <div className="flex h-60 flex-col items-center justify-center gap-3">
      <p className="text-sm font-medium text-destructive">
        Failed to load distributor data. The record may not exist or you may
        not have access.
      </p>
    </div>
  ),
  pendingComponent: () => (
    <div className="flex h-40 items-center justify-center">
      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
    </div>
  ),
})

function DistributorIdRoute() {
  const { id } = Route.useParams()

  // Branch before rendering so each sub-component calls hooks unconditionally.
  return id === 'new' ? (
    <DistributorDetails />
  ) : (
    <ExistingDistributorDetails id={id as number} />
  )
}

function ExistingDistributorDetails({ id }: { id: number }) {
  const { data: distributor } = useSuspenseQuery(distributorQueryOptions(id))
  return <DistributorDetails data={distributor?.data} />
}
