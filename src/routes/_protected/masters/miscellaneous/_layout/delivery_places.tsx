import DeliveryPlace from '@/features/modules/delivery_place'
import { deliveryPlaceQueryOptions } from '@/features/modules/delivery_place/data/queryOptions'
import { Button } from '@/components/ui/button'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, useRouter } from '@tanstack/react-router'
import { Loader, RefreshCcw } from 'lucide-react'
import { Suspense } from 'react'

/** Contextual error state for the Delivery Places list — offers a retry
 * instead of the layout's generic 500 page. Declared before the route so the
 * file's only export stays the route component (react-refresh friendly). */
function DeliveryPlaceError({ error }: { error: Error }) {
  const router = useRouter()
  return (
    <div className="flex h-60 flex-col items-center justify-center gap-3">
      <p className="text-sm font-medium text-destructive">
        Failed to load delivery places.{' '}
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
  '/_protected/masters/miscellaneous/_layout/delivery_places',
)({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(deliveryPlaceQueryOptions()),
  component: () => {
    const { data: state } = useSuspenseQuery(deliveryPlaceQueryOptions())
    return (
      <Suspense fallback={<Loader className="animate-spin" />}>
        <DeliveryPlace data={state?.data} />
      </Suspense>
    )
  },
  errorComponent: ({ error }) => <DeliveryPlaceError error={error} />,
  pendingComponent: () => <Loader className="animate-spin" />,
})
