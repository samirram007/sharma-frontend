import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { rankItem } from '@tanstack/match-sorter-utils'
import { MixerHorizontalIcon } from '@radix-ui/react-icons'
import { useMemo, useState } from 'react'
import { ChevronDown, ChevronUp, FileSpreadsheet, FileText, Search } from 'lucide-react'
import type { ColumnDef, ColumnFiltersState, FilterFn, RowData, SortingState, VisibilityState } from '@tanstack/react-table'
import type { VoucherSchema } from '../../data-schema/voucher-schema'

const fuzzyFilter: FilterFn<any> = (row, columnId, value) => {
  return rankItem(String(row.getValue(columnId)), value).passed
}
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { DataTablePagination } from '@/features/global/components/data-table/data-table-pagination'
import { cn } from '@/lib/utils'
import { date_format } from '@/utils/removeEmptyStrings'


declare module '@tanstack/react-table' {

  interface ColumnMeta<TData extends RowData, TValue> {
    className: string
  }
}

interface DataTableProps {
  columns: Array<ColumnDef<VoucherSchema>>
  data: Array<VoucherSchema>
  pageCount?: number
  pageIndex?: number
  pageSize?: number
  totalRecords?: number
  totalFareOverall?: number
  search?: string
  onSearchChange?: (value: string) => void
  onSearch?: () => void
  onReset?: () => void
  onPageChange?: (page: number, pageSize: number) => void
  freightStatus?: string
  onFreightStatusChange?: (status: string) => void
}

export function GridTable({
  columns,
  data,
  pageCount,
  pageIndex = 0,
  pageSize = 10,
  totalRecords,
  totalFareOverall,
  search,
  onSearchChange,
  onSearch,
  onPageChange,
  freightStatus = 'pending',
  onFreightStatusChange,
}: DataTableProps) {
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    select: false,
  })
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [globalFilter, _setGlobalFilter] = useState('')
  const [columnSizing, setColumnSizing] = useState({})

  // Never let TanStack receive -1/0 page counts (shows "Page 1 of -1" otherwise)
  const safePageCount = Math.max(pageCount && pageCount > 0 ? pageCount : 1, 1)

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      columnSizing,
      globalFilter,
      columnFilters,
      pagination: {
        pageIndex,
        pageSize,
      },
    },
    manualPagination: true,
    pageCount: safePageCount,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onColumnSizingChange: setColumnSizing,
    onPaginationChange: (updater) => {
      const currentState = { pageIndex, pageSize }
      const newState =
        typeof updater === 'function' ? updater(currentState) : updater
      onPageChange?.(newState.pageIndex, newState.pageSize)
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    filterFns: {
      fuzzy: fuzzyFilter,
    },
  })


  // Prepare export column mapping from the table column definitions
  const exportColumns = useMemo(() => {
    return table
      .getAllLeafColumns()
      .filter((col) => col.getCanHide() || !col.id.startsWith('_'))
      .filter((col) => col.id !== 'actions' && col.id !== 'select' && col.id !== 'slNo')
      .map((col) => {
        // Derive a human-readable header from the column definition
        const def = col.columnDef
        let header = col.id
        if (typeof def.header === 'string') {
          header = def.header
        }
        return { header, accessor: col.id }
      })
  }, [table])

  // Prepare export data by extracting flat values from VoucherSchema
  const exportData = useMemo(() => {
    return data.map((item, idx) => ({
      slNo: idx + 1,
      voucherDate: date_format(item.voucherDate),
      voucherNo: item.voucherNo ?? '',
      partyName: item.party?.name ?? '',
      dispatchNo: item.voucherDispatchDetail?.billOfLadingNo ?? '',
      source: item.voucherDispatchDetail?.source ?? '',
      destination: [item.voucherDispatchDetail?.destination, item.voucherDispatchDetail?.destinationSecondary]
        .filter(Boolean)
        .join(', '),
      carrier: item.voucherDispatchDetail?.carrierName ?? '',
      vehicleNo: item.voucherDispatchDetail?.motorVehicleNo ?? '',
      weight: item.voucherDispatchDetail?.weight ? Number(item.voucherDispatchDetail.weight).toFixed(3) : '',
      rate: item.voucherDispatchDetail?.rate ? Number(item.voucherDispatchDetail.rate).toFixed(2) : '',
      totalFare: item.voucherDispatchDetail?.totalFare ? Number(item.voucherDispatchDetail.totalFare).toFixed(2) : '',
    }))
  }, [data])

  // Sum totals from the current page data
  const totalFare = data.reduce(
    (sum, item) => sum + (Number(item.voucherDispatchDetail?.totalFare) || 0),
    0,
  )

  // Sorting indicator component
  const SortIcon = ({ column }: { column: any }) => {
    const sorted = column.getIsSorted()
    if (!sorted) return null
    return (
      <span className='ml-1 inline-flex'>
        {sorted === 'asc' ? (
          <ChevronUp className='h-3 w-3 text-blue-600 dark:text-blue-400' />
        ) : (
          <ChevronDown className='h-3 w-3 text-blue-600 dark:text-blue-400' />
        )}
      </span>
    )
  }

  return (
    <div className='flex flex-col gap-3 p-1'>
      {/* Toolbar with search, freight status filter, column visibility toggle + export buttons */}
      <div className='flex flex-wrap items-center justify-between gap-3 px-2 pt-1'>
        <div className='flex items-center gap-3'>
          {/* Search input */}
          <div className='relative flex w-[200px] items-center'>
            <Input
              placeholder='Search...'
              value={search || ''}
              className='h-8 w-full pr-9 text-xs'
              onChange={(e) => onSearchChange?.(e.target.value)}
            />
            <Button
              variant='ghost'
              size='sm'
              className='absolute right-0 top-1/2 h-8 w-8 -translate-y-1/2 p-0'
              onClick={onSearch}
            >
              <Search className='h-3.5 w-3.5 text-muted-foreground' />
            </Button>
          </div>

          {/* Freight status filter toggle */}
          <div className='flex items-center gap-1 rounded-lg border border-border bg-muted/50 p-0.5 dark:bg-muted/40'>
            {[
              { value: 'pending', label: 'Pending' },
              { value: 'prepared', label: 'Prepared' },
              { value: 'all', label: 'All' },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => onFreightStatusChange?.(option.value)}
                className={cn(
                  'rounded-md px-3 py-1 text-xs font-medium transition-all duration-150',
                  freightStatus === option.value
                    ? 'bg-background text-blue-700 shadow-sm dark:bg-blue-500/15 dark:text-blue-300'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className='flex items-center gap-2'>
          {/* Export PDF */}
          {data.length > 0 && (
            <>
              <Button
                variant='outline'
                size='sm'
                className='h-8 rounded-lg text-xs text-muted-foreground shadow-xs transition-colors hover:bg-accent hover:text-accent-foreground'
                onClick={async () => {
                  const { default: exportTableToPdf } = await import('@/utils/export-table-pdf')
                  exportTableToPdf({
                    title: 'Freight Delivery Notes',
                    columnData: exportColumns,
                    data: exportData as Array<any>,
                    fileName: 'freight-delivery-notes.pdf',
                  })
                }}
              >
                <FileText className='mr-1.5 h-3.5 w-3.5' />
                PDF
              </Button>
              {/* Export Excel */}
              <Button
                variant='outline'
                size='sm'
                className='h-8 rounded-lg text-xs text-muted-foreground shadow-xs transition-colors hover:bg-accent hover:text-accent-foreground'
                onClick={async () => {
                  const { default: exportTableToExcel } = await import('@/utils/export-table-excel')
                  exportTableToExcel({
                    title: 'Freight Delivery Notes',
                    columnData: exportColumns,
                    data: exportData as Array<any>,
                    fileName: 'freight-delivery-notes.xlsx',
                  })
                }}
              >
                <FileSpreadsheet className='mr-1.5 h-3.5 w-3.5' />
                Excel
              </Button>
            </>
          )}

          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button
                variant='outline'
                size='sm'
                className='h-8 rounded-lg text-xs text-muted-foreground shadow-xs transition-colors hover:bg-accent hover:text-accent-foreground'
              >
                <MixerHorizontalIcon className='mr-2 h-4 w-4' />
                Columns
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end' className='w-[160px]'>
              <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className='capitalize'
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Table container with horizontal scroll */}
      <div className='overflow-x-auto rounded-lg border border-border'>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className='border-b border-border bg-muted/50'>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    colSpan={header.colSpan}
                    style={{
                      width: header.getSize(),
                      minWidth: header.column.columnDef.minSize,
                      maxWidth: header.column.columnDef.maxSize,
                    }}
                    className={cn(
                      'h-10 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground',
                      header.column.columnDef.meta?.className ?? '',
                      header.column.getCanSort() && 'cursor-pointer select-none hover:text-foreground',
                      'relative',
                    )}
                    onClick={
                      header.column.getCanSort()
                        ? header.column.getToggleSortingHandler()
                        : undefined
                    }
                  >
                    <div className='flex items-center'>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                      {header.column.getCanSort() && (
                        <SortIcon column={header.column} />
                      )}
                    </div>
                    {header.column.getCanResize() && (
                      <div
                        onDoubleClick={() => header.column.resetSize()}
                        onMouseDown={header.getResizeHandler()}
                        onTouchStart={header.getResizeHandler()}
                        className={cn(
                          'absolute right-0 top-0 h-full w-1 cursor-col-resize select-none',
                          'bg-transparent hover:bg-blue-400 active:bg-blue-500',
                          'transition-colors duration-150',
                          header.column.getIsResizing() && 'bg-blue-500',
                        )}
                      />
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row, rowIdx) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  className={cn(
                    'border-b border-border/60 transition-colors duration-150',
                    rowIdx % 2 === 0
                      ? 'bg-background'
                      : 'bg-muted/20',
                    'hover:bg-accent/50',
                  )}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      style={{
                        width: cell.column.getSize(),
                        minWidth: cell.column.columnDef.minSize,
                        maxWidth: cell.column.columnDef.maxSize,
                      }}
                      className={cn(
                        'px-3 py-2.5 text-sm',
                        cell.column.columnDef.meta?.className ?? '',
                      )}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={table.getVisibleLeafColumns().length}
                  className='h-32 text-center text-sm text-muted-foreground'
                >
                  No results found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Footer with totals and pagination */}
      <div className='flex flex-wrap items-center justify-between gap-4 rounded-lg border border-border bg-muted/40 px-5 py-2.5 text-sm dark:bg-muted/30'>
        {data.length > 0 && (
          <div className='flex flex-wrap items-center gap-6'>
            <span className='text-xs font-medium text-muted-foreground'>
              Total Records:{' '}
              <span className='font-semibold text-blue-700 dark:text-blue-400'>
                {totalRecords ?? data.length}
              </span>
            </span>
            <span className='text-xs font-medium text-muted-foreground'>
              This Page Fare:{' '}
              <span className='font-semibold text-blue-700 dark:text-blue-400'>
                ₹{totalFare.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </span>
            {totalFareOverall !== undefined && (
              <span className='text-xs font-medium text-muted-foreground'>
                Overall Fare:{' '}
                <span className='font-semibold text-blue-700 dark:text-blue-400'>
                  ₹{totalFareOverall.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </span>
            )}
          </div>
        )}
        <DataTablePagination table={table} />
      </div>
    </div>
  )
}
