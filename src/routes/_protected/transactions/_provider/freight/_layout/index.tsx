import { FullPageSkeleton } from '@/components/skeleton'
import { deliveryPlaceQueryOptions } from '@/features/modules/delivery_place/data/queryOptions'
import { deliveryVehicleQueryOptions } from '@/features/modules/delivery_vehicle/data/queryOptions'
import { fetchZonesService } from '@/features/modules/godown/data/zones-api'
import { godownListSchema } from '@/features/modules/godown/data/schema'
import { stockUnitQueryOptions } from '@/features/modules/stock_unit/data/queryOptions'
import { transporterQueryOptions } from '@/features/modules/transporter/data/queryOptions'
import Freight from '@/features/modules/voucher/freight'
import { freightQueryOptions } from '@/features/modules/voucher/freight/data/queryOptions'

import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'
import { z } from 'zod'

// Define search params schema for filters and pagination
// NOTE: URL search values are always strings, so coerce to numbers — otherwise
// z.number() fails validation and .catch() silently resets page/perPage.
const freightSearchSchema = z.object({
  page: z.coerce.number().int().positive().default(1).catch(1),
  perPage: z.coerce.number().int().positive().default(10).catch(10),
  search: z.string().optional().catch(undefined),
  freightStatus: z.string().optional().catch(undefined),
  zoneId: z.coerce.number().int().positive().optional().catch(undefined),
  // Column sort, kept in the URL so a refresh / shared link keeps the order.
  sortBy: z.string().optional().catch(undefined),
  sortOrder: z.enum(['asc', 'desc']).optional().catch(undefined),
})

export type FreightSearchParams = z.infer<typeof freightSearchSchema>

export const Route = createFileRoute(
  '/_protected/transactions/_provider/freight/_layout/',
)({
  validateSearch: (search) => freightSearchSchema.parse(search),
  loader: async ({ context }) => {
    const { queryClient } = context
    // Preload static data only (dynamic freight data is loaded via useSuspenseQuery in the component)
    const results = await Promise.all([
      queryClient.ensureQueryData(stockUnitQueryOptions()),
      queryClient.ensureQueryData(deliveryPlaceQueryOptions()),
      queryClient.ensureQueryData(deliveryVehicleQueryOptions()),
      queryClient.ensureQueryData(transporterQueryOptions()),
    ])
    return {
      stockUnits: results[0]?.data,
      deliveryPlaces: results[1]?.data,
      deliveryVehicles: results[2]?.data,
      transporter: results[3]?.data,
    }
  },
  component: () => {
    const { deliveryPlaces, deliveryVehicles, transporter } =
      Route.useLoaderData()
    const search = Route.useSearch()
    const navigate = useNavigate()

    // Zones back the optional zone filter — fetched with a non-suspense query
    // (same queryKey as the delivery-note-godown-wise report, so the cache is
    // shared) so a slow/failed /zones call can never block the delivery-note
    // list itself; the dropdown simply degrades to empty.
    const { data: zonesResponse } = useQuery({
      queryKey: ['zones'],
      queryFn: fetchZonesService,
    })
    const zones = godownListSchema.parse(zonesResponse?.data ?? [])

    // Convert search params to API-friendly format (snake_case)
    const queryParams = {
      per_page: search.perPage,
      page: search.page,
      search: search.search,
      freight_status: search.freightStatus,
      zone_id: search.zoneId,
      sort_by: search.sortBy,
      sort_order: search.sortOrder,
    }

    // Non-suspense query with keepPreviousData: the filter panel and table
    // chrome stay mounted while only the data rows refetch (previous rows
    // remain visible under a loading state instead of a full-page skeleton).
    const {
      data: freightResponse,
      isPending,
      isFetching,
    } = useQuery({
      ...freightQueryOptions('delivery_note', undefined, queryParams),
      placeholderData: keepPreviousData,
    })

    const overallTotalFare = freightResponse?.aggregates?.total_fare
    const postponedCount = freightResponse?.aggregates?.postponed_count
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
      <Freight
        data={freightResponse?.data ?? []}
        isLoading={(isPending || isFetching) && !freightResponse}
        isFetching={isFetching}
        paginationMeta={paginationMeta}
        totalFareOverall={overallTotalFare}
        postponedCount={postponedCount}
        deliveryVehicles={deliveryVehicles}
        deliveryPlaces={deliveryPlaces}
        transporter={transporter}
        zones={zones}
        exportParams={queryParams}
        search={search}
        onSearchChange={(newSearch) => {
          navigate({
            to: '.',
            search: (prev) => ({ ...prev, ...newSearch }),
          })
        }}
      />
    )
  },
  errorComponent: () => <div>Error loading freight data.</div>,
  // Only shown while the loader preloads static data — the freight list itself
  // no longer suspends (keepPreviousData keeps the panel mounted instead).
  pendingComponent: () => <FullPageSkeleton />,
})
