import { Main } from '@/layouts/components/main'
import { columns } from './components/columns'
import { Dialogs } from './components/dialogs'
import { GridTable } from './components/grid-table'
import DayBookProvider from './contexts/day_book-context'
import { dayBookListSchema, type DayBookList } from './data/schema'
import type { PaginationMeta } from './types/types'

interface DayBookProps {
    data: DayBookList
    paginationMeta?: PaginationMeta
    onPageChange?: (page: number) => void
    onPageSizeChange?: (size: number) => void
    onSearchChange?: (value: string) => void
    onVoucherTypeChange?: (value: string[]) => void
    selectedVoucherTypes?: string[]
    onBillingPreferenceChange?: (value: string[]) => void
    selectedBillingPreferences?: string[]
    onStatusChange?: (value: string[]) => void
    selectedStatuses?: string[]
    onSortChange?: (sortBy: string, sortOrder: string) => void
    sorting?: import('@tanstack/react-table').SortingState
}

export default function DayBook({
    data,
    paginationMeta,
    onPageChange,
    onPageSizeChange,
    onSearchChange,
    onVoucherTypeChange,
    selectedVoucherTypes,
    onBillingPreferenceChange,
    selectedBillingPreferences,
    onStatusChange,
    selectedStatuses,
    onSortChange,
    sorting,
}: DayBookProps) {
    return (
        <DayBookProvider>
            <Main className='min-w-full'>
                <div className='mb-4 hidden flex-wrap items-start justify-between gap-3 rounded-lg border border-slate-200/70 bg-white/80 px-4 py-3 shadow-sm dark:border-white/[0.07] dark:bg-white/5'>
                    <div className='space-y-1'>
                        <h2 className='text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100'>Day Book</h2>
                        <p className='text-slate-600 dark:text-slate-400'>
                            Manage your day book.
                        </p>
                    </div>
                </div>
                <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12'>
                    <GridTable
                        data={dayBookListSchema.parse(data)}
                        columns={columns}
                        paginationMeta={paginationMeta}
                        onPageChange={onPageChange}
                        onPageSizeChange={onPageSizeChange}
                        onSearchChange={onSearchChange}
                        onVoucherTypeChange={onVoucherTypeChange}
                        selectedVoucherTypes={selectedVoucherTypes}
                        onBillingPreferenceChange={onBillingPreferenceChange}
                        selectedBillingPreferences={selectedBillingPreferences}
                        onStatusChange={onStatusChange}
                        selectedStatuses={selectedStatuses}
                        onSortChange={onSortChange}
                        sorting={sorting}
                    />
                </div>
            </Main>
            <Dialogs />
        </DayBookProvider>
    )
}