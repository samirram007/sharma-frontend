import DeliveryRoute from '@/features/modules/delivery_route'
import { deliveryPlaceQueryOptions } from '@/features/modules/delivery_place/data/queryOptions'
import { deliveryRouteQueryOptions } from '@/features/modules/delivery_route/data/queryOptions'
import { godownQueryOptions } from '@/features/modules/godown/data/queryOptions'
import { transporterQueryOptions } from '@/features/modules/transporter/data/queryOptions'
import { Button } from '@/components/ui/button'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, useRouter } from '@tanstack/react-router'
import { Loader, RefreshCcw } from 'lucide-react'
import { Suspense } from 'react'

/** Contextual error state for the Delivery Routes list — any of the four
 * prefetched datasets failing (routes, places, transporters, godowns) lands
 * here with a retry instead of the layout's generic 500 page. Declared before
 * the route so the file's only export stays the route component. */
function DeliveryRouteError({ error }: { error: Error }) {
  const router = useRouter()
  return (
    <div className="flex h-60 flex-col items-center justify-center gap-3">
      <p className="text-sm font-medium text-destructive">
        Failed to load delivery routes.{' '}
        {error?.message ? `(${error.message})` : null}
      </p>
      <Button
        variant="outline"
        className="gap-2"
        onClick={() => router.invalidate()}
      >
        <RefreshCcw className="h-4 w-4" />
        Retry
      </Button>
    </div>
  )
}

export const Route = createFileRoute(
  '/_protected/masters/miscellaneous/_layout/delivery_routes',
)({
  loader: async ({ context }) => {
    const client = context.queryClient
    await Promise.all([
      client.ensureQueryData(transporterQueryOptions()),
      client.ensureQueryData(godownQueryOptions()),
      client.ensureQueryData(deliveryRouteQueryOptions()),
      client.ensureQueryData(deliveryPlaceQueryOptions()),
    ])
    return {
      message: 'Delivery Routes and Places data loaded',
    }
  },
  component: () => {
    const { data: state } = useSuspenseQuery(deliveryRouteQueryOptions())
    return (
      <Suspense fallback={<Loader className="animate-spin" />}>
        <DeliveryRoute data={state?.data} />
      </Suspense>
    )
  },
  errorComponent: ({ error }) => <DeliveryRouteError error={error} />,
  pendingComponent: () => <Loader className="animate-spin" />,
})
