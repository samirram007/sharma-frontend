

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
 
import { Main } from '@/layouts/components/main'
import ReportingPeriod from '@/features/global/components/reporting-period'

interface FreightProps {
    data: DeliveryNoteList
    isLoading?: boolean
    paginationMeta?: {
      meta?: {
        current_page?: number
        last_page?: number
        per_page?: number
        total?: number
        from?: number
        to?: number
      }
    }
    totalFareOverall?: number
    deliveryPlaces?: DeliveryPlaceList
    deliveryVehicles?: DeliveryVehicleList
    transporter?: TransporterList
    search?: FreightSearchParams
    onSearchChange?: (params: Partial<FreightSearchParams>) => void
}

export default function Freight({ data: freightListSchema, isLoading, paginationMeta, totalFareOverall, search, onSearchChange }: FreightProps) {
    const meta = paginationMeta?.meta
    const [localSearch, setLocalSearch] = useState(search?.search ?? '')
    const [localFreightStatus, setLocalFreightStatus] = useState(search?.freightStatus ?? 'pending')

    // Server-side pagination values from API response meta
    const pageCount = meta?.last_page ?? -1
    const pageIndex = meta?.current_page ? meta.current_page - 1 : 0
    const pageSize = meta?.per_page ?? 10

    // Handle page change from the grid table pagination (TanStack uses 0-indexed pageIndex)
    const handlePageChange = useCallback((newPageIndex: number, newPageSize: number) => {
      onSearchChange?.({
        page: newPageIndex + 1,
        perPage: newPageSize,
      })
    }, [onSearchChange])

    // Sync external URL params back into local state
    useEffect(() => {
      setLocalSearch(search?.search ?? '')
      setLocalFreightStatus(search?.freightStatus ?? 'pending')
    }, [search?.search, search?.freightStatus])

    const handleSearch = useCallback((searchValue: string) => {
      onSearchChange?.({
        search: searchValue || undefined,
        freightStatus: localFreightStatus || undefined,
        page: 1,
      })
    }, [localFreightStatus, onSearchChange])

    const handleReset = useCallback(() => {
      setLocalSearch('')
      setLocalFreightStatus('pending')
      onSearchChange?.({
        search: undefined,
        freightStatus: undefined,
        page: 1,
      })
    }, [onSearchChange])

    const handleFreightStatusChange = useCallback((status: string) => {
      setLocalFreightStatus(status)
      onSearchChange?.({
        freightStatus: status === 'pending' ? undefined : status,
        page: 1,
      })
    }, [onSearchChange])

   

    return (
        <Main className='min-h-full min-w-full overflow-hidden'>
            {/* Header */}
            <div className='mb-3 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200/70 bg-white/90 px-4 py-3 shadow-sm backdrop-blur-sm dark:border-white/[0.07] dark:bg-white/[0.04] sm:px-5'>
                <div className='space-y-0.5'>
                    <h2 className='text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-2xl'>
                        Freight
                    </h2>
                    <p className='text-xs text-slate-500 dark:text-slate-400 sm:text-sm'>
                        {meta?.total !== undefined
                          ? `${meta.total} delivery note${meta.total !== 1 ? 's' : ''} ${localFreightStatus === 'prepared' ? 'with freight bills' : localFreightStatus === 'all' ? 'found' : 'available for freight billing'}`
                          : localFreightStatus === 'prepared'
                            ? 'Delivery notes with freight bills'
                            : localFreightStatus === 'all'
                              ? 'All delivery notes'
                              : 'Delivery notes awaiting freight billing'}
                    </p>
                </div>
                <div className='flex items-center gap-2'>
                    <ReportingPeriod />
                </div>
            </div>

            {/* Table */}
            <div className='min-h-0 flex-1 overflow-auto rounded-xl border border-slate-200/60 bg-white shadow-xs dark:border-white/[0.06] dark:bg-white/[0.02] p-4'>
                {isLoading ? (
                    <SkeletonTable rowCount={10} colCount={6} />
                ) : freightListSchema.length === 0 ? (
                    <div className='flex flex-col items-center justify-center px-4 py-16 text-center sm:py-24'>
                        {/* Empty state illustration */}
                        <div className='mb-5 rounded-full bg-gradient-to-br from-slate-50 to-slate-100 p-6 shadow-inner dark:from-slate-800/80 dark:to-slate-900/80'>
                            <PackageOpen className='h-12 w-12 text-slate-400 dark:text-slate-500' />
                        </div>

                        {/* Title */}
                        <h3 className='text-lg font-semibold text-slate-700 dark:text-slate-300'>
                            No delivery notes available
                        </h3>

                        {/* Description */}
                        <p className='mt-2 max-w-sm text-sm leading-relaxed text-slate-400 dark:text-slate-500'>
                            {localFreightStatus === 'prepared'
                              ? 'No delivery notes with freight bills found in this period.'
                              : localFreightStatus === 'all'
                                ? 'No delivery notes found in this period.'
                                : 'All delivery notes in this period have freight bills assigned. New delivery notes will appear here when ready for billing.'}
                        </p>
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
                      />
                    </FreightProvider>
                )}
            </div>
        </Main>
    )
}
