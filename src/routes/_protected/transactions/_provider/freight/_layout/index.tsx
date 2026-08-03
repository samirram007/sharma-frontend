import { SkeletonTable } from '@/components/skeleton';
import { deliveryPlaceQueryOptions } from '@/features/modules/delivery_place/data/queryOptions';
import { deliveryVehicleQueryOptions } from '@/features/modules/delivery_vehicle/data/queryOptions';
import { stockUnitQueryOptions } from '@/features/modules/stock_unit/data/queryOptions';
import { transporterQueryOptions } from '@/features/modules/transporter/data/queryOptions';
import Freight from '@/features/modules/voucher/freight';
import { freightQueryOptions } from '@/features/modules/voucher/freight/data/queryOptions';

import { useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Suspense, useEffect } from 'react';
import { z } from 'zod'

// Define search params schema for filters and pagination
// NOTE: URL search values are always strings, so coerce to numbers — otherwise
// z.number() fails validation and .catch() silently resets page/perPage.
const freightSearchSchema = z.object({
  page: z.coerce.number().int().positive().default(1).catch(1),
  perPage: z.coerce.number().int().positive().default(10).catch(10),
  search: z.string().optional().catch(undefined),
  freightStatus: z.string().optional().catch(undefined),
})

export type FreightSearchParams = z.infer<typeof freightSearchSchema>

export const Route = createFileRoute('/_protected/transactions/_provider/freight/_layout/')({
  validateSearch: (search) => freightSearchSchema.parse(search),
  loader: async ({ context }) => {
    const { queryClient } = context;
    // Preload static data only (dynamic freight data is loaded via useSuspenseQuery in the component)
    const results = await Promise.all([
      queryClient.ensureQueryData(stockUnitQueryOptions()),
      queryClient.ensureQueryData(deliveryPlaceQueryOptions()),
      queryClient.ensureQueryData(deliveryVehicleQueryOptions()),
      queryClient.ensureQueryData(transporterQueryOptions()),
    ]);
    return {
      stockUnits: results[0]?.data,
      deliveryPlaces: results[1]?.data,
      deliveryVehicles: results[2]?.data,
      transporter: results[3]?.data,
    };
  },
  component: () => {
    const { deliveryPlaces, deliveryVehicles, transporter } = Route.useLoaderData();
    const search = Route.useSearch()
    const navigate = useNavigate()

    // Convert search params to API-friendly format (snake_case)
    const queryParams = {
      per_page: search.perPage,
      page: search.page,
      search: search.search,
      freight_status: search.freightStatus,
    }

    const { data: freightResponse } = useSuspenseQuery(
      freightQueryOptions('delivery_note', undefined, queryParams)
    )

    const overallTotalFare = freightResponse?.aggregates?.total_fare
    // Only pass the minimal pagination meta down (current_page, last_page, per_page, total)
    const paginationMeta = freightResponse?.meta

    // If a mutation removed the last item on this page, navigate to the previous page
    useEffect(() => {
      const items = freightResponse?.data
      const currentPage = search.page
      if (items && items.length === 0 && currentPage > 1) {
        navigate({
          to: '.',
          search: (prev) => ({ ...prev, page: currentPage - 1 }),
        })
      }
    }, [freightResponse?.data, search.page, navigate])

    return (
      <Suspense fallback={<SkeletonTable />}>
        <Freight
          data={freightResponse?.data ?? []}
          paginationMeta={paginationMeta}
          totalFareOverall={overallTotalFare}
          deliveryVehicles={deliveryVehicles}
          deliveryPlaces={deliveryPlaces}
          transporter={transporter}
          search={search}
          onSearchChange={(newSearch) => {
            navigate({
              to: '.',
              search: (prev) => ({ ...prev, ...newSearch }),
            })
          }}
        />
      </Suspense>
    )
  },
  errorComponent: () => <div>Error loading freight data.</div>,
  pendingComponent: () => <SkeletonTable />,
})


