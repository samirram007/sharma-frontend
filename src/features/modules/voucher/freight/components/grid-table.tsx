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
import type { ReactNode } from 'react'
import { ChevronDown, ChevronUp, Download, Loader2, Search } from 'lucide-react'
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
import { Skeleton } from '@/components/ui/skeleton'
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
import {
  deliveryLockMoment,
  deliveryLockReasonLabel,
} from '../../shared/delivery-lock'
import { date_format } from '@/utils/removeEmptyStrings'
import { ExportDropdown, ExportOverlay } from '../shared/export-controls'
import { useExportJob } from '../shared/export-job'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

declare module '@tanstack/react-table' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- required by the augmented interface's type signature
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
  /** True while the data rows are being fetched — the toolbar and table header
   *  stay mounted and the body shows skeleton rows instead. */
  isLoading?: boolean
  /** Rendered inside the table body when there is nothing to show. */
  emptyState?: ReactNode
  /** Active server-side sort (column id + direction), from the URL search. */
  sorting?: SortingState
  /** Commits a sort change as API fields (`voucher_date`, `party`, …). */
  onSortChange?: (sortBy: string, sortOrder: string) => void
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
      status: item.deliveryLocked
        ? `Postponed${
            item.deliveryLockReason
              ? ` (${deliveryLockReasonLabel(item.deliveryLockReason)})`
              : ''
          }`
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
  { header: 'Status', accessor: 'status' },
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

/**
 * Compact dispatch summary mirroring the merged grid Dispatch column:
 * "No / Source → Destination / Carrier · Vehicle" lines joined by newlines
 * (multi-line cell in the export, '-' when the dispatch detail is empty).
 */
function formatDispatchSummary(item: VoucherSchema): string {
  const d = item.voucherDispatchDetail
  const lines = [
    d?.billOfLadingNo ?? '',
    [d?.source, d?.destination].filter(Boolean).join(' → '),
    [d?.carrierName, d?.motorVehicleNo].filter(Boolean).join(' · '),
  ].filter(Boolean)

  return lines.length > 0 ? lines.join('\n') : '-'
}

function toExportRows(records: Array<VoucherSchema>) {
  return records.map((item, idx) => ({
    slNo: idx + 1,
    voucherDate: date_format(item.voucherDate),
    voucherNo: item.voucherNo ?? '',
    partyName: item.party?.name ?? '',
    dispatch: formatDispatchSummary(item),
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
    weight: item.voucherDispatchDetail?.weight
      ? Number(item.voucherDispatchDetail.weight).toFixed(3)
      : '',
    rate: item.voucherDispatchDetail?.rate
      ? Number(item.voucherDispatchDetail.rate).toFixed(2)
      : '',
    totalFare: item.voucherDispatchDetail?.totalFare
      ? Number(item.voucherDispatchDetail.totalFare).toFixed(2)
      : '',
    // Postponed (locked) deliveries — the lock reason travels with the export
    // so postponed rows stay explainable outside the app.
    status: item.deliveryLocked
      ? `Postponed${
          item.deliveryLockReason
            ? ` (${deliveryLockReasonLabel(item.deliveryLockReason)})`
            : ''
        }`
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
  onPageChange,
  freightStatus = 'pending',
  onFreightStatusChange,
  zones,
  zoneId,
  onZoneChange,
  exportParams,
  isLoading = false,
  emptyState,
  sorting = [],
  onSortChange,
}: DataTableProps) {
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  // The setter is intentionally unused — the table manages its own global
  // filter state internally (see useReactTable's initialState below).
  const [globalFilter] = useState('')
  const [columnSizing, setColumnSizing] = useState({})
  const [deliveryLockPreviewOpen, setDeliveryLockPreviewOpen] = useState(false)
  const [deliveryLockPreviewLoading, setDeliveryLockPreviewLoading] =
    useState(false)
  const [deliveryLockPreviewError, setDeliveryLockPreviewError] = useState<
    string | null
  >(null)
  const [deliveryLockPreviewRows, setDeliveryLockPreviewRows] = useState<
    Array<VoucherSchema>
  >([])
  const [rateComparisonPreviewOpen, setRateComparisonPreviewOpen] =
    useState(false)
  const [rateComparisonPreviewLoading, setRateComparisonPreviewLoading] =
    useState(false)
  const [rateComparisonPreviewError, setRateComparisonPreviewError] = useState<
    string | null
  >(null)
  const [rateComparisonPreviewRows, setRateComparisonPreviewRows] = useState<
    Array<VoucherSchema>
  >([])
  const [rateComparisonFilter, setRateComparisonFilter] = useState<
    'all' | 'different'
  >('all')

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
  const displayColumns = rawView ? rawColumnDefs : columns

  const table = useReactTable<any>({
    data: rawView ? toRawExportRows(data) : data,
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
    manualSorting: true,
    pageCount: safePageCount,
    // Sorting is server-side (the list is paginated): map the column id to the
    // field the API orders by and let the page refetch. Unsupported columns
    // clear the sort instead of sending an unknown field.
    onSortingChange: (updater) => {
      const next = typeof updater === 'function' ? updater(sorting) : updater

      if (next.length === 0) {
        onSortChange?.('', '')
        return
      }

      const sortMap: Record<string, string> = {
        voucherDate: 'voucher_date',
        voucherNo: 'voucher_no',
        partyName: 'party',
      }
      const sortBy = sortMap[next[0].id]

      if (!sortBy) {
        onSortChange?.('', '')
        return
      }

      onSortChange?.(sortBy, next[0].desc ? 'desc' : 'asc')
    },
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
  // When the delivery-lock filter is active, raw exports must still expand the
  // full page of vouchers (not just the filtered subset) so the export reflects
  // what the backend would return.
  const pageRows = useMemo(
    () => table.getRowModel().rows.map((row) => row.original),
    [table],
  )

  const exportData = data

  // Prepare export column mapping from the MERGED column definitions — never
  // the table's, so merged exports keep their columns even in raw view.
  const exportColumns = useMemo(() => {
    // Human-readable headers for id-based columns (their `header` is JSX, so
    // the id alone would produce e.g. "totalFare" / "dispatch" labels).
    const HEADER_LABELS: Record<string, string> = {
      dispatch: 'Dispatch',
      items: 'Items',
      weight: 'Weight (Mt)',
      rate: 'Rate (Per Mt)',
      totalFare: 'Total Fare',
      partyName: 'Distributor',
      voucherNo: 'Dl. No.',
      voucherDate: 'Date',
      status: 'Status',
    }
    return columns
      .filter((col) => col.id !== 'actions' && col.id !== 'slNo')
      .map((col) => {
        const accessor = String(
          (col as { accessorKey?: string }).accessorKey ?? col.id ?? '',
        )
        if (!accessor || accessor.startsWith('_')) return null
        // Derive a human-readable header from the column definition
        let header = HEADER_LABELS[accessor] ?? accessor
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
    getPageRows: () => exportData,
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
      } else if (action === 'delivery-lock-report') {
        const { default: exportTableToCsv } =
          await import('@/utils/export-table-csv')
        await exportTableToCsv({
          columnData: deliveryLockReportColumns,
          data: getDeliveryLockReportRows(rows),
          fileName: 'freight-delivery-lock-report.csv',
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

  const openDeliveryLockPreview = async () => {
    setDeliveryLockPreviewOpen(true)
    setDeliveryLockPreviewLoading(true)
    setDeliveryLockPreviewError(null)
    setDeliveryLockPreviewRows([])

    try {
      const batchSize = 100
      const rows: Array<VoucherSchema> = []
      let page = 1
      let total: number | null = null
      let pageRecords: Array<VoucherSchema>

      do {
        const response = await fetchFreightService('delivery_note', {
          ...(exportParams ?? {}),
          freight_status: 'all',
          lock_history: true,
          page,
          per_page: batchSize,
        })
        pageRecords = response?.data ?? []
        rows.push(...pageRecords)
        setDeliveryLockPreviewRows([...rows])
        total = response?.meta?.total ?? null
        page += 1
      } while (
        pageRecords.length === batchSize &&
        (total === null || rows.length < total)
      )

      setDeliveryLockPreviewRows(rows)
    } catch {
      setDeliveryLockPreviewError(
        'Could not load delivery lock history. Please try again.',
      )
    } finally {
      setDeliveryLockPreviewLoading(false)
    }
  }

  const openRateComparisonPreview = async () => {
    setRateComparisonPreviewOpen(true)
    setRateComparisonPreviewLoading(true)
    setRateComparisonPreviewError(null)
    setRateComparisonPreviewRows([])
    setRateComparisonFilter('all')

    try {
      const batchSize = 100
      const rows: Array<VoucherSchema> = []
      let page = 1
      let total: number | null = null
      let pageRecords: Array<VoucherSchema>

      do {
        const response = await fetchFreightService('delivery_note', {
          ...(exportParams ?? {}),
          freight_status: 'all',
          page,
          per_page: batchSize,
        })
        pageRecords = response?.data ?? []
        rows.push(...pageRecords)
        setRateComparisonPreviewRows([...rows])
        total = response?.meta?.total ?? null
        page += 1
      } while (
        pageRecords.length === batchSize &&
        (total === null || rows.length < total)
      )
    } catch {
      setRateComparisonPreviewError(
        'Could not load rate comparison data. Please try again.',
      )
    } finally {
      setRateComparisonPreviewLoading(false)
    }
  }

  const getRateComparisonReportRows = (records: Array<VoucherSchema>) =>
    records.flatMap((item) => {
      const dispatch = item.voucherDispatchDetail
      const originalRate = dispatch?.rate
      const senderRate = dispatch?.senderRate

      if (originalRate == null && senderRate == null) return []

      const difference =
        originalRate == null || senderRate == null
          ? null
          : Number(senderRate) - Number(originalRate)

      return [
        {
          voucherNo: item.voucherNo ?? '',
          date: date_format(item.voucherDate),
          party: item.party?.name ?? '',
          freightBasis: dispatch?.freightBasis ?? '',
          originalRate:
            originalRate == null ? '' : Number(originalRate).toFixed(2),
          senderRate: senderRate == null ? '' : Number(senderRate).toFixed(2),
          difference: difference == null ? '' : difference.toFixed(2),
          comparison:
            difference == null
              ? 'Incomplete rates'
              : difference > 0
                ? 'Sender rate is higher'
                : difference < 0
                  ? 'Sender rate is lower'
                  : 'Rates match',
        },
      ]
    })

  const rateComparisonRows = getRateComparisonReportRows(
    rateComparisonPreviewRows,
  )
  const rateComparisonSummary = {
    higher: rateComparisonRows.filter(
      (row) => row.comparison === 'Sender rate is higher',
    ).length,
    lower: rateComparisonRows.filter(
      (row) => row.comparison === 'Sender rate is lower',
    ).length,
    matching: rateComparisonRows.filter(
      (row) => row.comparison === 'Rates match',
    ).length,
  }
  const visibleRateComparisonRows =
    rateComparisonFilter === 'different'
      ? rateComparisonRows.filter(
          (row) =>
            row.comparison === 'Sender rate is higher' ||
            row.comparison === 'Sender rate is lower',
        )
      : rateComparisonRows
  const rateComparisonColumns: Array<{
    header: string
    accessor: keyof (typeof rateComparisonRows)[number]
  }> = [
    { header: 'Dl. No.', accessor: 'voucherNo' },
    { header: 'Date', accessor: 'date' },
    { header: 'Distributor', accessor: 'party' },
    { header: 'Freight Basis', accessor: 'freightBasis' },
    { header: 'Original Rate', accessor: 'originalRate' },
    { header: 'Sender Rate', accessor: 'senderRate' },
    { header: 'Difference (Sender − Original)', accessor: 'difference' },
    { header: 'Comparison', accessor: 'comparison' },
  ]

  const downloadRateComparisonCsv = async () => {
    const { default: exportTableToCsv } =
      await import('@/utils/export-table-csv')

    await exportTableToCsv({
      columnData: rateComparisonColumns,
      data: visibleRateComparisonRows,
      fileName: 'freight-sender-rate-comparison.csv',
    })
  }

  const getDeliveryLockReportRows = (rows: Array<VoucherSchema>) =>
    rows.map((item) => {
      const dispatch = item.voucherDispatchDetail
      return {
        voucherNo: item.voucherNo ?? '',
        date: date_format(item.voucherDate),
        party: item.party?.name ?? '',
        dispatchNo: dispatch?.billOfLadingNo ?? '',
        route: [
          dispatch?.source,
          dispatch?.destination,
          dispatch?.destinationSecondary,
        ]
          .filter(Boolean)
          .join(' → '),
        carrier: dispatch?.carrierName ?? '',
        vehicle: dispatch?.motorVehicleNo ?? '',
        weight:
          dispatch?.weight == null ? '' : Number(dispatch.weight).toFixed(3),
        rate: dispatch?.rate == null ? '' : Number(dispatch.rate).toFixed(2),
        totalFare:
          dispatch?.totalFare == null
            ? ''
            : Number(dispatch.totalFare).toFixed(2),
        status: item.deliveryLocked ? 'Postponed' : 'Released',
        reason: item.latestDeliveryLock?.reason
          ? (deliveryLockReasonLabel(item.latestDeliveryLock.reason) ?? '')
          : item.deliveryLockReason
            ? (deliveryLockReasonLabel(item.deliveryLockReason) ?? '')
            : '',
        note: item.latestDeliveryLock?.note ?? item.deliveryLockNote ?? '',
        lockedAt:
          deliveryLockMoment(item.latestDeliveryLock?.lockedAt) ??
          deliveryLockMoment(item.deliveryLockedAt) ??
          '',
        lockedBy:
          item.latestDeliveryLock?.lockedByName ??
          item.deliveryLockedByName ??
          '',
        unlockedAt:
          deliveryLockMoment(item.latestDeliveryLock?.unlockedAt) ??
          deliveryLockMoment(item.deliveryUnlockedAt) ??
          '',
        unlockedBy:
          item.latestDeliveryLock?.unlockedByName ??
          item.deliveryUnlockedByName ??
          '',
      }
    })

  const lockedPreviewCount = deliveryLockPreviewRows.filter(
    (item) => item.deliveryLocked,
  ).length
  const releasedPreviewCount =
    deliveryLockPreviewRows.length - lockedPreviewCount

  const deliveryLockReportColumns: Array<{
    header: string
    accessor: keyof ReturnType<typeof getDeliveryLockReportRows>[number]
  }> = [
    { header: 'Dl. No.', accessor: 'voucherNo' },
    { header: 'Date', accessor: 'date' },
    { header: 'Distributor', accessor: 'party' },
    { header: 'Dispatch No.', accessor: 'dispatchNo' },
    { header: 'Route', accessor: 'route' },
    { header: 'Carrier', accessor: 'carrier' },
    { header: 'Vehicle', accessor: 'vehicle' },
    { header: 'Weight (Mt)', accessor: 'weight' },
    { header: 'Rate', accessor: 'rate' },
    { header: 'Total Fare', accessor: 'totalFare' },
    { header: 'Status', accessor: 'status' },
    { header: 'Reason', accessor: 'reason' },
    { header: 'Note', accessor: 'note' },
    { header: 'Postponed At', accessor: 'lockedAt' },
    { header: 'Postponed By', accessor: 'lockedBy' },
    { header: 'Released At', accessor: 'unlockedAt' },
    { header: 'Released By', accessor: 'unlockedBy' },
  ]

  const downloadDeliveryLockPreview = async () => {
    const { default: exportTableToCsv } =
      await import('@/utils/export-table-csv')

    await exportTableToCsv({
      columnData: deliveryLockReportColumns,
      data: getDeliveryLockReportRows(deliveryLockPreviewRows),
      fileName: 'freight-delivery-lock-report.csv',
    })
  }

  // Sum totals from the current page data.
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
      {/* Toolbar with search, freight status filter, delivery-lock filter, column visibility toggle + export buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-2 pt-1">
        <div className="flex items-center gap-3">
          {/* Search input — auto-commits debounced (no click-to-search) */}
          <div className="relative flex w-[200px] items-center">
            <Search className="absolute left-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search delivery, party, carrier, vehicle, route, destination..."
              value={search || ''}
              className="h-8 w-full pl-8 pr-3 text-xs"
              onChange={(e) => onSearchChange?.(e.target.value)}
            />
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
              { value: 'locked', label: 'Postponed' },
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
              onSelect={(action, scope) => {
                if (action === 'delivery-lock-report') {
                  void openDeliveryLockPreview()
                } else if (action === 'sender-rate-comparison') {
                  void openRateComparisonPreview()
                } else {
                  runExport(action, scope)
                }
              }}
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
                {
                  label: 'Preview report',
                  items: [
                    {
                      action: 'delivery-lock-report',
                      label: 'Delivery lock & release report',
                      direct: true,
                    },
                    {
                      action: 'sender-rate-comparison',
                      label: 'Sender vs original rate',
                      direct: true,
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
            {isLoading ? (
              // Skeleton rows keep the toolbar + table header mounted while
              // only the data rows are being fetched.
              Array.from({ length: Math.max(localPageSize, 1) }).map((_, i) => (
                <TableRow
                  key={`skeleton-row-${i}`}
                  className="border-b border-border/60"
                >
                  {table.getVisibleLeafColumns().map((column, colIdx) => (
                    <TableCell
                      key={`skeleton-cell-${i}-${column.id}`}
                      style={{
                        width: column.getSize(),
                        minWidth: column.columnDef.minSize,
                        maxWidth: column.columnDef.maxSize,
                      }}
                      className={cn(
                        'px-3 py-2.5',
                        column.columnDef.meta?.className ?? '',
                        column.id === 'actions' &&
                          'sticky right-0 z-10 bg-background',
                      )}
                    >
                      <Skeleton
                        className="h-3.5"
                        style={{
                          width:
                            colIdx === 0
                              ? '40%'
                              : `${45 + ((i * 7 + colIdx * 13) % 45)}%`,
                        }}
                      />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : !table.getRowModel().rows.length && emptyState ? (
              <TableRow>
                <TableCell
                  colSpan={table.getVisibleLeafColumns().length}
                  className="p-0"
                >
                  {emptyState}
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows.length ? (
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

      <Dialog
        open={deliveryLockPreviewOpen}
        onOpenChange={setDeliveryLockPreviewOpen}
      >
        <DialogContent className="flex h-[90vh] w-[98vw] max-w-[96rem] flex-col gap-5 sm:max-w-[96rem]">
          <DialogHeader>
            <DialogTitle>Delivery lock & release report</DialogTitle>
            <DialogDescription>
              {' '}
              {deliveryLockPreviewRows.length === 1
                ? '1 delivery'
                : `${deliveryLockPreviewRows.length} deliveries`}{' '}
              with lock history matching the current filters.
            </DialogDescription>
            {!deliveryLockPreviewLoading && !deliveryLockPreviewError && (
              <div className="grid grid-cols-2 gap-3 pt-2 sm:max-w-md">
                <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-900/60 dark:bg-amber-950/20">
                  <div className="text-xs font-medium text-amber-800 dark:text-amber-300">
                    Currently postponed
                  </div>
                  <div className="mt-1 text-xl font-semibold tabular-nums text-amber-900 dark:text-amber-200">
                    {lockedPreviewCount}
                  </div>
                </div>
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 dark:border-emerald-900/60 dark:bg-emerald-950/20">
                  <div className="text-xs font-medium text-emerald-800 dark:text-emerald-300">
                    Released
                  </div>
                  <div className="mt-1 text-xl font-semibold tabular-nums text-emerald-900 dark:text-emerald-200">
                    {releasedPreviewCount}
                  </div>
                </div>
              </div>
            )}
          </DialogHeader>
          <div className="min-h-0 flex-1 overflow-auto rounded-md border">
            {deliveryLockPreviewLoading &&
            deliveryLockPreviewRows.length === 0 ? (
              <div className="flex items-center justify-center gap-2 p-10 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading delivery lock history…
              </div>
            ) : deliveryLockPreviewError &&
              deliveryLockPreviewRows.length === 0 ? (
              <p
                role="alert"
                className="p-6 text-center text-sm text-destructive"
              >
                {deliveryLockPreviewError}
              </p>
            ) : deliveryLockPreviewRows.length === 0 ? (
              <p className="p-6 text-center text-sm text-muted-foreground">
                No deliveries with lock history match the current filters.
              </p>
            ) : (
              <>
                {deliveryLockPreviewLoading && (
                  <div className="sticky top-0 z-10 flex items-center gap-2 border-b bg-background/95 px-4 py-2 text-xs text-muted-foreground backdrop-blur">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Loading more delivery history…{' '}
                    {deliveryLockPreviewRows.length} loaded
                  </div>
                )}
                {deliveryLockPreviewError && (
                  <p
                    role="alert"
                    className="border-b bg-destructive/5 px-4 py-2 text-xs text-destructive"
                  >
                    {deliveryLockPreviewError} Showing the rows loaded so far.
                  </p>
                )}
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-24">Dl. No.</TableHead>
                      <TableHead className="min-w-28">Date</TableHead>
                      <TableHead className="min-w-40">Distributor</TableHead>
                      <TableHead className="min-w-32">Dispatch No.</TableHead>
                      <TableHead className="min-w-56">Route</TableHead>
                      <TableHead className="min-w-36">Carrier</TableHead>
                      <TableHead className="min-w-28">Vehicle</TableHead>
                      <TableHead className="min-w-28 text-right">
                        Weight
                      </TableHead>
                      <TableHead className="min-w-24 text-right">
                        Rate
                      </TableHead>
                      <TableHead className="min-w-28 text-right">
                        Fare
                      </TableHead>
                      <TableHead className="min-w-28">Status</TableHead>
                      <TableHead className="min-w-36">Reason</TableHead>
                      <TableHead className="min-w-56">Note</TableHead>
                      <TableHead className="min-w-40">Postponed At</TableHead>
                      <TableHead className="min-w-32">Postponed By</TableHead>
                      <TableHead className="min-w-40">Released At</TableHead>
                      <TableHead className="min-w-32">Released By</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {deliveryLockPreviewRows.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">
                          {item.voucherNo ?? '—'}
                        </TableCell>
                        <TableCell>{date_format(item.voucherDate)}</TableCell>
                        <TableCell className="whitespace-normal">
                          {item.party?.name ?? '—'}
                        </TableCell>
                        <TableCell>
                          {item.voucherDispatchDetail?.billOfLadingNo ?? '—'}
                        </TableCell>
                        <TableCell className="whitespace-normal">
                          {[
                            item.voucherDispatchDetail?.source,
                            item.voucherDispatchDetail?.destination,
                            item.voucherDispatchDetail?.destinationSecondary,
                          ]
                            .filter(Boolean)
                            .join(' → ') || '—'}
                        </TableCell>
                        <TableCell>
                          {item.voucherDispatchDetail?.carrierName ?? '—'}
                        </TableCell>
                        <TableCell>
                          {item.voucherDispatchDetail?.motorVehicleNo ?? '—'}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {item.voucherDispatchDetail?.weight == null
                            ? '—'
                            : Number(item.voucherDispatchDetail.weight).toFixed(
                                3,
                              )}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {item.voucherDispatchDetail?.rate == null
                            ? '—'
                            : Number(item.voucherDispatchDetail.rate).toFixed(
                                2,
                              )}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {item.voucherDispatchDetail?.totalFare == null
                            ? '—'
                            : Number(
                                item.voucherDispatchDetail.totalFare,
                              ).toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <span
                            className={cn(
                              'rounded-full px-2 py-1 text-xs font-medium',
                              item.deliveryLocked
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'
                                : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
                            )}
                          >
                            {item.deliveryLocked ? 'Postponed' : 'Released'}
                          </span>
                        </TableCell>
                        <TableCell>
                          {item.latestDeliveryLock?.reason
                            ? deliveryLockReasonLabel(
                                item.latestDeliveryLock.reason,
                              )
                            : item.deliveryLockReason
                              ? deliveryLockReasonLabel(item.deliveryLockReason)
                              : '—'}
                        </TableCell>
                        <TableCell className="max-w-[24rem] whitespace-normal">
                          {item.latestDeliveryLock?.note ??
                            item.deliveryLockNote ??
                            '—'}
                        </TableCell>
                        <TableCell>
                          {deliveryLockMoment(
                            item.latestDeliveryLock?.lockedAt,
                          ) ??
                            deliveryLockMoment(item.deliveryLockedAt) ??
                            '—'}
                        </TableCell>
                        <TableCell>
                          {item.latestDeliveryLock?.lockedByName ??
                            item.deliveryLockedByName ??
                            '—'}
                        </TableCell>
                        <TableCell>
                          {deliveryLockMoment(
                            item.latestDeliveryLock?.unlockedAt,
                          ) ??
                            deliveryLockMoment(item.deliveryUnlockedAt) ??
                            '—'}
                        </TableCell>
                        <TableCell>
                          {item.latestDeliveryLock?.unlockedByName ??
                            item.deliveryUnlockedByName ??
                            '—'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </>
            )}
          </div>
          <DialogFooter>
            <Button
              onClick={() => void downloadDeliveryLockPreview()}
              disabled={
                deliveryLockPreviewLoading ||
                deliveryLockPreviewRows.length === 0
              }
            >
              <Download className="mr-2 h-4 w-4" />
              Download detailed CSV
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={rateComparisonPreviewOpen}
        onOpenChange={setRateComparisonPreviewOpen}
      >
        <DialogContent className="flex h-[85vh] w-[96vw] max-w-[72rem] flex-col gap-5 sm:max-w-[72rem]">
          <DialogHeader>
            <DialogTitle>Sender vs original freight rate</DialogTitle>
            <DialogDescription>
              Compare per-unit sender rates with original freight rates for
              deliveries matching the current filters. Difference is sender rate
              minus original rate.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-3 gap-3 sm:max-w-2xl">
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 dark:border-emerald-900/60 dark:bg-emerald-950/20">
              <div className="text-xs font-medium text-emerald-800 dark:text-emerald-300">
                Sender rate higher
              </div>
              <div className="mt-1 text-xl font-semibold tabular-nums text-emerald-900 dark:text-emerald-200">
                {rateComparisonSummary.higher}
              </div>
            </div>
            <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 dark:border-rose-900/60 dark:bg-rose-950/20">
              <div className="text-xs font-medium text-rose-800 dark:text-rose-300">
                Sender rate lower
              </div>
              <div className="mt-1 text-xl font-semibold tabular-nums text-rose-900 dark:text-rose-200">
                {rateComparisonSummary.lower}
              </div>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-900/50">
              <div className="text-xs font-medium text-slate-600 dark:text-slate-300">
                Rates match
              </div>
              <div className="mt-1 text-xl font-semibold tabular-nums text-slate-900 dark:text-slate-100">
                {rateComparisonSummary.matching}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground">
              Show
            </span>
            <Select
              value={rateComparisonFilter}
              onValueChange={(value) =>
                setRateComparisonFilter(value as 'all' | 'different')
              }
            >
              <SelectTrigger className="h-8 w-44 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All rate comparisons</SelectItem>
                <SelectItem value="different">Different rates only</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-xs text-muted-foreground">
              {visibleRateComparisonRows.length} of {rateComparisonRows.length}{' '}
              rows
            </span>
          </div>
          <div className="min-h-0 flex-1 overflow-auto rounded-md border">
            {rateComparisonPreviewLoading &&
            rateComparisonPreviewRows.length === 0 ? (
              <div className="flex items-center justify-center gap-2 p-10 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading rate comparison…
              </div>
            ) : rateComparisonPreviewError &&
              rateComparisonPreviewRows.length === 0 ? (
              <p
                role="alert"
                className="p-6 text-center text-sm text-destructive"
              >
                {rateComparisonPreviewError}
              </p>
            ) : visibleRateComparisonRows.length === 0 ? (
              <p className="p-6 text-center text-sm text-muted-foreground">
                {rateComparisonFilter === 'different'
                  ? 'No deliveries with different sender and original rates match the current filters.'
                  : 'No deliveries with sender or original rates match the current filters.'}
              </p>
            ) : (
              <>
                {rateComparisonPreviewLoading && (
                  <div className="sticky top-0 z-10 flex items-center gap-2 border-b bg-background/95 px-4 py-2 text-xs text-muted-foreground backdrop-blur">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Loading more deliveries… {
                      rateComparisonPreviewRows.length
                    }{' '}
                    loaded
                  </div>
                )}
                {rateComparisonPreviewError && (
                  <p
                    role="alert"
                    className="border-b bg-destructive/5 px-4 py-2 text-xs text-destructive"
                  >
                    {rateComparisonPreviewError} Showing the rows loaded so far.
                  </p>
                )}
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-24">Dl. No.</TableHead>
                      <TableHead className="min-w-28">Date</TableHead>
                      <TableHead className="min-w-40">Distributor</TableHead>
                      <TableHead className="min-w-28">Basis</TableHead>
                      <TableHead className="min-w-28 text-right">
                        Original Rate
                      </TableHead>
                      <TableHead className="min-w-28 text-right">
                        Sender Rate
                      </TableHead>
                      <TableHead className="min-w-40 text-right">
                        Difference
                      </TableHead>
                      <TableHead className="min-w-40">Comparison</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {visibleRateComparisonRows.map((row, index) => (
                      <TableRow key={`${row.voucherNo}-${index}`}>
                        <TableCell className="font-medium">
                          {row.voucherNo || '—'}
                        </TableCell>
                        <TableCell>{row.date}</TableCell>
                        <TableCell>{row.party || '—'}</TableCell>
                        <TableCell>{row.freightBasis || '—'}</TableCell>
                        <TableCell className="text-right tabular-nums">
                          {row.originalRate || '—'}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {row.senderRate || '—'}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {row.difference || '—'}
                        </TableCell>
                        <TableCell>{row.comparison}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </>
            )}
          </div>
          <DialogFooter>
            <Button
              onClick={() => void downloadRateComparisonCsv()}
              disabled={
                rateComparisonPreviewLoading ||
                visibleRateComparisonRows.length === 0
              }
            >
              <Download className="mr-2 h-4 w-4" />
              Download CSV
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
