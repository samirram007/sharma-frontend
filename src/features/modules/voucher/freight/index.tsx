import { useCallback, useEffect, useState } from 'react'

import { PackageOpen } from 'lucide-react'
import { SkeletonTable } from '@/components/skeleton'
import { GridTable } from './components/grid-table'
import { columns } from './components/columns'
import FreightProvider from './contexts/freight-context'
import type { FreightSearchParams } from '@/routes/_protected/transactions/_provider/freight/_layout/index'
import type { TransporterList } from '../../transporter/data/schema'
import type { DeliveryVehicleList } from '../../delivery_vehicle/data/schema'
import type { DeliveryPlaceList } from '../../delivery_place/data/schema'
import type { DeliveryNoteList } from '../delivery_note/data/schema'
import type { GodownList } from '@/features/modules/godown/data/schema'
import type { FreightQueryParams } from './data/api'
import type { PaginationMeta } from './data/schema'

import { Main } from '@/layouts/components/main'
import ReportingPeriod from '@/features/global/components/reporting-period'

interface FreightProps {
  data: DeliveryNoteList
  isLoading?: boolean
  paginationMeta?: PaginationMeta
  totalFareOverall?: number
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

  const handleSearch = useCallback(
    (searchValue: string) => {
      onSearchChange?.({
        search: searchValue || undefined,
        freightStatus: localFreightStatus || undefined,
        zoneId: localZoneId,
        page: 1,
      })
    },
    [localFreightStatus, localZoneId, onSearchChange],
  )

  const handleReset = useCallback(() => {
    setLocalSearch('')
    setLocalFreightStatus('pending')
    setLocalZoneId(undefined)
    onSearchChange?.({
      search: undefined,
      freightStatus: undefined,
      zoneId: undefined,
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
          <p className="text-xs text-muted-foreground sm:text-sm">
            {meta?.total !== undefined
              ? `${meta.total} delivery note${meta.total !== 1 ? 's' : ''} ${localFreightStatus === 'prepared' ? 'with fare entered' : localFreightStatus === 'all' ? 'found' : 'awaiting fare entry'}`
              : localFreightStatus === 'prepared'
                ? 'Delivery notes with fare entered'
                : localFreightStatus === 'all'
                  ? 'All delivery notes'
                  : 'Delivery notes awaiting fare entry'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ReportingPeriod disableHotkey />
        </div>
      </div>

      {/* Table */}
      <div className="min-h-0 flex-1 overflow-auto rounded-xl border border-border bg-card shadow-xs p-4">
        {isLoading ? (
          <SkeletonTable rowCount={10} colCount={6} />
        ) : freightListSchema.length === 0 ? (
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
                : localFreightStatus === 'all'
                  ? 'No delivery notes found in this period.'
                  : 'All delivery notes in this period have their fare entered. New delivery notes will appear here once their dispatch details are filled in.'}
            </p>

            {(localSearch || localZoneId || localFreightStatus !== 'pending') && (
              <button
                onClick={handleReset}
                className="mt-4 rounded-lg border border-border bg-background px-4 py-2 text-xs font-medium text-muted-foreground shadow-xs transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <FreightProvider>
            <GridTable
              columns={columns}
              data={freightListSchema as any}
              pageCount={pageCount}
              pageIndex={pageIndex}
              pageSize={pageSize}
              totalRecords={meta?.total}
              totalFareOverall={totalFareOverall}
              onPageChange={handlePageChange}
              search={localSearch}
              onSearchChange={(value) => setLocalSearch(value)}
              onSearch={() => handleSearch(localSearch)}
              onReset={handleReset}
              freightStatus={localFreightStatus}
              onFreightStatusChange={handleFreightStatusChange}
              zones={zones}
              zoneId={localZoneId}
              onZoneChange={handleZoneChange}
              exportParams={exportParams}
            />
          </FreightProvider>
        )}
      </div>
    </Main>
  )
}
