import { countryQueryOptions } from '@/features/modules/country/data/queryOptions'
import CountryDetails from '@/features/modules/country/details'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { Loader2 } from 'lucide-react'
import z from 'zod'

// build queryOptions for country
const paramsSchema = z.object({
  id: z.union([
    z.literal('new'),
    z.coerce.number().refine((n) => !Number.isNaN(n), {
      message: 'Invalid number',
    }),
  ]),
})

export const Route = createFileRoute(
  '/_protected/masters/organization/_layout/country/_layout/$id',
)({
  params: {
    parse: (params) => paramsSchema.parse(params),
    stringify: ({ id }) => ({ id: `${id}` }),
  },
  loader: ({ context, params: { id } }) => {
    if (id === 'new') return null
    return context.queryClient.ensureQueryData(countryQueryOptions(id))
  },
  component: CountryIdRoute,
  errorComponent: () => (
    <div className="flex h-60 flex-col items-center justify-center gap-3">
      <p className="text-sm font-medium text-destructive">
        Failed to load country data. The record may not exist or you may not
        have access.
      </p>
    </div>
  ),
  pendingComponent: () => (
    <div className="flex h-40 items-center justify-center">
      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
    </div>
  ),
})

function CountryIdRoute() {
  const { id } = Route.useParams()

  // Branch before rendering so each sub-component calls hooks unconditionally.
  return id === 'new' ? (
    <CountryDetails />
  ) : (
    <ExistingCountryDetails id={id as number} />
  )
}

function ExistingCountryDetails({ id }: { id: number }) {
  const { data: country } = useSuspenseQuery(countryQueryOptions(id))
  return <CountryDetails data={country?.data} />
}
