import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { rankItem } from '@tanstack/match-sorter-utils'
import { MixerHorizontalIcon } from '@radix-ui/react-icons'
import { useEffect, useMemo, useRef, useState } from 'react'
import { ChevronDown, ChevronUp, Search } from 'lucide-react'
import type {
  ColumnDef,
  ColumnFiltersState,
  FilterFn,
  RowData,
  SortingState,
  VisibilityState,
} from '@tanstack/react-table'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { GodownList } from '@/features/modules/godown/data/schema'
import { DataTablePagination } from '@/features/global/components/data-table/data-table-pagination'
import { useLocalStorage } from '@/hooks/use-local-storage'
import { cn } from '@/lib/utils'
import { fetchFreightService } from '../data/api'
import type { FreightQueryParams } from '../data/api'
import { formatItemQuantity } from './columns'
import { date_format } from '@/utils/removeEmptyStrings'
import { ExportDropdown, ExportOverlay } from '../shared/export-controls'
import { useExportJob } from '../shared/export-job'

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
  zones?: GodownList
  zoneId?: number
  onZoneChange?: (zoneId?: number) => void
  /** API query params for the list — reused by the export to fetch ALL
   *  matching records (current filters applied) instead of just this page. */
  exportParams?: FreightQueryParams
}

/**
 * Expand voucher records into raw rows — one row per stock-journal entry ×
 * godown entry — so exports can show each item/godown on its own line instead
 * of merged into a single cell (kept alongside the merged export).
 */
function toRawExportRows(records: Array<VoucherSchema>) {
  const rows: Array<Record<string, string | number>> = []
  let slNo = 0
  for (const item of records) {
    const destination = [
      item.voucherDispatchDetail?.destination,
      item.voucherDispatchDetail?.destinationSecondary,
    ]
      .filter(Boolean)
      .join(', ')
    const base = {
      voucherDate: date_format(item.voucherDate),
      voucherNo: item.voucherNo ?? '',
      partyName: item.party?.name ?? '',
      dispatchNo: item.voucherDispatchDetail?.billOfLadingNo ?? '',
      source: item.voucherDispatchDetail?.source ?? '',
      destination,
      carrier: item.voucherDispatchDetail?.carrierName ?? '',
      vehicleNo: item.voucherDispatchDetail?.motorVehicleNo ?? '',
      weight: item.voucherDispatchDetail?.weight
        ? Number(item.voucherDispatchDetail.weight).toFixed(3)
        : '',
      rate: item.voucherDispatchDetail?.rate
        ? Number(item.voucherDispatchDetail.rate).toFixed(2)
        : '',
      totalFare: item.voucherDispatchDetail?.totalFare
        ? Number(item.voucherDispatchDetail.totalFare).toFixed(2)
        : '',
    }

    const entries = (item.stockJournal?.stockJournalEntries ?? []).filter(
      Boolean,
    )

    // No entries — still emit one row so the voucher is not lost in the export
    if (entries.length === 0) {
      rows.push({
        ...base,
        slNo: ++slNo,
        itemName: '',
        unitCode: '',
        itemQuantity: '',
        godownName: '',
        godownQuantity: '',
      })
      continue
    }

    for (const entry of entries) {
      const itemQty = formatItemQuantity(
        entry?.actualQuantity || entry?.billingQuantity,
        entry?.stockUnit?.code,
        entry?.stockUnit?.noOfDecimalPlaces,
      )
      const itemName = entry?.stockItem?.name ?? ''
      const unitCode = entry?.stockUnit?.code ?? ''
      const godowns = (entry?.stockJournalGodownEntries ?? []).filter(Boolean)

      if (godowns.length === 0) {
        rows.push({
          ...base,
          slNo: ++slNo,
          itemName,
          unitCode,
          itemQuantity: itemQty,
          godownName: '',
          godownQuantity: '',
        })
        continue
      }

      for (const godownEntry of godowns) {
        rows.push({
          ...base,
          slNo: ++slNo,
          itemName,
          unitCode,
          itemQuantity: itemQty,
          godownName:
            godownEntry?.godown?.name ??
            `Godown #${godownEntry?.godownId ?? '?'}`,
          godownQuantity: formatItemQuantity(
            godownEntry?.actualQuantity || godownEntry?.billingQuantity,
            entry?.stockUnit?.code,
            entry?.stockUnit?.noOfDecimalPlaces,
          ),
        })
      }
    }
  }
  return rows
}

/** Column mapping for the raw (per item & godown) export variant. */
const rawExportColumns = [
  { header: 'Sl. No.', accessor: 'slNo' },
  { header: 'Date', accessor: 'voucherDate' },
  { header: 'Dl. No.', accessor: 'voucherNo' },
  { header: 'Distributor', accessor: 'partyName' },
  { header: 'Dispatch No.', accessor: 'dispatchNo' },
  { header: 'Source', accessor: 'source' },
  { header: 'Destination', accessor: 'destination' },
  { header: 'Item', accessor: 'itemName' },
  { header: 'Unit', accessor: 'unitCode' },
  { header: 'Item Qty', accessor: 'itemQuantity' },
  { header: 'Godown', accessor: 'godownName' },
  { header: 'Godown Qty', accessor: 'godownQuantity' },
  { header: 'Carrier', accessor: 'carrier' },
  { header: 'Vehicle No.', accessor: 'vehicleNo' },
  { header: 'Weight (Mt)', accessor: 'weight' },
  { header: 'Rate (Per Mt)', accessor: 'rate' },
  { header: 'Total Fare', accessor: 'totalFare' },
]

/** Numeric raw-view columns that are right-aligned (Sl. No. centered). */
const RAW_NUMERIC_ACCESSORS = new Set([
  'itemQuantity',
  'godownQuantity',
  'weight',
  'rate',
  'totalFare',
])

/** Column definitions for the raw (per item & godown) table view. */
const rawColumnDefs: Array<ColumnDef<any>> = rawExportColumns.map((col) => ({
  accessorKey: col.accessor,
  header: col.header,
  enableSorting: true,
  size: 130,
  meta: {
    className: cn(
      col.accessor === 'slNo' && 'text-center',
      RAW_NUMERIC_ACCESSORS.has(col.accessor) && 'text-right',
    ),
  },
}))

function toExportRows(records: Array<VoucherSchema>) {
  return records.map((item, idx) => ({
    slNo: idx + 1,
    voucherDate: date_format(item.voucherDate),
    voucherNo: item.voucherNo ?? '',
    partyName: item.party?.name ?? '',
    dispatchNo: item.voucherDispatchDetail?.billOfLadingNo ?? '',
    source: item.voucherDispatchDetail?.source ?? '',
    destination: [
      item.voucherDispatchDetail?.destination,
      item.voucherDispatchDetail?.destinationSecondary,
    ]
      .filter(Boolean)
      .join(', '),
    items: (item.stockJournal?.stockJournalEntries ?? [])
      .filter(Boolean)
      .map((entry) => {
        const parts = [
          entry?.stockItem?.name ?? '',
          formatItemQuantity(
            entry?.actualQuantity || entry?.billingQuantity,
            entry?.stockUnit?.code,
            entry?.stockUnit?.noOfDecimalPlaces,
          ),
        ].filter((part) => part && part !== '-')

        // Per-item godowns with their quantities, e.g. [Godown A: 500, Godown B: 500]
        const godowns = (entry?.stockJournalGodownEntries ?? []).filter(Boolean)
        if (godowns.length > 0) {
          const godownParts = godowns.map((godownEntry) => {
            const qty = formatItemQuantity(
              godownEntry?.actualQuantity || godownEntry?.billingQuantity,
              entry?.stockUnit?.code,
              entry?.stockUnit?.noOfDecimalPlaces,
            )
            return `${godownEntry?.godown?.name ?? `Godown #${godownEntry?.godownId ?? '?'}`}${qty !== '-' ? `: ${qty}` : ''}`
          })
          parts.push(`[${godownParts.join(', ')}]`)
        }

        return parts.join(' — ')
      })
      .join(' | '),
    carrier: item.voucherDispatchDetail?.carrierName ?? '',
    vehicleNo: item.voucherDispatchDetail?.motorVehicleNo ?? '',
    weight: item.voucherDispatchDetail?.weight
      ? Number(item.voucherDispatchDetail.weight).toFixed(3)
      : '',
    rate: item.voucherDispatchDetail?.rate
      ? Number(item.voucherDispatchDetail.rate).toFixed(2)
      : '',
    totalFare: item.voucherDispatchDetail?.totalFare
      ? Number(item.voucherDispatchDetail.totalFare).toFixed(2)
      : '',
  }))
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
  zones,
  zoneId,
  onZoneChange,
  exportParams,
}: DataTableProps) {
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [globalFilter, _setGlobalFilter] = useState('')
  const [columnSizing, setColumnSizing] = useState({})
  // True once the table is scrolled horizontally — the pinned Bill column
  // only casts its separating shadow while content actually passes under it.
  const [tableScrolled, setTableScrolled] = useState(false)
  const tableWrapperRef = useRef<HTMLDivElement | null>(null)

  // Scroll events don't bubble and React doesn't delegate them, so listen
  // natively in the capture phase on the wrapper for the Table component's
  // inner overflow container.
  useEffect(() => {
    const el = tableWrapperRef.current
    if (!el) return
    const onScroll = (event: Event) => {
      const target = event.target as HTMLElement
      if (target.dataset.slot !== 'table-container') return
      const scrolled = target.scrollLeft > 0
      setTableScrolled((prev) => (prev === scrolled ? prev : scrolled))
    }
    el.addEventListener('scroll', onScroll, { capture: true, passive: true })
    // Sync the initial state in case the browser restored a scroll position.
    onScroll({
      target: el.querySelector('[data-slot="table-container"]'),
    } as Event)
    return () => el.removeEventListener('scroll', onScroll, { capture: true })
  }, [])

  // View mode: merged (one row per delivery note) vs raw (one row per item ×
  // godown). Persisted so users keep their preferred view between visits.
  const [rawView, setRawView] = useLocalStorage<boolean>(
    'freightRawView',
    false,
  )

  // Optimistic page size: the Rows-per-page selector updates instantly on
  // change instead of waiting for the (server-side) refetch round-trip, and
  // re-syncs when the fetched meta comes back with the confirmed value.
  const [localPageSize, setLocalPageSize] = useState(pageSize)
  useEffect(() => {
    setLocalPageSize(pageSize)
  }, [pageSize])

  // Never let TanStack receive -1/0 page counts (shows "Page 1 of -1" otherwise)
  const safePageCount = Math.max(pageCount && pageCount > 0 ? pageCount : 1, 1)

  // Raw view expands the current page of vouchers client-side (same expansion
  // used by raw exports); merged view shows the vouchers as-is. Server-side
  // pagination still walks voucher pages in both modes.
  const displayData = useMemo(
    () => (rawView ? toRawExportRows(data) : data),
    [rawView, data],
  )
  const displayColumns = rawView ? rawColumnDefs : columns

  const table = useReactTable<any>({
    data: displayData,
    columns: displayColumns,
    state: {
      sorting,
      columnVisibility,
      columnSizing,
      globalFilter,
      columnFilters,
      pagination: {
        pageIndex,
        pageSize: localPageSize,
      },
    },
    manualPagination: true,
    pageCount: safePageCount,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onColumnSizingChange: setColumnSizing,
    onPaginationChange: (updater) => {
      const currentState = { pageIndex, pageSize: localPageSize }
      const newState =
        typeof updater === 'function' ? updater(currentState) : updater
      // Reflect the new page size immediately so the Rows-per-page selector
      // text updates without waiting for the server round-trip.
      if (newState.pageSize !== localPageSize) {
        setLocalPageSize(newState.pageSize)
      }
      onPageChange?.(newState.pageIndex, newState.pageSize)
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    filterFns: {
      fuzzy: fuzzyFilter,
    },
  })

  // The "This page" export scope uses the currently rendered rows directly.
  const pageRows = useMemo(
    () => table.getRowModel().rows.map((row) => row.original),
    [table],
  )

  // Prepare export column mapping from the MERGED column definitions — never
  // the table's, so merged exports keep their columns even in raw view.
  const exportColumns = useMemo(() => {
    return columns
      .filter((col) => col.id !== 'actions' && col.id !== 'slNo')
      .map((col) => {
        const accessor = String(
          (col as { accessorKey?: string }).accessorKey ?? col.id ?? '',
        )
        if (!accessor || accessor.startsWith('_')) return null
        // Derive a human-readable header from the column definition
        let header = accessor
        if (typeof col.header === 'string') {
          header = col.header
        }
        return { header, accessor }
      })
      .filter((c): c is { header: string; accessor: string } => c !== null)
  }, [columns])

  // Run the export job (PDF/Excel × current page / all records) with a live
  // ETA + progress bar, run-in-background support, and toasts — shared hook.
  const {
    exportJob,
    eta,
    progress: exportProgress,
    runExport,
    handleRunInBackground,
    cancelExport,
  } = useExportJob<VoucherSchema>({
    // Page-scope exports always work from the page's vouchers so the raw view
    // never leaks raw rows into merged formatting (generate() picks the raw
    // expansion when the raw view is active).
    getPageRows: () => data,
    // Fetch EVERY matching delivery note (current filters applied), walking
    // pages so the export is never truncated. The signal both aborts the
    // in-flight request and stops the loop when the user cancels.
    fetchAll: async (onProgress, signal) => {
      const batchSize = 500
      let page = 1
      let total: number | null = null
      const rows: Array<VoucherSchema> = []
      do {
        // The signal aborts the in-flight request itself, so cancelling
        // stops the fetch immediately instead of waiting for the page.
        const response = await fetchFreightService(
          'delivery_note',
          {
            ...(exportParams ?? {}),
            page,
            per_page: batchSize,
          },
          signal,
        )
        const pageRecords: Array<VoucherSchema> = response?.data ?? []
        rows.push(...pageRecords)
        total = response?.meta?.total ?? null
        page += 1
        onProgress(rows.length, total)

        // A short page means we've reached the end even when meta.total
        // is missing — never silently truncate the export.
        if (pageRecords.length < batchSize) break
      } while ((total === null || rows.length < total) && !signal.aborted)
      return rows
    },
    generate: async (action, rows, signal) => {
      // Raw variant (extra export group) expands every item × godown onto its
      // own row; the standard variant keeps the merged item/godown cell. The
      // raw view makes page/all exports default to the raw expansion too.
      const isRaw = action.endsWith('raw') || rawView
      const exportRows = isRaw ? toRawExportRows(rows) : toExportRows(rows)
      const columnData = isRaw ? rawExportColumns : exportColumns
      const fileName = isRaw
        ? 'freight-delivery-notes-raw.'
        : 'freight-delivery-notes.'
      if (action.startsWith('pdf')) {
        const { default: exportTableToPdf } =
          await import('@/utils/export-table-pdf')
        exportTableToPdf({
          title: isRaw
            ? 'Freight Delivery Notes — Raw (per item & godown)'
            : 'Freight Delivery Notes',
          columnData,
          data: exportRows as Array<any>,
          fileName: `${fileName}pdf`,
          signal,
        })
      } else {
        const { default: exportTableToExcel } =
          await import('@/utils/export-table-excel')
        await exportTableToExcel({
          title: isRaw
            ? 'Freight Delivery Notes — Raw (per item & godown)'
            : 'Freight Delivery Notes',
          columnData,
          data: exportRows as Array<any>,
          fileName: `${fileName}xlsx`,
          signal,
        })
      }
    },
    successLabel: 'record',
  })

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
      <span className="ml-1 inline-flex">
        {sorted === 'asc' ? (
          <ChevronUp className="h-3 w-3 text-blue-600 dark:text-blue-400" />
        ) : (
          <ChevronDown className="h-3 w-3 text-blue-600 dark:text-blue-400" />
        )}
      </span>
    )
  }

  return (
    <div className="flex flex-col gap-3 p-1">
      {/* Toolbar with search, freight status filter, column visibility toggle + export buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-2 pt-1">
        <div className="flex items-center gap-3">
          {/* Search input */}
          <div className="relative flex w-[200px] items-center">
            <Input
              placeholder="Search..."
              value={search || ''}
              className="h-8 w-full pr-9 text-xs"
              onChange={(e) => onSearchChange?.(e.target.value)}
            />
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-0 top-1/2 h-8 w-8 -translate-y-1/2 p-0"
              onClick={onSearch}
            >
              <Search className="h-3.5 w-3.5 text-muted-foreground" />
            </Button>
          </div>

          {/* Zone filter dropdown (only when zones exist in the system) */}
          {zones && zones.length > 0 && (
            <Select
              value={zoneId ? String(zoneId) : 'all'}
              onValueChange={(value) =>
                onZoneChange?.(value === 'all' ? undefined : Number(value))
              }
            >
              <SelectTrigger className="h-8 w-[170px] text-xs">
                <SelectValue placeholder="All zones" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All zones</SelectItem>
                {zones.map((zone) => (
                  <SelectItem key={zone.id} value={String(zone.id)}>
                    <span className="font-medium">{zone.name}</span>
                    {zone.code && (
                      <span className="ml-2 text-muted-foreground">
                        ({zone.code})
                      </span>
                    )}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {/* Freight status filter toggle */}
          <div className="flex items-center gap-1 rounded-lg border border-border bg-muted/50 p-0.5 dark:bg-muted/40">
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

          {/* View mode: merged voucher rows vs raw per-item/godown rows */}
          <div
            role="group"
            aria-label="Table view"
            className="flex items-center gap-1 rounded-lg border border-border bg-muted/50 p-0.5 dark:bg-muted/40"
          >
            {[
              { value: false, label: 'Merged' },
              { value: true, label: 'Raw' },
            ].map((option) => (
              <button
                key={option.label}
                onClick={() => setRawView(option.value)}
                aria-pressed={rawView === option.value}
                className={cn(
                  'rounded-md px-3 py-1 text-xs font-medium transition-all duration-150',
                  rawView === option.value
                    ? 'bg-background text-blue-700 shadow-sm dark:bg-blue-500/15 dark:text-blue-300'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Export dropdown — current page records or all filtered records,
              in PDF or Excel */}
          {data.length > 0 && (
            <ExportDropdown
              job={exportJob}
              pageCount={pageRows.length}
              totalCount={totalRecords ?? null}
              onSelect={runExport}
              extraGroups={[
                {
                  label: 'Raw rows (per item & godown)',
                  items: [
                    {
                      action: 'excel-raw',
                      label: 'Excel · one row per item & godown',
                    },
                    {
                      action: 'pdf-raw',
                      label: 'PDF · one row per item & godown',
                    },
                  ],
                },
              ]}
              // Re-fetch the filtered total so the preview shows a live count
              // (the dropdown's totalRecords comes from the last page fetch).
              // The signal aborts the request when the preview dialog closes.
              fetchLiveCount={async (signal) => {
                const response = await fetchFreightService(
                  'delivery_note',
                  {
                    ...(exportParams ?? {}),
                    page: 1,
                    per_page: 1,
                  },
                  signal,
                )
                return response?.meta?.total ?? null
              }}
            />
          )}

          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-8 rounded-lg text-xs text-muted-foreground shadow-xs transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                <MixerHorizontalIcon className="mr-2 h-4 w-4" />
                Columns
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[160px]">
              <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
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
      <div
        ref={tableWrapperRef}
        className="relative overflow-x-auto rounded-lg border border-border"
      >
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                className="border-b border-border bg-muted/50"
              >
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
                      header.column.getCanSort() &&
                        'cursor-pointer select-none hover:text-foreground',
                      'relative',
                      // The Bill column is pinned to the right edge while the
                      // rest of the table scrolls horizontally beneath it.
                      header.column.id === 'actions' &&
                        cn(
                          'sticky right-0 z-20 rounded-tr bg-muted transition-shadow',
                          tableScrolled &&
                            'shadow-[-10px_0_10px_-10px_rgba(0,0,0,0.3)]',
                        ),
                    )}
                    onClick={
                      header.column.getCanSort()
                        ? header.column.getToggleSortingHandler()
                        : undefined
                    }
                  >
                    <div className="flex items-center">
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
                  className={cn(
                    'group/row border-b border-border/60 transition-colors duration-150',
                    rowIdx % 2 === 0 ? 'bg-background' : 'bg-muted/20',
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
                        // Pinned Bill column: solid background so scrolled
                        // content never bleeds through, hover mirrors the row.
                        cell.column.id === 'actions' &&
                          cn(
                            'sticky right-0 z-10 bg-background transition-colors group-hover/row:bg-accent/50',
                            tableScrolled &&
                              'shadow-[-10px_0_10px_-10px_rgba(0,0,0,0.3)]',
                          ),
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
                  className="h-32 text-center text-sm text-muted-foreground"
                >
                  No results found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Export wait overlay — blocking until moved to background */}
      {exportJob && !exportJob.background && (
        <ExportOverlay
          job={exportJob}
          eta={eta}
          progress={exportProgress}
          onBackground={handleRunInBackground}
          onCancel={cancelExport}
        />
      )}

      {/* Footer with totals and pagination */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-border bg-muted/40 px-5 py-2.5 text-sm dark:bg-muted/30">
        {data.length > 0 && (
          <div className="flex flex-wrap items-center gap-6">
            <span className="text-xs font-medium text-muted-foreground">
              Total Records:{' '}
              <span className="font-semibold text-blue-700 dark:text-blue-400">
                {totalRecords ?? data.length}
              </span>
            </span>
            <span className="text-xs font-medium text-muted-foreground">
              This Page Fare:{' '}
              <span className="font-semibold text-blue-700 dark:text-blue-400">
                ₹
                {totalFare.toLocaleString('en-IN', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </span>
            {totalFareOverall !== undefined && (
              <span className="text-xs font-medium text-muted-foreground">
                Overall Fare:{' '}
                <span className="font-semibold text-blue-700 dark:text-blue-400">
                  ₹
                  {totalFareOverall.toLocaleString('en-IN', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
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
