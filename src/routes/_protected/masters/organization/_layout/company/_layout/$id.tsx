import DataLoadError from '@/features/errors/data-load-error'
import { companyQueryOptions } from '@/features/modules/company/data/queryOptions'
import CompanyDetails from '@/features/modules/company/details'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { Loader2 } from 'lucide-react'
import z from 'zod'

// build queryOptions for company
const paramsSchema = z.object({
  id: z.union([
    z.literal('new'),
    z.coerce.number().refine((n) => !Number.isNaN(n), {
      message: 'Invalid number',
    }),
  ]),
})

export const Route = createFileRoute(
  '/_protected/masters/organization/_layout/company/_layout/$id',
)({
  params: {
    parse: (params) => paramsSchema.parse(params),
    stringify: ({ id }) => ({ id: `${id}` }),
  },
  loader: ({ context, params: { id } }) => {
    if (id === 'new') return null
    // fetchQuery (vs ensureQueryData) refetches when the cached data is stale, so the
    // detail page always renders the latest record (e.g. a freshly saved address)
    // instead of a stale cached snapshot.
    return context.queryClient.fetchQuery(companyQueryOptions(id))
  },
  component: CompanyIdRoute,
  errorComponent: ({ error }) => (
    <DataLoadError error={error} title="Couldn't load this company" />
  ),
  pendingComponent: () => (
    <div className="flex h-40 items-center justify-center">
      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
    </div>
  ),
})

function CompanyIdRoute() {
  const { id } = Route.useParams()

  // Branch before rendering so each sub-component calls hooks unconditionally.
  return id === 'new' ? (
    <CompanyDetails />
  ) : (
    <ExistingCompanyDetails id={id as number} />
  )
}

function ExistingCompanyDetails({ id }: { id: number }) {
  const { data: company } = useSuspenseQuery(companyQueryOptions(id))
  return <CompanyDetails data={company?.data} />
}
