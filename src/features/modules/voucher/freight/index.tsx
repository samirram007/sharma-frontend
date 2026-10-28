import { useCallback, useEffect, useState } from 'react'

import { Lock, PackageOpen } from 'lucide-react'
import { SkeletonTable } from '@/components/skeleton'
import { GridTable } from './components/grid-table'
import { columns } from './components/columns'
import FreightProvider from './contexts/freight-context'
import { Dialogs } from './components/dialogs'
import type { FreightSearchParams } from '@/routes/_protected/transactions/_provider/freight/_layout/index'
import type { TransporterList } from '../../transporter/data/schema'
import type { DeliveryVehicleList } from '../../delivery_vehicle/data/schema'
import type { DeliveryPlaceList } from '../../delivery_place/data/schema'
import type { DeliveryNoteList } from '../delivery_note/data/schema'
import type { GodownList } from '@/features/modules/godown/data/schema'
import type { FreightQueryParams } from './data/api'
import type { PaginationMeta } from './data/schema'
import type { SortingState } from '@tanstack/react-table'

import { Main } from '@/layouts/components/main'
interface FreightProps {
  data: DeliveryNoteList
  /** True only before the first page of data has arrived. */
  isLoading?: boolean
  /** True while any freight query is in flight (incl. background refetches). */
  isFetching?: boolean
  paginationMeta?: PaginationMeta
  totalFareOverall?: number
  /** Postponed (locked) deliveries in the current scope — header counter. */
  postponedCount?: number
  deliveryPlaces?: DeliveryPlaceList
  deliveryVehicles?: DeliveryVehicleList
  transporter?: TransporterList
  zones?: GodownList
  exportParams?: FreightQueryParams
  search?: FreightSearchParams
  onSearchChange?: (params: Partial<FreightSearchParams>) => void
}

export default function Freight({
  data: freightListSchema,
  isLoading,
  paginationMeta,
  totalFareOverall,
  postponedCount,
  zones,
  exportParams,
  search,
  onSearchChange,
}: FreightProps) {
  const meta = paginationMeta
  const [localSearch, setLocalSearch] = useState(search?.search ?? '')
  const [localFreightStatus, setLocalFreightStatus] = useState(
    search?.freightStatus ?? 'pending',
  )
  const [localZoneId, setLocalZoneId] = useState<number | undefined>(
    search?.zoneId,
  )

  // Server-side sort: the URL carries the API field (snake_case), the table
  // expects the column id — map back so the header shows the active arrow.
  const sortFieldReverseMap: Record<string, string> = {
    voucher_date: 'voucherDate',
    voucher_no: 'voucherNo',
    party: 'partyName',
  }
  const sorting: SortingState = search?.sortBy
    ? [
        {
          id: sortFieldReverseMap[search.sortBy] ?? search.sortBy,
          desc: search.sortOrder === 'desc',
        },
      ]
    : []

  const handleSortChange = useCallback(
    (sortBy: string, sortOrder: string) => {
      onSearchChange?.({
        sortBy: sortBy || undefined,
        sortOrder:
          sortOrder === 'asc' || sortOrder === 'desc' ? sortOrder : undefined,
        page: 1,
      })
    },
    [onSearchChange],
  )

  // Server-side pagination values from API response meta
  const pageCount = meta?.last_page ?? 1
  const pageIndex = meta?.current_page ? meta.current_page - 1 : 0
  const pageSize = meta?.per_page ?? 10

  // Handle page change from the grid table pagination (TanStack uses 0-indexed pageIndex)
  const handlePageChange = useCallback(
    (newPageIndex: number, newPageSize: number) => {
      onSearchChange?.({
        page: newPageIndex + 1,
        perPage: newPageSize,
      })
    },
    [onSearchChange],
  )

  // Sync external URL params back into local state
  useEffect(() => {
    setLocalSearch(search?.search ?? '')
    setLocalFreightStatus(search?.freightStatus ?? 'pending')
    setLocalZoneId(search?.zoneId)
  }, [search?.search, search?.freightStatus, search?.zoneId])

  // Debounced auto-search: committing the text search as the user types (they
  // no longer need to press Enter). Status/zone filters commit
  // immediately as before.
  useEffect(() => {
    const currentUrlSearch = search?.search ?? ''
    if (localSearch === currentUrlSearch) return
    const timer = setTimeout(() => {
      onSearchChange?.({
        search: localSearch || undefined,
        page: 1,
      })
    }, 400)
    return () => clearTimeout(timer)
  }, [localSearch, search?.search, onSearchChange])

  const handleReset = useCallback(() => {
    setLocalSearch('')
    setLocalFreightStatus('pending')
    setLocalZoneId(undefined)
    onSearchChange?.({
      search: undefined,
      freightStatus: undefined,
      zoneId: undefined,
      sortBy: undefined,
      sortOrder: undefined,
      page: 1,
    })
  }, [onSearchChange])

  const handleFreightStatusChange = useCallback(
    (status: string) => {
      setLocalFreightStatus(status)
      onSearchChange?.({
        freightStatus: status === 'pending' ? undefined : status,
        page: 1,
      })
    },
    [onSearchChange],
  )

  const handleZoneChange = useCallback(
    (zoneId?: number) => {
      setLocalZoneId(zoneId)
      onSearchChange?.({
        zoneId: zoneId || undefined,
        page: 1,
      })
    },
    [onSearchChange],
  )

  return (
    <Main className="min-h-full min-w-full overflow-hidden">
      {/* Header */}
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card/80 px-4 py-3 shadow-sm backdrop-blur-sm sm:px-5">
        <div className="space-y-0.5">
          <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            Freight
          </h2>
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-xs text-muted-foreground sm:text-sm">
              {meta?.total !== undefined
                ? `${meta.total} delivery note${meta.total !== 1 ? 's' : ''} ${
                    localFreightStatus === 'prepared'
                      ? 'with fare entered'
                      : localFreightStatus === 'locked'
                        ? 'postponed'
                        : localFreightStatus === 'all'
                          ? 'found'
                          : 'awaiting fare entry'
                  }`
                : localFreightStatus === 'prepared'
                  ? 'Delivery notes with fare entered'
                  : localFreightStatus === 'locked'
                    ? 'Postponed (locked) delivery notes'
                    : localFreightStatus === 'all'
                      ? 'All delivery notes'
                      : 'Delivery notes awaiting fare entry'}
            </p>

            {/* Postponed counter — click to jump to the Postponed filter. */}
            {postponedCount !== undefined && postponedCount > 0 && (
              <button
                type="button"
                onClick={() =>
                  onSearchChange?.({ freightStatus: 'locked', page: 1 })
                }
                title="Show postponed (locked) deliveries"
                className="inline-flex items-center gap-1 rounded-full border border-rose-200 bg-rose-50 px-2 py-0.5 text-[11px] font-semibold text-rose-700 transition-colors hover:bg-rose-100 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300 dark:hover:bg-rose-950/70"
              >
                <Lock className="h-3 w-3" />
                {postponedCount} postponed
              </button>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2"></div>
      </div>

      {/* Table */}
      <div className="min-h-0 flex-1 overflow-auto rounded-xl border border-border bg-card shadow-xs p-4">
        {isLoading ? (
          <SkeletonTable rowCount={10} colCount={6} />
        ) : (
          <FreightProvider>
            <GridTable
              columns={columns}
              data={freightListSchema as any}
              // Rows are intentionally NOT skeletonized during background
              // refetches: the route query uses keepPreviousData, so the
              // previous rows stay accurate while the refetch runs. Swapping
              // the body for skeletons unmounted BillCell and threw away the
              // Freight Bill print dialog it had just opened (the mutation's
              // own invalidation triggers that refetch).
              emptyState={
                <div className="flex flex-col items-center justify-center px-4 py-16 text-center sm:py-24">
                  {/* Empty state illustration */}
                  <div className="mb-5 rounded-full bg-muted p-6 shadow-inner">
                    <PackageOpen className="h-12 w-12 text-muted-foreground" />
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-semibold text-foreground">
                    No delivery notes available
                  </h3>

                  {/* Description */}
                  <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
                    {localFreightStatus === 'prepared'
                      ? 'No delivery notes with fare entered found in this period.'
                      : localFreightStatus === 'locked'
                        ? 'No deliveries are postponed in this period.'
                        : localFreightStatus === 'all'
                          ? 'No delivery notes found in this period.'
                          : 'All delivery notes in this period have their fare entered. New delivery notes will appear here once their dispatch details are filled in.'}
                  </p>

                  {(localSearch ||
                    localZoneId ||
                    localFreightStatus !== 'pending') && (
                    <button
                      onClick={handleReset}
                      className="mt-4 rounded-lg border border-border bg-background px-4 py-2 text-xs font-medium text-muted-foreground shadow-xs transition-colors hover:bg-accent hover:text-accent-foreground"
                    >
                      Clear filters
                    </button>
                  )}
                </div>
              }
              pageCount={pageCount}
              pageIndex={pageIndex}
              pageSize={pageSize}
              totalRecords={meta?.total}
              totalFareOverall={totalFareOverall}
              onPageChange={handlePageChange}
              search={localSearch}
              onSearchChange={(value) => setLocalSearch(value)}
              onReset={handleReset}
              freightStatus={localFreightStatus}
              onFreightStatusChange={handleFreightStatusChange}
              zones={zones}
              zoneId={localZoneId}
              onZoneChange={handleZoneChange}
              exportParams={exportParams}
              sorting={sorting}
              onSortChange={handleSortChange}
            />
            <Dialogs />
          </FreightProvider>
        )}
      </div>
    </Main>
  )
}
