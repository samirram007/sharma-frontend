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
  getExpandedRowModel,
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
import { useMemo, useState } from 'react'
import type { ReceiptNoteReportSchema } from '../data/schema'
import type { PaginationMeta } from '../data/schema'
import { StockItemDetails } from './stock-item-details'
import { Package, Hash, IndianRupee } from 'lucide-react'
import { toNum, formatLocale } from '@/utils/format-num'

declare module '@tanstack/react-table' {
  interface ColumnMeta<TData extends RowData, TValue> {
    className: string
  }
}

interface DataTableProps {
  columns: ColumnDef<ReceiptNoteReportSchema>[]
  data: ReceiptNoteReportSchema[]
  paginationMeta?: PaginationMeta
  onPageChange?: (page: number) => void
  onPageSizeChange?: (size: number) => void
  onSortChange?: (sortBy: string, sortOrder: string) => void
  sorting?: SortingState
}

export function GridTable({
  columns,
  data,
  paginationMeta,
  onPageChange,
  onPageSizeChange,
  onSortChange,
  sorting: externalSorting,
}: DataTableProps) {
  const [rowSelection, setRowSelection] = useState({})
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({ select: false })
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [sorting, setSorting] = useState<SortingState>(externalSorting ?? [])
  const [expanded, setExpanded] = useState({})

  const pageCount = paginationMeta ? Math.ceil(paginationMeta.total / paginationMeta.per_page) : 0
  const currentPage = paginationMeta?.current_page ?? 1
  const pageSize = paginationMeta?.per_page ?? 10

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      pagination: { pageIndex: currentPage - 1, pageSize },
      expanded,
    },
    pageCount,
    enableRowSelection: false,
    onRowSelectionChange: setRowSelection,
    onExpandedChange: setExpanded,
    getRowCanExpand: () => true,
    onSortingChange: (updater) => {
      const newSorting = typeof updater === 'function' ? updater(sorting) : updater
      setSorting(newSorting)
      if (onSortChange && newSorting.length > 0) {
        const sortFieldMap: Record<string, string> = {
          voucherDate: 'voucher_date',
          voucherNo: 'voucher_no',
          amount: 'amount',
        }
        const colId = newSorting[0]?.id
        const mappedField = sortFieldMap[colId] ?? colId
        onSortChange(mappedField, newSorting[0]?.desc ? 'desc' : 'asc')
      } else if (onSortChange) {
        onSortChange('', '')
      }
    },
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    manualPagination: true,
    manualSorting: true,
    filterFns: {
      fuzzy: (row, columnId, value) => {
        const columnValue = row.getValue(columnId)
        return columnValue && typeof columnValue === 'string'
          ? columnValue.toLowerCase().includes(value.toLowerCase())
          : false
      },
    },
    onPaginationChange: (updater) => {
      if (typeof updater === 'function') {
        const current = { pageIndex: currentPage - 1, pageSize }
        const next = updater(current)
        if (next.pageIndex !== current.pageIndex) onPageChange?.(next.pageIndex + 1)
        if (next.pageSize !== current.pageSize) onPageSizeChange?.(next.pageSize)
      }
    },
  })

  const totalVouchers = paginationMeta?.total ?? 0
  // Derive the visible record range client-side (backend now sends minimal meta only)
  const fromRecord = totalVouchers > 0 ? (currentPage - 1) * pageSize + 1 : 0
  const toRecord = totalVouchers > 0 ? Math.min(currentPage * pageSize, totalVouchers) : 0

  // Compute summary totals from current page data
  const summary = useMemo(() => {
    let totalItems = 0
    let totalQuantity = 0
    let grandTotal = 0

    for (const row of data) {
      const entries = row.stockJournal?.stockJournalEntries?.filter(Boolean) ?? []
      totalItems += entries.length
      for (const entry of entries) {
        totalQuantity += toNum(entry?.actualQuantity)
      }
      grandTotal += toNum(row.amount)
    }

    return { totalItems, totalQuantity, grandTotal }
  }, [data])

  const formatAmt = formatLocale
  const formatQty = formatLocale

  // Dynamic grid columns based on visible columns
  const visibleCols = table.getVisibleLeafColumns()
  const gridTemplateCols = visibleCols
    .map((col) => {
      const meta = col.columnDef.meta
      if (meta?.className?.includes('w-8')) return '32px'
      if (meta?.className?.includes('w-[100px]')) return '100px'
      if (meta?.className?.includes('w-[')) return '80px'
      if (meta?.className?.includes('text-right')) return '120px'
      return 'minmax(80px, 1fr)'
    })
    .join(' ')

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between gap-4 px-2'>
        <div className='text-sm text-muted-foreground'>
          Total Receipt Notes: <span className='font-semibold'>{totalVouchers}</span>
          {totalVouchers > 0 && <span className='ml-2'>(Showing {fromRecord}–{toRecord})</span>}
        </div>
        <div className='flex items-center gap-4'>
          <div className='flex items-center gap-2'>
            <p className='text-sm text-muted-foreground whitespace-nowrap'>Rows per page</p>
            <Select value={`${pageSize}`} onValueChange={(value) => onPageSizeChange?.(Number(value))}>
              <SelectTrigger className='h-8 w-[70px]'>
                <SelectValue placeholder={pageSize} />
              </SelectTrigger>
              <SelectContent side='top'>
                {[10, 20, 30, 40, 50, 100, 200].map((size) => (
                  <SelectItem key={size} value={`${size}`}>{size}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className='flex items-center gap-1 text-sm text-muted-foreground whitespace-nowrap'>
            {pageCount > 0 ? `Page ${currentPage} of ${pageCount}` : 'No records'}
          </div>
          <div className='flex items-center gap-1'>
            <Button variant='outline' className='h-8 w-8 p-0' onClick={() => onPageChange?.(1)} disabled={currentPage <= 1}>
              <DoubleArrowLeftIcon className='h-4 w-4' />
            </Button>
            <Button variant='outline' className='h-8 w-8 p-0' onClick={() => onPageChange?.(currentPage - 1)} disabled={currentPage <= 1}>
              <ChevronLeftIcon className='h-4 w-4' />
            </Button>
            <Button variant='outline' className='h-8 w-8 p-0' onClick={() => onPageChange?.(currentPage + 1)} disabled={currentPage >= pageCount}>
              <ChevronRightIcon className='h-4 w-4' />
            </Button>
            <Button variant='outline' className='h-8 w-8 p-0' onClick={() => onPageChange?.(pageCount)} disabled={currentPage >= pageCount}>
              <DoubleArrowRightIcon className='h-4 w-4' />
            </Button>
          </div>
        </div>
      </div>
      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className='group/row' style={{ display: 'grid', gridTemplateColumns: gridTemplateCols }}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} colSpan={header.colSpan} className={header.column.columnDef.meta?.className ?? ''}>
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <>
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && 'selected'}
                    className='group/row hover:bg-violet-400/30 cursor-pointer'
                    style={{ display: 'grid', gridTemplateColumns: gridTemplateCols }}
                    onClick={() => {
                      const hasItems = row.original.stockJournal?.stockJournalEntries?.length ?? 0 > 0
                      if (hasItems) row.toggleExpanded()
                    }}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className={cell.column.columnDef.meta?.className ?? ''}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                  {row.getIsExpanded() && (
                    <TableRow key={`${row.id}-expanded`} className='hover:bg-transparent' style={{ display: 'grid', gridTemplateColumns: gridTemplateCols }}>
                      <TableCell
                        style={{ gridColumn: '1 / -1' }}
                        className='p-0 border-b border-slate-200/70 dark:border-slate-700/50'
                      >
                        <StockItemDetails
                          stockJournalEntries={row.original.stockJournal?.stockJournalEntries as any}
                          voucherDispatchDetail={row.original.voucherDispatchDetail as any}
                        />
                      </TableCell>
                    </TableRow>
                  )}
                </>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className='h-24 text-center'>No results.</TableCell>
              </TableRow>
            )}
            {data.length > 0 && (
              <TableRow className='border-t-2 border-primary/30 bg-primary/[0.04] font-semibold' style={{ display: 'grid', gridTemplateColumns: gridTemplateCols }}>
                <TableCell className='flex items-center gap-1.5 text-primary py-3' style={{ gridColumn: 'span 3' }}>
                  <span className='text-xs font-semibold uppercase tracking-wider'>Summary</span>
                </TableCell>
                <TableCell className='py-3' style={{ gridColumn: 'span 2' }}>
                  <div className='flex items-center gap-2 text-xs text-muted-foreground'>
                    <Package className='h-3.5 w-3.5' />
                    <span className='font-semibold text-foreground'>{summary.totalItems}</span>
                    <span>item{summary.totalItems !== 1 ? 's' : ''}</span>
                  </div>
                </TableCell>
                <TableCell className='py-3'>
                  <div className='flex items-center gap-2 text-xs text-muted-foreground'>
                    <Hash className='h-3.5 w-3.5' />
                    <span className='font-semibold text-foreground'>{formatQty(summary.totalQuantity)}</span>
                    <span className='hidden sm:inline'>qty</span>
                  </div>
                </TableCell>
                <TableCell className='py-3'>
                  <div className='text-xs text-muted-foreground truncate max-w-[130px]'>—</div>
                </TableCell>
                <TableCell className='py-3 text-right pr-4'>
                  <div className='flex items-center justify-end gap-1.5'>
                    <IndianRupee className='h-3.5 w-3.5 text-primary' />
                    <span className='text-sm font-bold text-primary tabular-nums'>{formatAmt(summary.grandTotal)}</span>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
