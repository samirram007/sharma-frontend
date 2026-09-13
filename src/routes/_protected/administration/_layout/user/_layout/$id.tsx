import { userQueryOptions } from '@/features/modules/user/data/queryOptions'
import UserDetails from '@/features/modules/user/details'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import { Loader2 } from 'lucide-react'
import z from 'zod'

const paramsSchema = z.object({
  id: z.union([
    z.literal('new'),
    z.coerce.number().refine((n) => !Number.isNaN(n), {
      message: 'Invalid number',
    }),
  ]),
})

export const Route = createFileRoute(
  '/_protected/administration/_layout/user/_layout/$id',
)({
  params: {
    parse: (params) => paramsSchema.parse(params),
    stringify: ({ id }) => ({ id: `${id}` }),
  },
  loader: ({ context, params: { id } }) => {
    if (id === 'new') return null
    return context.queryClient.ensureQueryData(userQueryOptions(id))
  },
  component: UserIdRoute,
  errorComponent: UserError,
  pendingComponent: () => (
    <div className="flex h-40 items-center justify-center">
      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
    </div>
  ),
})

function UserIdRoute() {
  const { id } = Route.useParams()

  // Branch before rendering so each sub-component calls hooks unconditionally.
  return id === 'new' ? (
    <UserDetails />
  ) : (
    <ExistingUserDetails id={id as number} />
  )
}

function ExistingUserDetails({ id }: { id: number }) {
  const { data: user } = useSuspenseQuery(userQueryOptions(id))
  return <UserDetails data={user?.data} />
}

function UserError() {
  return (
    <div className="flex h-60 flex-col items-center justify-center gap-3">
      <p className="text-sm font-medium text-destructive">
        Failed to load user data. The user may not exist or you may not have
        access.
      </p>
      <Link
        to="/administration/user"
        className="text-sm font-medium text-primary underline-offset-4 hover:underline"
      >
        Back to user list
      </Link>
    </div>
  )
}
