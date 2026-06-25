import { deliveryPlaceQueryOptions } from '@/features/modules/delivery_place/data/queryOptions';
import { deliveryVehicleQueryOptions } from '@/features/modules/delivery_vehicle/data/queryOptions';
import { stockUnitQueryOptions } from '@/features/modules/stock_unit/data/queryOptions';
import { transporterQueryOptions } from '@/features/modules/transporter/data/queryOptions';
import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/_protected/transactions/_provider/vouchers/_layout/delivery_note/_layout',
)({
  loader: async ({ context }) => {
    const { queryClient } = context;

    const [stockUnits, deliveryPlaces, deliveryVehicles, transporter] = await Promise.all([

      queryClient.ensureQueryData(stockUnitQueryOptions()),
      queryClient.ensureQueryData(deliveryPlaceQueryOptions()),
      queryClient.ensureQueryData(deliveryVehicleQueryOptions()),
      queryClient.ensureQueryData(transporterQueryOptions()),
    ]);

    return { stockUnits, deliveryPlaces, deliveryVehicles, transporter };
  },
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <>
      <Outlet />
    </>
  )
}
