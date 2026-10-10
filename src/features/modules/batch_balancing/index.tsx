import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Switch } from '@/components/ui/switch'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import {
  IconActivity,
  IconAlertTriangle,
  IconBookmark,
  IconBookmarkPlus,
  IconBuildingWarehouse,
  IconCalendarMonth,
  IconChevronDown,
  IconChevronUp,
  IconClockHour4,
  IconCoins,
  IconFilter,
  IconPackage,
  IconPrinter,
  IconRefresh,
  IconRuler,
  IconScale,
  IconSearch,
  IconSortAscending,
  IconSortDescending,
  IconStack2,
  IconTags,
  IconX,
} from '@tabler/icons-react'
import { useQuery } from '@tanstack/react-query'
import {
  CheckIcon,
  Download,
  FileSpreadsheet,
  FileText,
  Loader2,
} from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { fetchGodownService } from '@/features/modules/godown/data/api'
import { fetchStockItemService } from '@/features/modules/stock_item/data/api'
import { Main } from '@/layouts/components/main'
import { cn } from '@/lib/utils'
import { useAuth } from '@/features/auth/contexts/AuthContext'
import { formatQty } from '@/utils/format-num'
import { BatchCard } from './batch-card'
import { BatchGrid } from './batch-grid'
import { BatchInspector } from './batch-inspector'
import { BatchPivot } from './batch-pivot'
import { BatchRanked } from './batch-ranked'
import { BatchVoucherTypes } from './batch-voucher-types'
import { FilterSheetSelect } from './filter-sheet-select'
import { useItemStockMeta } from './use-item-stock-meta'
import {
  batchBalancesQueryOptions,
  batchBalancingQueryOptions,
  batchDetailQueryOptions,
  batchSuggestionsQueryOptions,
} from './data/queryOptions'
import {
  EMPTY_FILTERS,
  activeFilterCount,
  normaliseFilters,
  readPresets,
  removePreset,
  savePreset,
} from './presets'
import type { BatchFilterState, FilterPreset } from './presets'
import {
  BATCH_VIEWS,
  ISSUE_FILTERS,
  ISSUE_META,
  SORT_OPTIONS,
  countByIssue,
  groupBatches,
  groupByVoucherType,
  viewLayout,
} from './views'
import type { BatchGroup, BatchViewId, BatchGroupTone } from './views'
import { buildCsv, EXPORT_COLUMNS, flattenForExport } from './export-utils'
import { formatCompactInr, formatDate } from './format'
import type { BatchBalance, BatchBalancingReport } from './data/schema'
import type { BatchSortBy, BatchSortDir } from './data/api'

const PER_PAGE_OPTIONS = [25, 50, 100, 250, 'all'] as const

const TONE_HEADER_CLASSES: Record<BatchGroupTone, string> = {
  neutral: 'border-border bg-muted/40',
  success: 'border-emerald-500/40 bg-emerald-500/[0.06]',
  warning: 'border-amber-500/40 bg-amber-500/[0.06]',
  danger: 'border-destructive/40 bg-destructive/[0.06]',
}

function formatAmt(val: number | null | undefined): string {
  return (val ?? 0).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
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

export default function BatchBalancingReport() {
  // Applied filters — the query only refetches once these change.
  const [filters, setFilters] = useState<BatchFilterState>(EMPTY_FILTERS)
  // Draft inputs, applied on "Apply" / Enter so typing doesn't refetch.
  const [draft, setDraft] = useState<BatchFilterState>(EMPTY_FILTERS)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [presets, setPresets] = useState<FilterPreset[]>([])
  const [presetName, setPresetName] = useState('')

  // Sorting + paging are server-side (the backend sorts and pages whole
  // result sets, not just the loaded page).
  const [sortBy, setSortBy] = useState<BatchSortBy>('item')
  const [sortDir, setSortDir] = useState<BatchSortDir>('asc')
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState<number | 'all'>(100)

  const [view, setView] = useState<BatchViewId>('batch-wise')
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set())
  const [inspected, setInspected] = useState<BatchBalance | null>(null)
  const [inspectorOpen, setInspectorOpen] = useState(false)
  // Ranked / pivot rows come from a balances-only payload, so the inspector
  // fetches that batch's movement trail on demand.
  const [inspectorNeedsTrail, setInspectorNeedsTrail] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

  // Batch No autocomplete — suggestions from /stock_summaries/batch_list as
  // the user types (debounced); picking one sets the EXACT batch_no filter.
  const [batchOpen, setBatchOpen] = useState(false)
  const [debouncedBatchQuery, setDebouncedBatchQuery] = useState('')
  useEffect(() => {
    const t = window.setTimeout(
      () => setDebouncedBatchQuery(draft.search.trim()),
      300,
    )
    return () => window.clearTimeout(t)
  }, [draft.search])

  useEffect(() => {
    setPresets(readPresets())
  }, [])

  const { period } = useAuth()
  // The reporting window always follows the global reporting period (the
  // header's Period dialog, Alt+P) — it is not a per-report filter.
  const fromDate = toDbDate(period?.startDate)
  const toDate = toDbDate(period?.endDate)

  // Suggestions mirror the item/godown DRAFT filters so the list only shows
  // batches that actually exist within the currently chosen item/godown.
  const suggestionItemId =
    draft.itemId !== 'all' ? Number(draft.itemId) : null
  const suggestionGodownId =
    draft.godownId !== 'all' ? Number(draft.godownId) : null

  const { data: batchSuggestions, isFetching: suggestionsFetching } = useQuery({
    ...batchSuggestionsQueryOptions(
      debouncedBatchQuery || undefined,
      suggestionItemId,
      suggestionGodownId,
    ),
    enabled: batchOpen,
  })

  // The reporting period is NOT a "filter" for this gate — it's always on, so
  // requiring it would dump every batch of the period on first paint.
  const hasAppliedFilters = activeFilterCount(filters) > 0
  const draftFilterCount = activeFilterCount(draft)

  const applyFilters = useCallback(
    (next?: BatchFilterState) => {
      const source = next ?? draft
      // An exact batch pick wins over the free-search text.
      const batch = source.batchNo.trim()
      setFilters(
        normaliseFilters({
          ...source,
          batchNo: batch,
          search: batch ? '' : source.search.trim(),
        }),
      )
      setPage(1)
    },
    [draft],
  )

  const clearFilters = () => {
    setDraft(EMPTY_FILTERS)
    setFilters(EMPTY_FILTERS)
    setPage(1)
  }

  const applyPreset = (preset: FilterPreset) => {
    const restored = normaliseFilters(preset.filters)
    setDraft(restored)
    setFilters(restored)
    setPage(1)
  }

  const hasDraftFilters = draftFilterCount > 0

  const params = useMemo(
    () => ({
      search: filters.search || undefined,
      itemId: filters.itemId !== 'all' ? Number(filters.itemId) : null,
      godownId: filters.godownId !== 'all' ? Number(filters.godownId) : null,
      batchNo: filters.batchNo || null,
      voucherTypeId:
        filters.voucherTypeId !== 'all' ? Number(filters.voucherTypeId) : null,
      fromDate,
      toDate,
      inStockOnly: filters.inStockOnly,
      issue: filters.issue,
      sortBy,
      sortDir,
      page,
      perPage,
      // The cards and the inspector both render the trail.
      includeMovements: true,
    }),
    [filters, fromDate, toDate, sortBy, sortDir, page, perPage],
  )

  /**
   * Ranked and pivot are whole-result-set views: they load every matching
   * batch (balances only) instead of the report's page, so a rank or a share
   * is never quietly scoped to "whatever happened to be on page 1".
   */
  const isAggregateView = view === 'ranked' || view === 'pivot'

  const aggregateParams = useMemo(
    () => ({
      ...params,
      perPage: 'all' as const,
      includeMovements: false,
    }),
    [params],
  )

  const { data, isLoading, isError, isFetching, refetch } = useQuery({
    ...(isAggregateView
      ? batchBalancesQueryOptions(aggregateParams)
      : batchBalancingQueryOptions(params)),
    // Don't dump the whole database on first paint — require at least one
    // criterion (search text, batch no, item, godown, issue or a stock-only
    // filter).
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
  const batches = report?.batches ?? []
  const totals = report?.totals
  const pagination = report?.pagination
  const totalsUnit = batches[0]?.unitCode

  // "Opening as on" label — the reporting-period start when set (the true
  // opening position), else the 9010 opening voucher's date (the FY first
  // day, e.g. 1-Apr) reported by the backend as asOnDate.
  const openingAsOnDate = fromDate ?? report?.asOnDate ?? report?.fromDate ?? null

  const layout = viewLayout(view)

  // Auto-expand everything when a fresh page of results arrives.
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
    batches.length > 0 && expandedKeys.size >= batches.length

  const toggleAll = () => {
    setExpandedKeys(
      allExpanded
        ? new Set()
        : new Set(batches.map((b) => `${b.itemId}-${b.godownId}-${b.batchNo}`)),
    )
  }

  const inspect = (
    batch: BatchBalance,
    options?: { needsTrail?: boolean },
  ) => {
    setInspected(batch)
    setInspectorNeedsTrail(options?.needsTrail === true)
    setInspectorOpen(true)
  }

  // The trail for a balances-only row, loaded lazily by the inspector. The
  // batch filters make this a single-row query.
  const trailParams = useMemo(
    () => ({
      search: undefined,
      itemId: inspected?.itemId ?? null,
      godownId: inspected?.godownId ?? null,
      batchNo: inspected?.batchNo ?? null,
      fromDate,
      toDate,
      page: 1,
      perPage: 1,
      includeMovements: true,
    }),
    [inspected, fromDate, toDate],
  )

  const { data: trailData } = useQuery({
    ...batchDetailQueryOptions(trailParams),
    enabled: inspectorOpen && inspectorNeedsTrail && !!inspected,
  })

  const inspectedBatch = useMemo(() => {
    if (!inspectorNeedsTrail) return inspected
    const detail = (trailData?.data as BatchBalancingReport | undefined)
      ?.batches?.[0]
    return detail ?? inspected
  }, [inspectorNeedsTrail, inspected, trailData])

  const handleSort = (column: BatchSortBy) => {
    if (column === sortBy) {
      setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortBy(column)
      setSortDir('asc')
    }
    setPage(1)
  }

  /** Filter straight from a summary tile (the chip becomes the filter). */
  const focusIssue = (issue: BatchFilterState['issue']) => {
    const next = normaliseFilters({
      ...filters,
      issue: filters.issue === issue ? 'all' : issue,
    })
    setFilters(next)
    setDraft(next)
    setPage(1)
  }

  const exportOptions = useMemo(
    () => ({
      groupBy:
        view === 'item-wise'
          ? ('item' as const)
          : view === 'godown-wise'
            ? ('godown' as const)
            : ('none' as const),
      totals: true,
    }),
    [view],
  )

  // The trail exports write one row per movement, and the aggregate views do
  // not load movements — so they point at the trail views instead of writing a
  // hollow file.
  const exportDisabled =
    !report || isExporting || batches.length === 0 || isAggregateView
  const exportHint = isAggregateView
    ? 'Switch to a card or grid view to export the movement trail'
    : undefined

  const handleExport = async (format: 'csv' | 'excel' | 'pdf') => {
    if (exportDisabled) return
    setIsExporting(true)
    try {
      const rows = flattenForExport(report, exportOptions)
      if (rows.length === 0) return

      if (format === 'csv') {
        const csv = buildCsv(report, exportOptions)
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
        const { default: exportTableToExcel } = await import(
          '@/utils/export-table-excel'
        )
        await exportTableToExcel({
          title: 'Batch Balancing Report',
          columnData: EXPORT_COLUMNS,
          data: rows,
          fileName: 'batch-balancing-report.xlsx',
        })
      } else {
        const { default: exportTableToPdf } = await import(
          '@/utils/export-table-pdf'
        )
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

  /**
   * Print the table: the grid is the print-friendly shape (no expansion
   * needed), so switch to it and let the browser repaint before printing.
   */
  const handlePrint = () => {
    setView('grid')
    window.setTimeout(() => window.print(), 250)
  }

  const groups: BatchGroup[] =
    layout === 'grouped'
      ? groupBatches(batches, view, {
          // The backend's own expiring-soon threshold (its default is 90 days).
          expiryWithinDays: report?.expiryWithinDays,
          ageingAsOnDate: report?.ageingAsOnDate ?? null,
        })
      : []
  const contributions =
    layout === 'voucher-types' ? groupByVoucherType(batches) : []
  const issueCounts = countByIssue(batches)

  const renderBatch = (batch: BatchBalance) => {
    const key = `${batch.itemId}-${batch.godownId}-${batch.batchNo}`
    return (
      <BatchCard
        key={key}
        batch={batch}
        expanded={expandedKeys.has(key)}
        onToggle={() => toggle(key)}
        onInspect={() => inspect(batch)}
        openingAsOnDate={openingAsOnDate}
      />
    )
  }

  const showExpandControls = layout === 'flat' || layout === 'grouped'

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
            full movement trail, valuation, ageing and reconciliation checks per
            item, godown and batch
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
              {report?.ageingAsOnDate && (
                <span className="text-[11px]">
                  · ageing as on {formatDate(report.ageingAsOnDate)}
                </span>
              )}
            </div>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2 print:hidden">
          {isFetching && !isLoading && (
            <IconRefresh className="h-4 w-4 animate-spin text-muted-foreground" />
          )}
          <Select
            value={view}
            onValueChange={(value) => setView(value as BatchViewId)}
          >
            <SelectTrigger className="h-9 w-[220px]" aria-label="Report view">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {BATCH_VIEWS.map((option) => (
                <SelectItem
                  key={option.id}
                  value={option.id}
                  title={option.hint}
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={sortBy}
            onValueChange={(value) => {
              setSortBy(value as BatchSortBy)
              setPage(1)
            }}
          >
            <SelectTrigger className="h-9 w-[170px]" aria-label="Sort batches by">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  Sort: {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9"
            title={sortDir === 'asc' ? 'Ascending' : 'Descending'}
            aria-label={`Sort ${sortDir === 'asc' ? 'ascending' : 'descending'}`}
            onClick={() => {
              setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'))
              setPage(1)
            }}
          >
            {sortDir === 'asc' ? (
              <IconSortAscending className="h-4 w-4" />
            ) : (
              <IconSortDescending className="h-4 w-4" />
            )}
          </Button>
          {showExpandControls && (
            <Button
              variant="outline"
              size="sm"
              onClick={toggleAll}
              disabled={batches.length === 0}
            >
              {allExpanded ? (
                <IconChevronUp className="mr-1 h-4 w-4" />
              ) : (
                <IconChevronDown className="mr-1 h-4 w-4" />
              )}
              {allExpanded ? 'Collapse all' : 'Expand all'}
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrint}
            disabled={batches.length === 0}
          >
            <IconPrinter className="mr-1 h-4 w-4" />
            Print
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExport('csv')}
            disabled={exportDisabled}
            title={exportHint}
          >
            <Download className="mr-1 h-4 w-4" />
            CSV
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExport('excel')}
            disabled={exportDisabled}
            title={exportHint}
          >
            <FileSpreadsheet className="mr-1 h-4 w-4 text-emerald-600" />
            Excel
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExport('pdf')}
            disabled={exportDisabled}
            title={exportHint}
          >
            <FileText className="mr-1 h-4 w-4 text-red-600" />
            PDF
          </Button>
        </div>
      </div>

      {/* Filters — primary row plus an advanced drawer for the inspection
          filters (voucher type, issue, expiry, stock-only, date window). */}
      <Card className="print:hidden">
        <CardContent className="space-y-3 p-3">
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
                    <IconSearch className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      role="combobox"
                      aria-expanded={batchOpen}
                      placeholder="Search batch no / item…"
                      value={draft.batchNo || draft.search}
                      onChange={(e) => {
                        // One query drives both modes: picking a suggestion
                        // sets the exact batch; typing only and pressing Apply
                        // falls back to free-text search.
                        setDraft((prev) => ({
                          ...prev,
                          batchNo: '',
                          search: e.target.value,
                        }))
                        if (!batchOpen) setBatchOpen(true)
                      }}
                      className="h-9 pr-8 pl-8"
                    />
                    {draft.batchNo || draft.search ? (
                      <span
                        role="button"
                        tabIndex={0}
                        aria-label="Clear batch filter"
                        className="absolute right-2 top-1/2 flex h-4 w-4 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors hover:bg-destructive/15 hover:text-destructive"
                        onMouseDown={(e) => {
                          // mousedown so the input doesn't steal focus first
                          e.preventDefault()
                          e.stopPropagation()
                          setDraft((prev) => ({ ...prev, batchNo: '', search: '' }))
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.stopPropagation()
                            e.preventDefault()
                            setDraft((prev) => ({
                              ...prev,
                              batchNo: '',
                              search: '',
                            }))
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
                                draft.batchNo === s.batchNo && !draft.search
                              return (
                                <CommandItem
                                  key={value}
                                  value={value}
                                  onSelect={() => {
                                    setDraft((prev) => ({
                                      ...prev,
                                      batchNo: s.batchNo,
                                      search: '',
                                    }))
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
              value={draft.itemId}
              onChange={(itemId) => setDraft((prev) => ({ ...prev, itemId }))}
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
              value={draft.godownId}
              onChange={(godownId) =>
                setDraft((prev) => ({ ...prev, godownId }))
              }
              hideLabel
              options={(godownList?.data ?? []).map((g: any) => ({
                id: String(g.id),
                label: g.name,
                description: g.code ?? null,
              }))}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-9 gap-1.5"
              aria-expanded={showAdvanced}
              onClick={() => setShowAdvanced((prev) => !prev)}
            >
              <IconFilter className="h-3.5 w-3.5" />
              More filters
              {draftFilterCount > 0 && (
                <Badge variant="outline" className="px-1.5 py-0 text-[10px]">
                  {draftFilterCount}
                </Badge>
              )}
            </Button>
            <Button
              type="submit"
              size="sm"
              className="h-9 px-4"
              disabled={!hasDraftFilters}
            >
              Apply
            </Button>

            {/* Presets */}
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-9 gap-1.5"
                >
                  <IconBookmark className="h-3.5 w-3.5" />
                  Presets
                  {presets.length > 0 && (
                    <Badge variant="outline" className="px-1.5 py-0 text-[10px]">
                      {presets.length}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuLabel className="text-xs font-medium">
                  Saved filters
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {presets.length === 0 ? (
                  <div className="px-2 py-3 text-xs text-muted-foreground">
                    Nothing saved yet — set the filters you use often and save
                    them below.
                  </div>
                ) : (
                  presets.map((preset) => (
                    <DropdownMenuItem
                      key={preset.name}
                      className="justify-between gap-2"
                      onSelect={() => applyPreset(preset)}
                    >
                      <span className="truncate">{preset.name}</span>
                      <span
                        role="button"
                        tabIndex={0}
                        aria-label={`Delete preset ${preset.name}`}
                        className="text-muted-foreground hover:text-destructive"
                        onClick={(event) => {
                          event.preventDefault()
                          event.stopPropagation()
                          setPresets(removePreset(preset.name))
                        }}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault()
                            event.stopPropagation()
                            setPresets(removePreset(preset.name))
                          }
                        }}
                      >
                        <IconX className="h-3 w-3" />
                      </span>
                    </DropdownMenuItem>
                  ))
                )}
                <DropdownMenuSeparator />
                <div className="flex items-center gap-1.5 p-2">
                  <Input
                    value={presetName}
                    placeholder="Preset name"
                    className="h-8"
                    onChange={(event) => setPresetName(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        event.preventDefault()
                        setPresets(savePreset(presetName, draft))
                        setPresetName('')
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 shrink-0"
                    title="Save current filters as a preset"
                    disabled={!presetName.trim() || draftFilterCount === 0}
                    onClick={() => {
                      setPresets(savePreset(presetName, draft))
                      setPresetName('')
                    }}
                  >
                    <IconBookmarkPlus className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </form>

          {showAdvanced && (
            <div className="flex flex-wrap items-center gap-2 border-t pt-3">
              <Select
                value={draft.voucherTypeId}
                onValueChange={(voucherTypeId) =>
                  setDraft((prev) => ({ ...prev, voucherTypeId }))
                }
              >
                <SelectTrigger
                  className="h-9 w-[190px]"
                  aria-label="Voucher type"
                >
                  <SelectValue placeholder="Voucher type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All voucher types</SelectItem>
                  {(report?.voucherTypes ?? [])
                    .filter((type) => type.id != null)
                    .map((type) => (
                      <SelectItem key={type.id} value={String(type.id)}>
                        {type.name ?? type.code ?? `Type ${type.id}`} (
                        {type.lineCount})
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>

              <Select
                value={draft.issue}
                onValueChange={(issue) =>
                  setDraft((prev) => ({
                    ...prev,
                    issue: issue as BatchFilterState['issue'],
                  }))
                }
              >
                <SelectTrigger className="h-9 w-[190px]" aria-label="Integrity filter">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ISSUE_FILTERS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <label className="flex items-center gap-2 text-sm text-muted-foreground">
                <Switch
                  checked={draft.inStockOnly}
                  onCheckedChange={(checked) =>
                    setDraft((prev) => ({ ...prev, inStockOnly: checked }))
                  }
                  aria-label="Only batches with stock"
                />
                In stock only
              </label>

              <p className="text-[11px] text-muted-foreground">
                The reporting window follows the global period.{' '}
                {(fromDate || toDate) && (
                  <span className="font-medium text-foreground">
                    {fromDate ? formatDate(fromDate) : 'beginning'} →{' '}
                    {toDate ? formatDate(toDate) : 'today'}
                  </span>
                )}
                {' '}Change it from the header's Period control (Alt+P).
              </p>
            </div>
          )}
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
              Search a batch number or item, pick an item / godown, or narrow by
              issue or expiry, then apply.
            </p>
          </CardContent>
        </Card>
      ) : batches.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <IconPackage className="mx-auto mb-3 h-12 w-12 opacity-40" />
            <p className="text-lg font-medium">No batch movements found</p>
            <p className="mt-1 text-sm">
              No batches match the current filters for this reporting window.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Summary — totals cover every matching batch, not just the page. */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            <Card>
              <CardContent className="p-3">
                <div className="text-xl font-bold">{totals?.batchCount}</div>
                <div className="text-xs text-muted-foreground">
                  Batches (all matches)
                </div>
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
                <div className="mt-0.5 text-[10px] tabular-nums text-muted-foreground/80">
                  {formatCompactInr(totals?.totalInwardValue ?? 0)}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3">
                <div className="text-xl font-bold tabular-nums text-orange-600">
                  {formatQty(totals?.totalOutward ?? 0, null, totalsUnit)}
                </div>
                <div className="text-xs text-muted-foreground">Outward</div>
                <div className="mt-0.5 text-[10px] tabular-nums text-muted-foreground/80">
                  {formatCompactInr(totals?.totalOutwardValue ?? 0)}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3">
                <div className="text-xl font-bold tabular-nums text-primary">
                  {formatQty(totals?.totalClosing ?? 0, null, totalsUnit)}
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <IconCoins className="h-3 w-3" />
                  Closing value
                </div>
                <div className="mt-0.5 text-[10px] tabular-nums text-muted-foreground/80">
                  {formatAmt(totals?.totalClosingValue ?? 0)}
                </div>
              </CardContent>
            </Card>
            {/* Integrity tiles double as filters — click to isolate the issue
                (on this page's batches, with the server-side filter applied). */}
            <Card>
              <CardContent className="space-y-1 p-3">
                <div className="text-xs text-muted-foreground">
                  Reconciliation (page)
                </div>
                <IssueChip
                  label={ISSUE_META.negativeClosing.label}
                  count={issueCounts.negativeClosing}
                  tone="danger"
                  active={filters.issue === 'negative'}
                  onClick={() => focusIssue('negative')}
                />
                <IssueChip
                  label={ISSUE_META.carryForwardOpening.label}
                  count={issueCounts.carryForwardOpening}
                  tone="warning"
                  active={filters.issue === 'carry_forward'}
                  onClick={() => focusIssue('carry_forward')}
                />
                <IssueChip
                  label={ISSUE_META.journalVariance.label}
                  count={issueCounts.journalVariance}
                  tone="warning"
                  active={filters.issue === 'journal_variance'}
                  onClick={() => focusIssue('journal_variance')}
                />
                <div className="pt-1 text-[10px] text-muted-foreground">
                  Expired {totals?.expiredCount ?? 0} · expiring{' '}
                  {totals?.expiringCount ?? 0} · no movement{' '}
                  {totals?.noMovementCount ?? 0}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Ranked / pivot read the whole result set, so paging is moot. */}
          {isAggregateView && (
            <p className="rounded-md border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
              This view reads{' '}
              <span className="font-medium text-foreground">
                all {pagination?.total ?? batches.length} matching batch(es)
              </span>{' '}
              — not just the first page — so ranks, shares and the pivot matrix
              cover every match of the current filters.
            </p>
          )}

          {/* Pagination — the backend pages batches, so the page stays fast
              however deep the ledger is. */}
          {pagination && !isAggregateView && (
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs text-muted-foreground">
                {pagination.total === 0
                  ? 'No batches'
                  : `Batches ${
                      (pagination.page - 1) * (pagination.perPage || 0) + 1
                    }–${
                      pagination.perPage
                        ? Math.min(
                            pagination.page * pagination.perPage,
                            pagination.total,
                          )
                        : pagination.total
                    } of ${pagination.total}`}
                {filters.issue !== 'all' && ` · ${ISSUE_FILTERS.find((option) => option.value === filters.issue)?.label}`}
              </span>
              <div className="flex items-center gap-2">
                <Select
                  value={String(perPage)}
                  onValueChange={(value) => {
                    setPerPage(value === 'all' ? 'all' : Number(value))
                    setPage(1)
                  }}
                >
                  <SelectTrigger className="h-8 w-[130px]" aria-label="Batches per page">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PER_PAGE_OPTIONS.map((option) => (
                      <SelectItem key={String(option)} value={String(option)}>
                        {option === 'all' ? 'All batches' : `${option} / page`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8"
                  disabled={pagination.page <= 1}
                  onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                >
                  Previous
                </Button>
                <span className="text-xs text-muted-foreground">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8"
                  disabled={!pagination.hasMore}
                  onClick={() => setPage((prev) => prev + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}

          {/* Views */}
          {layout === 'grid' ? (
            <BatchGrid
              batches={batches}
              sortBy={sortBy}
              sortDir={sortDir}
              onSort={handleSort}
              onInspect={(batch) => inspect(batch)}
            />
          ) : layout === 'voucher-types' ? (
            <BatchVoucherTypes
              contributions={contributions}
              onInspect={(batch) => inspect(batch)}
            />
          ) : layout === 'grouped' ? (
            <div className="space-y-4">
              {groups.map((group) => (
                <div key={group.key} className="space-y-2">
                  <div
                    className={cn(
                      'flex flex-wrap items-center gap-x-4 gap-y-1 rounded-md border px-3 py-2',
                      TONE_HEADER_CLASSES[group.tone],
                    )}
                  >
                    <div className="flex min-w-0 flex-wrap items-center gap-2 text-sm font-semibold">
                      {view === 'item-wise' ? (
                        <IconPackage className="h-4 w-4 shrink-0 text-emerald-500" />
                      ) : view === 'godown-wise' ? (
                        <IconBuildingWarehouse className="h-4 w-4 shrink-0 text-blue-500" />
                      ) : view === 'issue-wise' ? (
                        <IconAlertTriangle className="h-4 w-4 shrink-0" />
                      ) : view === 'ageing-wise' ? (
                        <IconClockHour4 className="h-4 w-4 shrink-0 text-amber-500" />
                      ) : view === 'velocity-wise' ? (
                        <IconActivity className="h-4 w-4 shrink-0 text-blue-500" />
                      ) : view === 'consumption-wise' ? (
                        <IconStack2 className="h-4 w-4 shrink-0 text-emerald-500" />
                      ) : view === 'variance-wise' ? (
                        <IconScale className="h-4 w-4 shrink-0 text-fuchsia-500" />
                      ) : view === 'unit-wise' ? (
                        <IconRuler className="h-4 w-4 shrink-0 text-orange-500" />
                      ) : (
                        <IconCalendarMonth className="h-4 w-4 shrink-0" />
                      )}
                      <span className="break-words">{group.label}</span>
                      {group.sublabel && (
                        <span className="font-mono text-[11px] font-normal text-muted-foreground">
                          {group.sublabel}
                        </span>
                      )}
                      <span className="text-xs font-normal text-muted-foreground">
                        {group.totals.batchCount} batch(es)
                      </span>
                    </div>
                    <div className="ml-auto flex flex-wrap items-center gap-x-4 gap-y-0.5 font-mono text-xs tabular-nums">
                      <span className="text-muted-foreground">
                        Open{' '}
                        <strong className="text-foreground">
                          {formatQty(
                            group.totals.opening,
                            null,
                            group.totals.unit,
                          )}
                        </strong>
                      </span>
                      <span className="text-emerald-600">
                        In{' '}
                        <strong>
                          +{formatQty(group.totals.inward, null, group.totals.unit)}
                        </strong>
                      </span>
                      <span className="text-orange-600">
                        Out{' '}
                        <strong>
                          -{formatQty(group.totals.outward, null, group.totals.unit)}
                        </strong>
                      </span>
                      <span className="text-primary">
                        Close{' '}
                        <strong>
                          {formatQty(group.totals.closing, null, group.totals.unit)}
                        </strong>
                      </span>
                      <span className="text-muted-foreground">
                        Value{' '}
                        <strong className="text-foreground">
                          {formatCompactInr(group.totals.closingValue)}
                        </strong>
                      </span>
                    </div>
                    {group.note && (
                      <p className="w-full text-[11px] text-muted-foreground">
                        {group.note}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">{group.batches.map(renderBatch)}</div>
                </div>
              ))}
            </div>
          ) : layout === 'ranked' ? (
            <BatchRanked
              batches={batches}
              onInspect={(batch) => inspect(batch, { needsTrail: true })}
            />
          ) : layout === 'pivot' ? (
            <BatchPivot
              batches={batches}
              onInspect={(batch) => inspect(batch, { needsTrail: true })}
            />
          ) : (
            <div className="space-y-3">{batches.map(renderBatch)}</div>
          )}
        </>
      )}

      <BatchInspector
        batch={inspectedBatch}
        open={inspectorOpen}
        onOpenChange={(open) => {
          setInspectorOpen(open)
          if (!open) {
            setInspected(null)
            setInspectorNeedsTrail(false)
          }
        }}
        openingAsOnDate={openingAsOnDate}
        ageingAsOnDate={report?.ageingAsOnDate ?? null}
      />
    </Main>
  )
}

function IssueChip({
  label,
  count,
  tone,
  active,
  onClick,
}: {
  label: string
  count: number
  tone: BatchGroupTone
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      // Named for the action so it can never be confused with the batch cards
      // that show the same issue label.
      aria-label={`Filter by ${label}`}
      aria-pressed={active}
      className={cn(
        'flex w-full items-center justify-between gap-2 rounded border px-1.5 py-0.5 text-left text-[11px] transition-colors',
        count === 0
          ? 'border-transparent text-muted-foreground/70'
          : TONE_HEADER_CLASSES[tone],
        active && 'ring-1 ring-primary',
      )}
    >
      <span className="truncate">{label}</span>
      <span className="font-mono tabular-nums">{count}</span>
    </button>
  )
}
