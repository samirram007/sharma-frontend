import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  DoubleArrowLeftIcon,
  DoubleArrowRightIcon,
} from '@radix-ui/react-icons'
import {
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type RowData,
  type SortingState,
  type VisibilityState,
} from '@tanstack/react-table'
import { useState } from 'react'
import type { DayBookSchema } from '../data/schema'
import { DataTableToolbar } from './data-table-toolbar'
import type { PaginationMeta } from '../types/types'


declare module '@tanstack/react-table' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData extends RowData, TValue> {
    className: string
  }
}

interface DataTableProps {
  columns: ColumnDef<DayBookSchema>[]
  data: DayBookSchema[]
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
  sorting?: SortingState
}

export function GridTable({
  columns,
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
  sorting = [],
}: DataTableProps) {
  const [rowSelection, setRowSelection] = useState({})
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({ select: false })
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])

  const pageCount = paginationMeta ? Math.ceil(paginationMeta.total / paginationMeta.per_page) : 0
  const currentPage = paginationMeta?.current_page ?? 1
  const pageSize = paginationMeta?.per_page ?? 10
  const canPrevious = currentPage > 1
  const canNext = currentPage < pageCount

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      pagination: {
        pageIndex: currentPage - 1,
        pageSize,
      },
    },
    pageCount,
    filterFns: {
      fuzzy: (row, columnId, value) => {
        const columnValue = row.getValue(columnId)
        return columnValue && typeof columnValue === 'string'
          ? columnValue.toLowerCase().includes(value.toLowerCase())
          : false
      },
    },
    enableRowSelection: false,
    onRowSelectionChange: setRowSelection,
    onSortingChange: (updater) => {
      const newSorting = typeof updater === 'function' ? updater(sorting) : updater
      if (newSorting.length > 0) {
        const sortField = newSorting[0].id
        const sortDir = newSorting[0].desc ? 'desc' : 'asc'
        // Map column id to backend sort field
        const sortMap: Record<string, string> = {
          billingPreference: 'billing_preference',
        }
        const backendSortBy = sortMap[sortField] ?? sortField
        onSortChange?.(backendSortBy, sortDir)
      } else {
        onSortChange?.('', '')
      }
    },
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    manualPagination: true,
    manualSorting: true,
    onPaginationChange: (updater) => {
      if (typeof updater === 'function') {
        const current = {
          pageIndex: currentPage - 1,
          pageSize,
        }
        const next = updater(current)
        if (next.pageIndex !== current.pageIndex) {
          onPageChange?.(next.pageIndex + 1)
        }
        if (next.pageSize !== current.pageSize) {
          onPageSizeChange?.(next.pageSize)
        }
      }
    },
  })

  const exportColumnsData = table.getVisibleLeafColumns().map((col) => ({
    header:
      typeof col.columnDef.header === 'string' ? col.columnDef.header : col.id,
    accessor: col.id as keyof DayBookSchema,
  }))
  const keyName = 'Day Book'

  const totalVouchers = paginationMeta?.total ?? 0
  const fromRecord = paginationMeta?.from ?? 0
  const toRecord = paginationMeta?.to ?? 0

  return (
    <div className='space-y-4'>
      <DataTableToolbar table={table}
        placeHolder={`Filter ${keyName} records...`}
        filteredRows={data}
        exportColumnsData={exportColumnsData}        onSearchChange={onSearchChange}
                        onVoucherTypeChange={onVoucherTypeChange}
                        selectedVoucherTypes={selectedVoucherTypes}
                        onBillingPreferenceChange={onBillingPreferenceChange}
                        selectedBillingPreferences={selectedBillingPreferences}
                        onStatusChange={onStatusChange}
                        selectedStatuses={selectedStatuses}
      />
      <div className='flex items-center justify-between gap-4 px-2'>
        <div className='text-sm text-muted-foreground'>
          Total Vouchers: <span className='font-semibold'>{totalVouchers}</span>
          {totalVouchers > 0 && (
            <span className='ml-2'>
              (Showing {fromRecord}–{toRecord})
            </span>
          )}
        </div>
        <div className='flex items-center gap-4'>
          <div className='flex items-center gap-2'>
            <p className='text-sm text-muted-foreground whitespace-nowrap'>Rows per page</p>
            <Select
              value={`${pageSize}`}
              onValueChange={(value) => {
                onPageSizeChange?.(Number(value))
              }}
            >
              <SelectTrigger className='h-8 w-[70px]'>
                <SelectValue placeholder={pageSize} />
              </SelectTrigger>
              <SelectContent side='top'>
                {[10, 20, 30, 40, 50, 100, 200].map((size) => (
                  <SelectItem key={size} value={`${size}`}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className='flex items-center gap-1 text-sm text-muted-foreground whitespace-nowrap'>
            {pageCount > 0
              ? `Page ${currentPage} of ${pageCount}`
              : 'No records'
            }
          </div>
          <div className='flex items-center gap-1'>
            <Button
              variant='outline'
              className='h-8 w-8 p-0'
              onClick={() => onPageChange?.(1)}
              disabled={!canPrevious}
            >
              <span className='sr-only'>Go to first page</span>
              <DoubleArrowLeftIcon className='h-4 w-4' />
            </Button>
            <Button
              variant='outline'
              className='h-8 w-8 p-0'
              onClick={() => onPageChange?.(currentPage - 1)}
              disabled={!canPrevious}
            >
              <span className='sr-only'>Go to previous page</span>
              <ChevronLeftIcon className='h-4 w-4' />
            </Button>
            <Button
              variant='outline'
              className='h-8 w-8 p-0'
              onClick={() => onPageChange?.(currentPage + 1)}
              disabled={!canNext}
            >
              <span className='sr-only'>Go to next page</span>
              <ChevronRightIcon className='h-4 w-4' />
            </Button>
            <Button
              variant='outline'
              className='h-8 w-8 p-0'
              onClick={() => onPageChange?.(pageCount)}
              disabled={!canNext}
            >
              <span className='sr-only'>Go to last page</span>
              <DoubleArrowRightIcon className='h-4 w-4' />
            </Button>
          </div>
        </div>
      </div>
      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className='group/row grid grid-cols-[90px_1fr_160px_120px_100px_100px_100px_110px_60px] '>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      colSpan={header.colSpan}
                      className={header.column.columnDef.meta?.className ?? ''}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  className='group/row grid grid-cols-[90px_1fr_160px_120px_100px_100px_100px_110px_60px] hover:bg-violet-400/30'
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={cell.column.columnDef.meta?.className ?? ''}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={table.getVisibleLeafColumns().length}
                  className='h-24 text-center'
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
