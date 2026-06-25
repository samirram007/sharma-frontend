
import { deliveryVehicleQueryOptions } from '@/features/modules/delivery_vehicle/data/queryOptions'
import DeliveryVehicle from '@/features/modules/delivery_vehicle'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { Loader } from 'lucide-react'
import { Suspense } from 'react'

export const Route = createFileRoute(
  '/_protected/masters/miscellaneous/_layout/delivery_vehicles',
)({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(deliveryVehicleQueryOptions()),
  component: () => {
    const { data: state } = useSuspenseQuery(deliveryVehicleQueryOptions())
    return (
      <Suspense fallback={<Loader className="animate-spin" />}>

        <DeliveryVehicle data={state?.data} />
      </Suspense>
    )
  },
  errorComponent: () => <div>Error loading  data...</div>,
  pendingComponent: () => <Loader className="animate-spin" />,
})

