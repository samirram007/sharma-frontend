import { stateQueryOptions } from '@/features/modules/state/data/queryOptions'
import StateDetails from '@/features/modules/state/details'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { Loader2 } from 'lucide-react'
import z from 'zod'

// build queryOptions for state
const paramsSchema = z.object({
  id: z.union([
    z.literal('new'),
    z.coerce.number().refine((n) => !Number.isNaN(n), {
      message: 'Invalid number',
    }),
  ]),
})

export const Route = createFileRoute(
  '/_protected/masters/organization/_layout/state/_layout/$id',
)({
  params: {
    parse: (params) => paramsSchema.parse(params),
    stringify: ({ id }) => ({ id: `${id}` }),
  },
  loader: ({ context, params: { id } }) => {
    if (id === 'new') return null
    return context.queryClient.ensureQueryData(stateQueryOptions(id))
  },
  component: StateIdRoute,
  errorComponent: () => (
    <div className="flex h-60 flex-col items-center justify-center gap-3">
      <p className="text-sm font-medium text-destructive">
        Failed to load state data. The record may not exist or you may not have
        access.
      </p>
    </div>
  ),
  pendingComponent: () => (
    <div className="flex h-40 items-center justify-center">
      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
    </div>
  ),
})

function StateIdRoute() {
  const { id } = Route.useParams()

  // Branch before rendering so each sub-component calls hooks unconditionally.
  return id === 'new' ? (
    <StateDetails />
  ) : (
    <ExistingStateDetails id={id as number} />
  )
}

function ExistingStateDetails({ id }: { id: number }) {
  const { data: state } = useSuspenseQuery(stateQueryOptions(id))
  return <StateDetails data={state?.data} />
}
