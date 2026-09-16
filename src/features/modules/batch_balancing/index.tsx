import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Skeleton } from '@/components/ui/skeleton'
import {
  IconBuildingWarehouse,
  IconCalendarMonth,
  IconChevronDown,
  IconChevronRight,
  IconFilter,
  IconPackage,
  IconRefresh,
  IconTags,
  IconX,
} from '@tabler/icons-react'
import { useQuery } from '@tanstack/react-query'
import { fetchGodownService } from '@/features/modules/godown/data/api'
import { fetchStockItemService } from '@/features/modules/stock_item/data/api'
import { Main } from '@/layouts/components/main'
import { cn } from '@/lib/utils'
import { useAuth } from '@/features/auth/contexts/AuthContext'
import { useEffect, useMemo, useState } from 'react'
import {
  CheckIcon,
  ChevronDown,
  ChevronUp,
  Download,
  FileSpreadsheet,
  FileText,
  Loader2,
  Search,
} from 'lucide-react'
import { formatQty } from '@/utils/format-num'
import { FilterSheetSelect } from './filter-sheet-select'
import { useItemStockMeta } from './use-item-stock-meta'
import {
  batchBalancingQueryOptions,
  batchSuggestionsQueryOptions,
} from './data/queryOptions'
import type {
  BatchBalance,
  BatchBalancingReport,
  BatchMovement,
} from './data/schema'

function formatAmt(val: number | null | undefined): string {
  return (val ?? 0).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

function formatDate(val: string | null | undefined): string {
  if (!val) return '—'
  const d = new Date(val)
  return isNaN(d.getTime())
    ? val
    : d.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
}

/** Local yyyy-MM-dd for the backend (avoids the UTC day-shift of toISOString). */
function toDbDate(value?: Date | string | null): string | null {
  if (!value) return null
  const d = new Date(value)
  if (isNaN(d.getTime())) return null
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate(),
  ).padStart(2, '0')}`
}

/** One flat row per movement for CSV/Excel/PDF export. */
function flattenForExport(report: BatchBalancingReport) {
  const rows: Record<string, string>[] = []
  for (const batch of report.batches) {
    rows.push({
      itemName: batch.itemName,
      itemCode: batch.itemCode ?? '',
      godownName: batch.godownName ?? '',
      batchNo: batch.batchNo,
      serialNo: '',
      movement: 'OPENING',
      voucherNo: '',
      voucherDate: '',
      detail: '',
      inward: '',
      outward: '',
      balance: batch.openingQuantity.toFixed(batch.noOfDecimalPlaces),
    })
    for (const mv of batch.movements) {
      rows.push({
        itemName: batch.itemName,
        itemCode: batch.itemCode ?? '',
        godownName: batch.godownName ?? '',
        batchNo: batch.batchNo,
        serialNo: mv.serialNo ?? '',
        movement: mv.movementType === 'in' ? 'INWARD' : 'OUTWARD',
        voucherNo: mv.voucherNo ?? '',
        voucherDate: formatDate(mv.voucherDate),
        detail: mv.voucherTypeName ?? '',
        inward:
          mv.movementType === 'in'
            ? mv.quantity.toFixed(batch.noOfDecimalPlaces)
            : '',
        outward:
          mv.movementType === 'out'
            ? mv.quantity.toFixed(batch.noOfDecimalPlaces)
            : '',
        balance: mv.runningBalance.toFixed(batch.noOfDecimalPlaces),
      })
    }
    rows.push({
      itemName: batch.itemName,
      itemCode: batch.itemCode ?? '',
      godownName: batch.godownName ?? '',
      batchNo: batch.batchNo,
      serialNo: '',
      movement: 'CLOSING',
      voucherNo: '',
      voucherDate: '',
      detail: '',
      inward: '',
      outward: '',
      balance: batch.closingQuantity.toFixed(batch.noOfDecimalPlaces),
    })
  }
  return rows
}

/**
 * Groups batch rows for the item-wise / godown-wise views — preserves the
 * report's item-name ordering within each group and sums O/I/O/C subtotals.
 */
function groupBatches(
  batches: BatchBalance[],
  view: 'item-wise' | 'godown-wise',
): Array<{
  key: string
  name: string
  unit: string | null
  opening: number
  inward: number
  outward: number
  closing: number
  batches: BatchBalance[]
}> {
  const groups = new Map<
    string,
    {
      key: string
      name: string
      unit: string | null
      opening: number
      inward: number
      outward: number
      closing: number
      batches: BatchBalance[]
    }
  >()

  for (const b of batches) {
    const key = view === 'item-wise' ? `i-${b.itemId}` : `g-${b.godownId}`
    const name =
      view === 'item-wise'
        ? b.itemName
        : (b.godownName ?? `Godown #${b.godownId}`)
    let g = groups.get(key)
    if (!g) {
      g = {
        key,
        name,
        unit: b.unitCode,
        opening: 0,
        inward: 0,
        outward: 0,
        closing: 0,
        batches: [],
      }
      groups.set(key, g)
    }
    g.opening += b.openingQuantity
    g.inward += b.inwardQuantity
    g.outward += b.outwardQuantity
    g.closing += b.closingQuantity
    g.batches.push(b)
  }

  return [...groups.values()]
}

const EXPORT_COLUMNS = [
  { header: 'Item', accessor: 'itemName' as const },
  { header: 'Item Code', accessor: 'itemCode' as const },
  { header: 'Godown', accessor: 'godownName' as const },
  { header: 'Batch No', accessor: 'batchNo' as const },
  { header: 'Serial No', accessor: 'serialNo' as const },
  { header: 'Movement', accessor: 'movement' as const },
  { header: 'Voucher No', accessor: 'voucherNo' as const },
  { header: 'Date', accessor: 'voucherDate' as const },
  { header: 'Voucher Type', accessor: 'detail' as const },
  { header: 'Inward Qty', accessor: 'inward' as const },
  { header: 'Outward Qty', accessor: 'outward' as const },
  { header: 'Balance', accessor: 'balance' as const },
]

export default function BatchBalancingReport() {
  // Applied filters — the query only refetches when these change. The report
  // always uses the GLOBAL fiscal period (no date filters here).
  const [applied, setApplied] = useState<{
    search: string
    itemId: string
    godownId: string
    batchNo: string
  }>({
    search: '',
    itemId: 'all',
    godownId: 'all',
    batchNo: '',
  })
  // Draft inputs — applied on "Apply" / Enter so typing doesn't refetch.
  // One merged field drives both free search AND exact batch pick: typed text
  // applies as `search`; picking a suggestion applies as exact `batchNo`.
  const [searchDraft, setSearchDraft] = useState('')
  const [batchNoDraft, setBatchNoDraft] = useState('')
  const [itemIdDraft, setItemIdDraft] = useState('all')
  const [godownIdDraft, setGodownIdDraft] = useState('all')

  // Date window = the user's global reporting period (the header "Period"
  // dialog, Alt+P). No date inputs on this page — changing the period
  // refetches. When unset the backend falls back to fiscal-year bounds.
  const { period } = useAuth()

  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set())
  const [isExporting, setIsExporting] = useState(false)

  // View grouping — batch-wise (default, one card per batch), item-wise
  // (cards grouped under their item) or godown-wise (grouped under godown).
  const [view, setView] = useState<'batch-wise' | 'item-wise' | 'godown-wise'>(
    'batch-wise',
  )

  // Batch No autocomplete — suggestions from /stock_summaries/batch_list as
  // the user types (debounced); picking one sets the EXACT batch_no filter.
  const [batchOpen, setBatchOpen] = useState(false)
  const [debouncedBatchQuery, setDebouncedBatchQuery] = useState('')
  useEffect(() => {
    const t = window.setTimeout(
      () => setDebouncedBatchQuery(batchNoDraft.trim()),
      300,
    )
    return () => window.clearTimeout(t)
  }, [batchNoDraft])

  // Suggestions mirror the item/godown DRAFT filters so the list only shows
  // batches that actually exist within the currently chosen item/godown.
  const suggestionItemId = itemIdDraft !== 'all' ? Number(itemIdDraft) : null
  const suggestionGodownId =
    godownIdDraft !== 'all' ? Number(godownIdDraft) : null

  const { data: batchSuggestions, isFetching: suggestionsFetching } = useQuery({
    ...batchSuggestionsQueryOptions(
      debouncedBatchQuery || undefined,
      suggestionItemId,
      suggestionGodownId,
    ),
    enabled: batchOpen,
  })

  const hasDraftFilters =
    !!searchDraft.trim() ||
    !!batchNoDraft.trim() ||
    itemIdDraft !== 'all' ||
    godownIdDraft !== 'all'

  // The reporting period is NOT a "filter" for this gate — it's always on, so
  // requiring it would dump every batch of the period on first paint.
  const hasAppliedFilters =
    !!applied.search.trim() ||
    !!applied.batchNo.trim() ||
    applied.itemId !== 'all' ||
    applied.godownId !== 'all'

  const applyFilters = () => {
    const batch = batchNoDraft.trim()
    setApplied({
      // An exact batch pick wins over the free-search text.
      search: batch ? '' : searchDraft.trim(),
      itemId: itemIdDraft,
      godownId: godownIdDraft,
      batchNo: batch,
    })
  }

  const clearFilters = () => {
    setSearchDraft('')
    setBatchNoDraft('')
    setItemIdDraft('all')
    setGodownIdDraft('all')
    setApplied({
      search: '',
      itemId: 'all',
      godownId: 'all',
      batchNo: '',
    })
  }

  const fromDate = toDbDate(period?.startDate)
  const toDate = toDbDate(period?.endDate)

  const params = useMemo(
    () => ({
      search: applied.search || undefined,
      itemId: applied.itemId !== 'all' ? Number(applied.itemId) : null,
      godownId: applied.godownId !== 'all' ? Number(applied.godownId) : null,
      batchNo: applied.batchNo || null,
      fromDate,
      toDate,
    }),
    [applied, fromDate, toDate],
  )

  const { data, isLoading, isError, isFetching, refetch } = useQuery({
    ...batchBalancingQueryOptions(params),
    // Don't dump the whole database on first paint — require at least one
    // criterion (search text, batch no, item, godown, or a date window).
    enabled: hasAppliedFilters,
  })

  const { data: godownList } = useQuery({
    queryKey: ['Godowns'],
    queryFn: fetchGodownService,
    staleTime: 1000 * 60 * 5,
  })
  const { data: itemList } = useQuery({
    queryKey: ['stockItems'],
    queryFn: fetchStockItemService,
    staleTime: 1000 * 60 * 5,
  })
  // Closing stock qty+unit per item — right-aligned meta in the Item sheet.
  const itemStockMeta = useItemStockMeta(batchOpen)

  const report = data?.data as BatchBalancingReport | undefined

  // Auto-expand everything when a fresh result arrives.
  useEffect(() => {
    if (!report) return
    const keys = report.batches.map(
      (b) => `${b.itemId}-${b.godownId}-${b.batchNo}`,
    )
    setExpandedKeys(new Set(keys))
  }, [report])

  const toggle = (key: string) => {
    setExpandedKeys((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  const allExpanded =
    !!report &&
    report.batches.length > 0 &&
    expandedKeys.size >= report.batches.length

  const toggleAll = () => {
    if (!report) return
    setExpandedKeys(
      allExpanded
        ? new Set()
        : new Set(
            report.batches.map((b) => `${b.itemId}-${b.godownId}-${b.batchNo}`),
          ),
    )
  }

  const handleExport = async (format: 'csv' | 'excel' | 'pdf') => {
    if (!report || isExporting) return
    setIsExporting(true)
    try {
      const rows = flattenForExport(report)
      if (rows.length === 0) return

      if (format === 'csv') {
        const headers = EXPORT_COLUMNS.map((c) => c.header)
        const flat = rows.map((r) =>
          EXPORT_COLUMNS.map(
            (c) => `"${String(r[c.accessor] ?? '').replace(/"/g, '""')}"`,
          ),
        )
        const csv =
          '\uFEFF' +
          [headers.join(','), ...flat.map((r) => r.join(','))].join('\n')
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'batch-balancing-report.csv'
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
        return
      }

      if (format === 'excel') {
        const { default: exportTableToExcel } =
          await import('@/utils/export-table-excel')
        await exportTableToExcel({
          title: 'Batch Balancing Report',
          columnData: EXPORT_COLUMNS,
          data: rows,
          fileName: 'batch-balancing-report.xlsx',
        })
      } else {
        const { default: exportTableToPdf } =
          await import('@/utils/export-table-pdf')
        exportTableToPdf({
          title: 'Batch Balancing Report',
          columnData: EXPORT_COLUMNS,
          data: rows,
          fileName: 'batch-balancing-report.pdf',
          orientation: 'l',
        })
      }
    } catch (error) {
      console.error('Batch balancing export failed:', error)
    } finally {
      setIsExporting(false)
    }
  }

  const totals = report?.totals
  const totalsUnit = report?.batches[0]?.unitCode

  return (
    <Main className="min-w-full space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <IconTags className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold tracking-tight">
              Batch Balancing Report
            </h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Batch-wise opening → inward → outward → closing balance with the
            full movement trail per item, godown and batch
          </p>
          {(fromDate || toDate) && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <IconCalendarMonth className="h-3.5 w-3.5" />
              Period:{' '}
              <span className="font-medium text-foreground">
                {fromDate ? formatDate(fromDate) : 'beginning'} →{' '}
                {toDate ? formatDate(toDate) : 'today'}
              </span>
              <span className="text-[11px]">
                (reporting period — pre-period movements roll into Opening)
              </span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          {isFetching && !isLoading && (
            <IconRefresh className="h-4 w-4 animate-spin text-muted-foreground" />
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={toggleAll}
            disabled={!report || report.batches.length === 0}
          >
            {allExpanded ? (
              <ChevronUp className="mr-1 h-4 w-4" />
            ) : (
              <ChevronDown className="mr-1 h-4 w-4" />
            )}
            {allExpanded ? 'Collapse all' : 'Expand all'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExport('csv')}
            disabled={!report || isExporting}
          >
            <Download className="mr-1 h-4 w-4" />
            CSV
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExport('excel')}
            disabled={!report || isExporting}
          >
            <FileSpreadsheet className="mr-1 h-4 w-4 text-emerald-600" />
            Excel
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExport('pdf')}
            disabled={!report || isExporting}
          >
            <FileText className="mr-1 h-4 w-4 text-red-600" />
            PDF
          </Button>
        </div>
      </div>

      {/* Filters — single inline row: label · search · item · godown · apply */}
      <Card>
        <CardContent className="p-3">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              applyFilters()
            }}
            className="flex flex-wrap items-center gap-2"
          >
            <div className="flex shrink-0 items-center gap-1.5 text-sm font-medium text-muted-foreground">
              <IconFilter className="h-4 w-4" />
              Filters
              {hasAppliedFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs"
                  onClick={clearFilters}
                >
                  <IconX className="mr-1 h-3 w-3" />
                  Clear
                </Button>
              )}
            </div>
            <div className="min-w-[200px] flex-1">
              <Popover open={batchOpen} onOpenChange={setBatchOpen}>
                <PopoverTrigger asChild>
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      role="combobox"
                      aria-expanded={batchOpen}
                      placeholder="Search batch no / item…"
                      value={batchNoDraft || searchDraft}
                      onChange={(e) => {
                        // One query drives both modes: picking a suggestion
                        // sets the exact batch; typing only and pressing Apply
                        // falls back to free-text search.
                        setBatchNoDraft('')
                        setSearchDraft(e.target.value)
                        if (!batchOpen) setBatchOpen(true)
                      }}
                      className="h-9 pr-8 pl-8"
                    />
                    {batchNoDraft || searchDraft ? (
                      <span
                        role="button"
                        tabIndex={0}
                        aria-label="Clear batch filter"
                        className="absolute right-2 top-1/2 flex h-4 w-4 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors hover:bg-destructive/15 hover:text-destructive"
                        onMouseDown={(e) => {
                          // mousedown so the input doesn't steal focus first
                          e.preventDefault()
                          e.stopPropagation()
                          setBatchNoDraft('')
                          setSearchDraft('')
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.stopPropagation()
                            e.preventDefault()
                            setBatchNoDraft('')
                            setSearchDraft('')
                          }
                        }}
                      >
                        <IconX className="h-2.5 w-2.5" />
                      </span>
                    ) : null}
                  </div>
                </PopoverTrigger>
                <PopoverContent
                  className="w-[320px] p-0"
                  align="start"
                  onOpenAutoFocus={(e) => e.preventDefault()}
                >
                  <Command shouldFilter={false}>
                    <CommandList>
                      {suggestionsFetching ? (
                        <div className="flex items-center gap-2 px-3 py-4 text-sm text-muted-foreground">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Searching batches…
                        </div>
                      ) : (batchSuggestions?.data ?? []).length === 0 ? (
                        <div className="px-3 py-4 text-sm text-muted-foreground">
                          No matching batches.
                        </div>
                      ) : (
                        <CommandGroup>
                          {(batchSuggestions?.data ?? []).map(
                            (s: any, idx: number) => {
                              // Unique per-row cmdk value — duplicate values
                              // make cmdk render every twin as "selected".
                              const value = `${s.batchNo}|${s.itemId}|${s.godownId}|${idx}`
                              const selected =
                                batchNoDraft === s.batchNo && !searchDraft
                              return (
                                <CommandItem
                                  key={value}
                                  value={value}
                                  onSelect={() => {
                                    setBatchNoDraft(s.batchNo)
                                    setSearchDraft('')
                                    setBatchOpen(false)
                                  }}
                                  className="gap-2"
                                >
                                  <CheckIcon
                                    className={cn(
                                      'h-3.5 w-3.5 shrink-0',
                                      selected ? 'opacity-100' : 'opacity-0',
                                    )}
                                  />
                                  <div className="min-w-0">
                                    <div className="truncate font-mono text-xs font-medium">
                                      {s.batchNo}
                                    </div>
                                    <div className="truncate text-xs text-muted-foreground">
                                      {s.itemName}
                                      {s.godownName ? ` · ${s.godownName}` : ''}
                                    </div>
                                  </div>
                                </CommandItem>
                              )
                            },
                          )}
                        </CommandGroup>
                      )}
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
            <FilterSheetSelect
              label="Item"
              placeholder="Search Item"
              allLabel="All items"
              value={itemIdDraft}
              onChange={setItemIdDraft}
              hideLabel
              options={(itemList?.data ?? []).map((i: any) => ({
                id: String(i.id),
                label: i.name,
                description: i.code ?? null,
                meta: itemStockMeta.get(Number(i.id)) ?? null,
              }))}
            />
            <FilterSheetSelect
              label="Godown"
              placeholder="Search Godown"
              allLabel="All godowns"
              value={godownIdDraft}
              onChange={setGodownIdDraft}
              hideLabel
              options={(godownList?.data ?? []).map((g: any) => ({
                id: String(g.id),
                label: g.name,
                description: g.code ?? null,
              }))}
            />
            <div className="mx-1 h-6 w-px shrink-0 bg-border" />
            <Select
              value={view}
              onValueChange={(v) => setView(v as typeof view)}
            >
              <SelectTrigger
                className="h-9 w-[150px]"
                aria-label="Group results by"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="batch-wise">Batch-wise</SelectItem>
                <SelectItem value="item-wise">Item-wise</SelectItem>
                <SelectItem value="godown-wise">Godown-wise</SelectItem>
              </SelectContent>
            </Select>
            <Button
              type="submit"
              size="sm"
              className="h-9 px-4"
              disabled={!hasDraftFilters}
            >
              Apply
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Body */}
      {isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      ) : isError ? (
        <Card>
          <CardContent className="py-12 text-center">
            <IconX className="mx-auto mb-3 h-10 w-10 text-destructive opacity-60" />
            <p className="font-medium text-destructive">
              Failed to load batch balancing report
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={() => refetch()}
            >
              <IconRefresh className="mr-1.5 h-3.5 w-3.5" />
              Retry
            </Button>
          </CardContent>
        </Card>
      ) : !hasAppliedFilters ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <IconFilter className="mx-auto mb-3 h-12 w-12 opacity-40" />
            <p className="text-lg font-medium">Set at least one filter</p>
            <p className="mt-1 text-sm">
              Search a batch number or item, or pick an item / godown, then
              apply.
            </p>
          </CardContent>
        </Card>
      ) : !report || report.batches.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <IconPackage className="mx-auto mb-3 h-12 w-12 opacity-40" />
            <p className="text-lg font-medium">No batch movements found</p>
            <p className="mt-1 text-sm">
              No batches match the current filters for this fiscal year.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
            <Card>
              <CardContent className="p-3">
                <div className="text-xl font-bold">{totals?.batchCount}</div>
                <div className="text-xs text-muted-foreground">Batches</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3">
                <div className="text-xl font-bold tabular-nums">
                  {formatQty(totals?.totalOpening ?? 0, null, totalsUnit)}
                </div>
                <div className="text-xs text-muted-foreground">Opening</div>
                {((totals?.totalOpeningAsPerJournal ?? 0) !== 0 ||
                  (totals?.totalPrePeriodNet ?? 0) !== 0) && (
                  <div className="mt-0.5 text-[10px] leading-tight text-muted-foreground/80 tabular-nums">
                    Journal{' '}
                    {formatQty(
                      totals?.totalOpeningAsPerJournal ?? 0,
                      null,
                      totalsUnit,
                    )}
                    {' · '}pre-period{' '}
                    {formatQty(
                      totals?.totalPrePeriodNet ?? 0,
                      null,
                      totalsUnit,
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3">
                <div className="text-xl font-bold tabular-nums text-emerald-600">
                  {formatQty(totals?.totalInward ?? 0, null, totalsUnit)}
                </div>
                <div className="text-xs text-muted-foreground">Inward</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3">
                <div className="text-xl font-bold tabular-nums text-orange-600">
                  {formatQty(totals?.totalOutward ?? 0, null, totalsUnit)}
                </div>
                <div className="text-xs text-muted-foreground">Outward</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3">
                <div className="text-xl font-bold tabular-nums text-primary">
                  {formatQty(totals?.totalClosing ?? 0, null, totalsUnit)}
                </div>
                <div className="text-xs text-muted-foreground">Closing</div>
              </CardContent>
            </Card>
          </div>

          {/* Batch cards — flat, or grouped by item / godown per the view */}
          {view === 'batch-wise' ? (
            <div className="space-y-3">
              {report.batches.map((batch) => (
                <BatchCard
                  key={`${batch.itemId}-${batch.godownId}-${batch.batchNo}`}
                  batch={batch}
                  expanded={expandedKeys.has(
                    `${batch.itemId}-${batch.godownId}-${batch.batchNo}`,
                  )}
                  onToggle={() =>
                    toggle(`${batch.itemId}-${batch.godownId}-${batch.batchNo}`)
                  }
                  fromDate={fromDate}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {groupBatches(report.batches, view).map((group) => (
                <div key={group.key} className="space-y-2">
                  {/* Group header with subtotals */}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 rounded-md border bg-muted/40 px-3 py-2">
                    <div className="flex min-w-0 items-center gap-2 text-sm font-semibold">
                      {view === 'item-wise' ? (
                        <IconPackage className="h-4 w-4 shrink-0 text-emerald-500" />
                      ) : (
                        <IconBuildingWarehouse className="h-4 w-4 shrink-0 text-blue-500" />
                      )}
                      <span className="shrink-0 font-mono text-[11px] font-normal uppercase text-muted-foreground">
                        {view === 'item-wise' ? 'Item:' : 'Godown:'}
                      </span>
                      <span className="break-words">{group.name}</span>
                    </div>
                    <div className="ml-auto flex flex-wrap items-center gap-x-4 gap-y-0.5 font-mono text-xs tabular-nums">
                      <span className="text-muted-foreground">
                        Open{' '}
                        <strong className="text-foreground">
                          {formatQty(group.opening, null, group.unit)}
                        </strong>
                      </span>
                      <span className="text-emerald-600">
                        In{' '}
                        <strong>
                          +{formatQty(group.inward, null, group.unit)}
                        </strong>
                      </span>
                      <span className="text-orange-600">
                        Out{' '}
                        <strong>
                          -{formatQty(group.outward, null, group.unit)}
                        </strong>
                      </span>
                      <span className="text-primary">
                        Close{' '}
                        <strong>
                          {formatQty(group.closing, null, group.unit)}
                        </strong>
                      </span>
                    </div>
                  </div>
                  {group.batches.map((batch) => (
                    <BatchCard
                      key={`${batch.itemId}-${batch.godownId}-${batch.batchNo}`}
                      batch={batch}
                      expanded={expandedKeys.has(
                        `${batch.itemId}-${batch.godownId}-${batch.batchNo}`,
                      )}
                      onToggle={() =>
                        toggle(
                          `${batch.itemId}-${batch.godownId}-${batch.batchNo}`,
                        )
                      }
                      fromDate={fromDate}
                    />
                  ))}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </Main>
  )
}

/* ────────────────────────────────────────────────────────────────────────
   Batch card — header (item/godown/batch + O/I/O/C balances) and the
   expandable chronological movement table with a running balance column.
   ──────────────────────────────────────────────────────────────────────── */
function BatchCard({
  batch,
  expanded,
  onToggle,
  fromDate,
}: {
  batch: BatchBalance
  expanded: boolean
  onToggle: () => void
  /** Reporting-period start (yyyy-MM-dd) — labels the opening summary row. */
  fromDate?: string | null
}) {
  const dp = batch.noOfDecimalPlaces
  // Serial column appears only when this batch's movements actually carry
  // serial numbers — no vertical space wasted otherwise.
  const hasSerials =
    batch.movements.some((m) => !!m.serialNo) ||
    (batch.openingMovements?.some((m) => !!m.serialNo) ?? false)

  return (
    <Card className="overflow-hidden">
      {/* Summary row */}
      <button
        onClick={onToggle}
        className="flex w-full flex-wrap items-center justify-between gap-3 p-4 text-left transition-colors hover:bg-muted/40"
      >
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          {expanded ? (
            <IconChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
          ) : (
            <IconChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
          )}
          <IconPackage className="h-4 w-4 shrink-0 text-emerald-500" />
          <span className="shrink-0 font-mono text-[11px] font-normal uppercase text-muted-foreground">
            Item:
          </span>
          <span className="min-w-0 break-words font-semibold">
            {batch.itemName}
          </span>
          {batch.itemCode && (
            <span className="shrink-0 font-mono text-xs font-normal text-muted-foreground">
              {batch.itemCode}
            </span>
          )}
          <span className="flex min-w-0 shrink-0 items-center gap-1 text-sm">
            <IconBuildingWarehouse className="h-3.5 w-3.5 text-blue-500" />
            <span className="font-mono text-[11px] font-normal uppercase text-muted-foreground">
              Godown:
            </span>
            <span className="break-words">
              {batch.godownName ?? `Godown #${batch.godownId}`}
            </span>
          </span>
          <Badge variant="outline" className="shrink-0 font-mono text-[11px]">
            BatchNo: {batch.batchNo}
          </Badge>
          {batch.expiryDate && (
            <span className="shrink-0 text-xs text-muted-foreground">
              exp {formatDate(batch.expiryDate)}
            </span>
          )}
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-x-5 gap-y-1 text-sm">
          <MiniStat
            label="Open"
            value={batch.openingQuantity}
            dp={dp}
            unit={batch.unitCode}
          />
          <MiniStat
            label="In"
            value={batch.inwardQuantity}
            dp={dp}
            unit={batch.unitCode}
            className="text-emerald-600"
          />
          <MiniStat
            label="Out"
            value={batch.outwardQuantity}
            dp={dp}
            unit={batch.unitCode}
            className="text-orange-600"
          />
          <MiniStat
            label="Close"
            value={batch.closingQuantity}
            dp={dp}
            unit={batch.unitCode}
            className="font-semibold text-primary"
          />
        </div>
      </button>

      {/* Movement table */}
      {expanded && (
        <div className="border-t">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead>
                <tr className="border-b bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-4 py-2 text-left font-medium">Date</th>
                  <th className="px-3 py-2 text-left font-medium">Voucher</th>
                  <th className="px-3 py-2 text-left font-medium">Type</th>
                  {hasSerials && (
                    <th className="px-3 py-2 text-left font-medium">Serial</th>
                  )}
                  <th className="px-3 py-2 text-right font-medium">Inward</th>
                  <th className="px-3 py-2 text-right font-medium">Outward</th>
                  <th className="px-3 py-2 text-right font-medium">Balance</th>
                  <th className="px-3 py-2 text-right font-medium">Rate</th>
                  <th className="px-3 py-2 text-right font-medium">Amount</th>
                  <th className="px-4 py-2 text-left font-medium">Remarks</th>
                </tr>
              </thead>
              <tbody>
                {/* Opening rows — one per current-FY opening row (opening-stock
                    journal and/or pre-period movements), each tagged with its
                    kind and a running balanceAfter; else a single
                    carried-forward Opening balance row. */}
                {(batch.openingMovements?.length
                  ? batch.openingMovements
                  : [null]
                ).map((om, idx) => (
                  <tr key={`open-${idx}`} className="border-b bg-muted/20">
                    <td className="px-4 py-2 whitespace-nowrap text-muted-foreground">
                      {idx === 0 ? 'Opening' : ''}
                    </td>
                    <td className="px-3 py-2 font-mono text-xs text-muted-foreground">
                      {om?.voucherNo ?? '—'}
                    </td>
                    <td className="px-3 py-2 text-xs text-muted-foreground">
                      {om
                        ? om.kind === 'journal'
                          ? 'Opening journal'
                          : 'Pre-period'
                        : 'Opening balance'}
                    </td>
                    {hasSerials && (
                      <td className="px-3 py-2 font-mono text-xs text-muted-foreground">
                        {om?.serialNo ?? '—'}
                      </td>
                    )}
                    <td className="px-3 py-2 text-right font-mono tabular-nums whitespace-nowrap text-emerald-600">
                      {om
                        ? om.movementType === 'in'
                          ? `+${formatQty(om.quantity, dp, batch.unitCode)}`
                          : '—'
                        : '—'}
                    </td>
                    <td className="px-3 py-2 text-right font-mono tabular-nums whitespace-nowrap text-orange-600">
                      {om
                        ? om.movementType === 'out'
                          ? `-${formatQty(om.quantity, dp, batch.unitCode)}`
                          : '—'
                        : '—'}
                    </td>
                    <td
                      className={cn(
                        'px-3 py-2 text-right font-mono tabular-nums font-semibold whitespace-nowrap',
                        idx === (batch.openingMovements?.length ?? 0) - 1 ||
                          !batch.openingMovements?.length
                          ? 'text-foreground'
                          : 'text-muted-foreground',
                      )}
                    >
                      {formatQty(
                        om ? om.balanceAfter : batch.openingQuantity,
                        dp,
                        batch.unitCode,
                      )}
                    </td>
                    <td className="px-3 py-2 text-right font-mono tabular-nums whitespace-nowrap text-muted-foreground">
                      {om && om.rate > 0 ? formatAmt(om.rate) : '—'}
                    </td>
                    <td className="px-3 py-2 text-right font-mono tabular-nums whitespace-nowrap text-muted-foreground">
                      {om ? formatAmt(om.amount) : '—'}
                    </td>
                    <td className="px-4 py-2 text-xs text-muted-foreground">
                      {om?.remarks ?? (idx === 0 ? 'Brought forward' : '')}
                    </td>
                  </tr>
                ))}
                {/* Opening summary row — the balance as on the reporting
                    period start (what the period's movements start from). */}
                <tr className="border-b border-primary/20 bg-primary/[0.03] font-medium">
                  <td
                    className="px-4 py-2 text-primary/80"
                    colSpan={hasSerials ? 4 : 3}
                  >
                    Opening as on{' '}
                    {fromDate ? formatDate(fromDate) : 'period start'}
                  </td>
                  <td className="px-3 py-2" />
                  <td className="px-3 py-2" />
                  <td className="px-3 py-2 text-right font-mono tabular-nums whitespace-nowrap text-foreground">
                    {formatQty(batch.openingQuantity, dp, batch.unitCode)}
                  </td>
                  <td className="px-3 py-2" colSpan={3} />
                </tr>
                {batch.movements.map((mv, idx) => (
                  <MovementRow
                    key={idx}
                    mv={mv}
                    dp={dp}
                    unit={batch.unitCode}
                    showSerial={hasSerials}
                  />
                ))}
                {/* Closing row */}
                <tr className="border-t-2 border-primary/30 bg-primary/[0.04] font-semibold">
                  <td className="px-4 py-2 text-primary" colSpan={3}>
                    Closing balance
                  </td>
                  {hasSerials && <td className="px-3 py-2" />}
                  <td className="px-3 py-2 text-right font-mono tabular-nums whitespace-nowrap text-emerald-600">
                    {batch.inwardQuantity > 0
                      ? `+${formatQty(batch.inwardQuantity, dp, batch.unitCode)}`
                      : '—'}
                  </td>
                  <td className="px-3 py-2 text-right font-mono tabular-nums whitespace-nowrap text-orange-600">
                    {batch.outwardQuantity > 0
                      ? `-${formatQty(batch.outwardQuantity, dp, batch.unitCode)}`
                      : '—'}
                  </td>
                  <td className="px-3 py-2 text-right font-mono tabular-nums whitespace-nowrap text-primary">
                    {formatQty(batch.closingQuantity, dp, batch.unitCode)}
                  </td>
                  <td className="px-3 py-2" colSpan={3} />
                </tr>
              </tbody>
            </table>
          </div>
          {batch.movements.length === 0 && (
            <div className="px-4 py-3 text-sm text-muted-foreground">
              No movements in the selected window — balance carried from
              opening.
            </div>
          )}
        </div>
      )}
    </Card>
  )
}

function MiniStat({
  label,
  value,
  dp,
  unit,
  className,
}: {
  label: string
  value: number
  dp: number
  unit: string | null
  className?: string
}) {
  return (
    <div className={cn('text-right', className)}>
      <span className="mr-1 text-xs text-muted-foreground">{label}</span>
      <span className="font-mono tabular-nums">
        {formatQty(value, dp, unit)}
      </span>
    </div>
  )
}

function MovementRow({
  mv,
  dp,
  unit,
  showSerial,
}: {
  mv: BatchMovement
  dp: number
  unit: string | null
  showSerial: boolean
}) {
  const isIn = mv.movementType === 'in'
  return (
    <tr className="border-b last:border-0 hover:bg-muted/20">
      <td className="px-4 py-2 whitespace-nowrap">
        {formatDate(mv.voucherDate)}
      </td>
      <td className="px-3 py-2 font-medium">{mv.voucherNo ?? '—'}</td>
      <td className="px-3 py-2">
        <Badge variant="outline" className="text-[11px]">
          {mv.voucherTypeName ?? 'Voucher'}
        </Badge>
      </td>
      {showSerial && (
        <td className="px-3 py-2 font-mono text-xs text-muted-foreground">
          {mv.serialNo ?? '—'}
        </td>
      )}
      <td
        className={cn(
          'px-3 py-2 text-right font-mono tabular-nums whitespace-nowrap',
          isIn ? 'text-emerald-600' : 'text-muted-foreground',
        )}
      >
        {isIn ? `+${formatQty(mv.quantity, dp, unit)}` : '—'}
      </td>
      <td
        className={cn(
          'px-3 py-2 text-right font-mono tabular-nums whitespace-nowrap',
          !isIn ? 'text-orange-600' : 'text-muted-foreground',
        )}
      >
        {!isIn ? `-${formatQty(mv.quantity, dp, unit)}` : '—'}
      </td>
      <td className="px-3 py-2 text-right font-mono tabular-nums whitespace-nowrap font-semibold">
        {formatQty(mv.runningBalance, dp, unit)}
      </td>
      <td className="px-3 py-2 text-right font-mono tabular-nums whitespace-nowrap text-muted-foreground">
        {mv.rate > 0 ? formatAmt(mv.rate) : '—'}
      </td>
      <td className="px-3 py-2 text-right font-mono tabular-nums text-muted-foreground">
        {mv.amount > 0 ? formatAmt(mv.amount) : '—'}
      </td>
      <td className="max-w-[220px] truncate px-4 py-2 text-muted-foreground">
        {mv.remarks ?? '—'}
      </td>
    </tr>
  )
}
