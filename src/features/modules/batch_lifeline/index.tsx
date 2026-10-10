import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Input } from '@/components/ui/input'
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
import { Switch } from '@/components/ui/switch'
import { Main } from '@/layouts/components/main'
import { cn } from '@/lib/utils'
import { formatQty } from '@/utils/format-num'
import {
  IconAlertTriangle,
  IconArrowsExchange,
  IconCalendarMonth,
  IconHistory,
  IconPackage,
  IconPrinter,
  IconRefresh,
  IconSearch,
  IconX,
} from '@tabler/icons-react'
import { useQuery } from '@tanstack/react-query'
import { Download, FileSpreadsheet, FileText, Loader2 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import {
  formatAmount,
  formatCompactInr,
  formatDate,
} from '@/features/modules/batch_balancing/format'
import { LifelineTimeline } from './lifeline-timeline'
import {
  ALL_BUCKETS,
  bucketLabel,
  bucketOptions,
  godownOptions,
  itemOptions,
  lifelineSummary,
  selectionAsLifeline,
} from './lifeline-view'
import {
  batchLifelineQueryOptions,
  lifelineBatchSuggestionsQueryOptions,
} from './data/queryOptions'
import {
  LIFELINE_EXPORT_COLUMNS,
  buildLifelineCsv,
  lifelineExportRows,
  lifelineFileName,
} from './export-lifeline'
import type { BatchLifeline } from './data/schema'

const LIMIT_OPTIONS = [500, 1000, 2000, 5000] as const

/**
 * Batch Lifeline — the complete history of one batch number: every line ever
 * booked against it, across items, godowns and fiscal years, oldest first with
 * running balances and inline fiscal-year markers.
 *
 * Unlike the Batch Balancing report (which opens a reporting period and folds
 * everything older into Opening), nothing here is collapsed: the purchase that
 * created the batch, every transfer and every issue is on the timeline.
 */
export default function BatchLifelineReport() {
  const [batchNo, setBatchNo] = useState('')
  const [draftBatchNo, setDraftBatchNo] = useState('')
  const [itemId, setItemId] = useState('all')
  const [godownId, setGodownId] = useState('all')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [includeSnapshots, setIncludeSnapshots] = useState(true)
  const [limit, setLimit] = useState<number>(1000)
  const [bucketKey, setBucketKey] = useState(ALL_BUCKETS)
  const [pickerOpen, setPickerOpen] = useState(false)
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [isExporting, setIsExporting] = useState(false)

  useEffect(() => {
    const timer = window.setTimeout(
      () => setDebouncedQuery(draftBatchNo.trim()),
      300,
    )
    return () => window.clearTimeout(timer)
  }, [draftBatchNo])

  const { data: suggestions, isFetching: suggestionsFetching } = useQuery({
    ...lifelineBatchSuggestionsQueryOptions(debouncedQuery || undefined),
    enabled: pickerOpen,
  })

  const params = useMemo(
    () => ({
      batchNo,
      itemId: itemId !== 'all' ? Number(itemId) : null,
      godownId: godownId !== 'all' ? Number(godownId) : null,
      fromDate: fromDate || null,
      toDate: toDate || null,
      limit,
      includeSnapshots,
    }),
    [batchNo, itemId, godownId, fromDate, toDate, limit, includeSnapshots],
  )

  const { data, isLoading, isError, isFetching, refetch } = useQuery({
    ...batchLifelineQueryOptions(params),
    enabled: batchNo !== '',
  })

  const lifeline = useMemo(() => {
    const raw = data?.data as BatchLifeline | undefined
    if (!raw) return undefined
    return { ...raw, rows: raw.rows ?? [], years: raw.years ?? [], buckets: raw.buckets ?? [] }
  }, [data])

  // A bucket selection only means something while that bucket is in the result.
  useEffect(() => {
    if (!lifeline) return
    if (
      bucketKey !== ALL_BUCKETS &&
      !lifeline.buckets.some((bucket) => bucket.key === bucketKey)
    ) {
      setBucketKey(ALL_BUCKETS)
    }
  }, [lifeline, bucketKey])

  const applyBatch = (value: string) => {
    const next = value.trim()
    setDraftBatchNo(next)
    setBatchNo(next)
    setBucketKey(ALL_BUCKETS)
  }

  const clearAll = () => {
    setDraftBatchNo('')
    setBatchNo('')
    setItemId('all')
    setGodownId('all')
    setFromDate('')
    setToDate('')
    setIncludeSnapshots(true)
    setBucketKey(ALL_BUCKETS)
  }

  const selection = lifeline ? selectionAsLifeline(lifeline, bucketKey) : undefined
  const summary = lifeline ? lifelineSummary(lifeline, bucketKey) : undefined
  const rows = selection?.rows ?? []
  const years = selection?.years ?? []
  const multipleBuckets = (lifeline?.buckets.length ?? 0) > 1

  const handleExport = async (format: 'csv' | 'excel' | 'pdf') => {
    if (!selection || isExporting || rows.length === 0) return
    setIsExporting(true)
    try {
      const exportRows = lifelineExportRows(selection)

      if (format === 'csv') {
        const blob = new Blob([buildLifelineCsv(selection)], {
          type: 'text/csv;charset=utf-8;',
        })
        const url = URL.createObjectURL(blob)
        const anchor = document.createElement('a')
        anchor.href = url
        anchor.download = lifelineFileName(selection.batchNo, 'csv')
        document.body.appendChild(anchor)
        anchor.click()
        document.body.removeChild(anchor)
        URL.revokeObjectURL(url)
        return
      }

      if (format === 'excel') {
        const { default: exportTableToExcel } = await import(
          '@/utils/export-table-excel'
        )
        await exportTableToExcel({
          title: `Batch Lifeline — ${selection.batchNo}`,
          columnData: LIFELINE_EXPORT_COLUMNS,
          data: exportRows,
          fileName: lifelineFileName(selection.batchNo, 'xlsx'),
        })
      } else {
        const { default: exportTableToPdf } = await import(
          '@/utils/export-table-pdf'
        )
        exportTableToPdf({
          title: `Batch Lifeline — ${selection.batchNo}`,
          columnData: LIFELINE_EXPORT_COLUMNS,
          data: exportRows,
          fileName: lifelineFileName(selection.batchNo, 'pdf'),
          orientation: 'l',
        })
      }
    } catch (error) {
      console.error('Batch lifeline export failed:', error)
    } finally {
      setIsExporting(false)
    }
  }

  const hasData = rows.length > 0

  return (
    <Main className="min-w-full space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <IconHistory className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold tracking-tight">Batch Lifeline</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            The complete life of one batch number — every receipt, transfer,
            issue, opening journal and year-end snapshot, oldest first, across
            items, godowns and fiscal years
          </p>
          {lifeline && lifeline.batchNo !== '' && (
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
              <Badge variant="outline" className="font-mono text-[11px]">
                BatchNo: {lifeline.batchNo}
              </Badge>
              <span>
                {lifeline.buckets.length} item/godown bucket(s) ·{' '}
                {lifeline.totals.rowCount} line(s)
              </span>
              {summary?.firstDate && (
                <span className="flex items-center gap-1">
                  <IconCalendarMonth className="h-3.5 w-3.5" />
                  {formatDate(summary.firstDate)} →{' '}
                  {summary.lastDate ? formatDate(summary.lastDate) : '—'}
                </span>
              )}
              {lifeline.asOnDate && (
                <span>ageing as on {formatDate(lifeline.asOnDate)}</span>
              )}
            </div>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2 print:hidden">
          {isFetching && !isLoading && (
            <IconRefresh className="h-4 w-4 animate-spin text-muted-foreground" />
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.print()}
            disabled={!hasData}
          >
            <IconPrinter className="mr-1 h-4 w-4" />
            Print
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExport('csv')}
            disabled={!hasData || isExporting}
          >
            <Download className="mr-1 h-4 w-4" />
            CSV
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExport('excel')}
            disabled={!hasData || isExporting}
          >
            <FileSpreadsheet className="mr-1 h-4 w-4 text-emerald-600" />
            Excel
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExport('pdf')}
            disabled={!hasData || isExporting}
            title="Export the lifeline as a PDF"
          >
            <FileText className="mr-1 h-4 w-4 text-red-600" />
            PDF
          </Button>
        </div>
      </div>

      {/* Picker + narrows */}
      <Card className="print:hidden">
        <CardContent className="space-y-3 p-3">
          <form
            className="flex flex-wrap items-center gap-2"
            onSubmit={(event) => {
              event.preventDefault()
              applyBatch(draftBatchNo)
            }}
          >
            <div className="min-w-[240px] flex-1">
              <Popover open={pickerOpen} onOpenChange={setPickerOpen}>
                <PopoverTrigger asChild>
                  <div className="relative">
                    <IconSearch className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      role="combobox"
                      aria-expanded={pickerOpen}
                      aria-label="Batch number"
                      placeholder="Batch number — e.g. 01-04-2026…"
                      value={draftBatchNo}
                      onChange={(event) => {
                        setDraftBatchNo(event.target.value)
                        if (!pickerOpen) setPickerOpen(true)
                      }}
                      className="h-9 pl-8"
                    />
                  </div>
                </PopoverTrigger>
                <PopoverContent
                  className="w-[340px] p-0"
                  align="start"
                  onOpenAutoFocus={(event) => event.preventDefault()}
                >
                  <Command shouldFilter={false}>
                    <CommandList>
                      {suggestionsFetching ? (
                        <div className="flex items-center gap-2 px-3 py-4 text-sm text-muted-foreground">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Searching batches…
                        </div>
                      ) : (suggestions?.data ?? []).length === 0 ? (
                        <div className="px-3 py-4 text-sm text-muted-foreground">
                          No matching batches.
                        </div>
                      ) : (
                        <CommandGroup>
                          {(suggestions?.data ?? []).map(
                            (s: any, index: number) => {
                              const value = `${s.batchNo}|${s.itemId}|${s.godownId}|${index}`
                              return (
                                <CommandItem
                                  key={value}
                                  value={value}
                                  onSelect={() => {
                                    applyBatch(s.batchNo)
                                    setPickerOpen(false)
                                  }}
                                  className="gap-2"
                                >
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

            <Button type="submit" size="sm" className="h-9 px-4">
              Load lifeline
            </Button>
            {(batchNo || itemId !== 'all' || godownId !== 'all' || fromDate || toDate) && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-9"
                onClick={clearAll}
              >
                <IconX className="mr-1 h-3.5 w-3.5" />
                Clear
              </Button>
            )}
          </form>

          {/* Narrows — the batch number is the key; these only thin the result */}
          <div className="flex flex-wrap items-center gap-2 border-t pt-3">
            <Select
              value={itemId}
              onValueChange={(value) => setItemId(value)}
            >
              <SelectTrigger className="h-9 w-[200px]" aria-label="Item">
                <SelectValue placeholder="All items" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All items</SelectItem>
                {itemOptions(lifeline?.buckets ?? []).map((option) => (
                  <SelectItem key={option.value} value={String(option.value)}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={godownId}
              onValueChange={(value) => setGodownId(value)}
            >
              <SelectTrigger className="h-9 w-[190px]" aria-label="Godown">
                <SelectValue placeholder="All godowns" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All godowns</SelectItem>
                {godownOptions(lifeline?.buckets ?? []).map((option) => (
                  <SelectItem key={option.value} value={String(option.value)}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <IconCalendarMonth className="h-3.5 w-3.5" />
              Between
              <Input
                type="date"
                className="h-9 w-[150px]"
                aria-label="Lifeline from date"
                value={fromDate}
                onChange={(event) => setFromDate(event.target.value)}
              />
              →
              <Input
                type="date"
                className="h-9 w-[150px]"
                aria-label="Lifeline to date"
                value={toDate}
                onChange={(event) => setToDate(event.target.value)}
              />
              {(fromDate || toDate) && (
                <span
                  className="text-[10px]"
                  title="Lines before the window are replayed so the running balance still carries in correctly."
                >
                  (balances carry in from the replayed history)
                </span>
              )}
            </div>

            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <Switch
                checked={includeSnapshots}
                onCheckedChange={setIncludeSnapshots}
                aria-label="Include year-end snapshots"
              />
              Year-end snapshots
            </label>

            <Select
              value={String(limit)}
              onValueChange={(value) => setLimit(Number(value))}
            >
              <SelectTrigger className="h-9 w-[160px]" aria-label="Max lines">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LIMIT_OPTIONS.map((option) => (
                  <SelectItem key={option} value={String(option)}>
                    Max {option} lines
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {multipleBuckets && (
              <Select value={bucketKey} onValueChange={setBucketKey}>
                <SelectTrigger className="h-9 w-[260px]" aria-label="Bucket">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_BUCKETS}>
                    All items and godowns
                  </SelectItem>
                  {bucketOptions(lifeline?.buckets ?? []).map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Body */}
      {batchNo === '' ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <IconHistory className="mx-auto mb-3 h-12 w-12 opacity-40" />
            <p className="text-lg font-medium">Pick a batch number</p>
            <p className="mx-auto mt-1 max-w-xl text-sm">
              The lifeline follows one batch number through its whole life —
              from the voucher that first booked it to its last issue, in every
              godown and every fiscal year. Batch numbers are shared across
              items here, so the timeline tells you which item each line belongs
              to.
            </p>
          </CardContent>
        </Card>
      ) : isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : isError ? (
        <Card>
          <CardContent className="py-12 text-center">
            <IconX className="mx-auto mb-3 h-10 w-10 text-destructive opacity-60" />
            <p className="font-medium text-destructive">
              Failed to load the batch lifeline
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
      ) : !lifeline || lifeline.totals.rowCount === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <IconPackage className="mx-auto mb-3 h-12 w-12 opacity-40" />
            <p className="text-lg font-medium">
              No lines recorded against{' '}
              <span className="font-mono">{batchNo}</span>
            </p>
            <p className="mt-1 text-sm">
              Check the batch number, or widen the item / godown / date narrows.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Summary */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            <Card>
              <CardContent className="p-3">
                <div className="text-xl font-bold">{summary?.rowCount ?? 0}</div>
                <div className="text-xs text-muted-foreground">
                  Lines on the timeline
                </div>
                <div className="mt-0.5 text-[10px] text-muted-foreground/80">
                  {summary?.movementCount ?? 0} movement(s)
                  {(summary?.openingRowCount ?? 0) > 0 &&
                    ` · ${summary?.openingRowCount} opening`}
                  {(summary?.snapshotRowCount ?? 0) > 0 &&
                    ` · ${summary?.snapshotRowCount} snapshot`}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3">
                <div className="text-xl font-bold tabular-nums text-emerald-600">
                  {formatQty(
                    summary?.inQuantity ?? 0,
                    summary?.noOfDecimalPlaces ?? 2,
                    summary?.unitCode ?? null,
                  )}
                </div>
                <div className="text-xs text-muted-foreground">Received</div>
                <div className="mt-0.5 text-[10px] tabular-nums text-muted-foreground/80">
                  {formatCompactInr(summary?.inValue ?? 0)}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3">
                <div className="text-xl font-bold tabular-nums text-orange-600">
                  {formatQty(
                    summary?.outQuantity ?? 0,
                    summary?.noOfDecimalPlaces ?? 2,
                    summary?.unitCode ?? null,
                  )}
                </div>
                <div className="text-xs text-muted-foreground">Issued</div>
                <div className="mt-0.5 text-[10px] tabular-nums text-muted-foreground/80">
                  {formatCompactInr(summary?.outValue ?? 0)}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3">
                <div
                  className={cn(
                    'text-xl font-bold tabular-nums',
                    (summary?.closingQuantity ?? 0) < 0
                      ? 'text-destructive'
                      : 'text-primary',
                  )}
                >
                  {formatQty(
                    summary?.closingQuantity ?? 0,
                    summary?.noOfDecimalPlaces ?? 2,
                    summary?.unitCode ?? null,
                  )}
                </div>
                <div className="text-xs text-muted-foreground">
                  Balance today
                </div>
                <div className="mt-0.5 text-[10px] tabular-nums text-muted-foreground/80">
                  {formatAmount(summary?.closingValue ?? 0)}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3">
                <div className="text-xl font-bold">
                  {lifeline.buckets.length}
                </div>
                <div className="text-xs text-muted-foreground">
                  Item / godown bucket(s)
                </div>
                <div className="mt-0.5 text-[10px] text-muted-foreground/80">
                  {itemOptions(lifeline.buckets).length} item(s) ·{' '}
                  {godownOptions(lifeline.buckets).length} godown(s)
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="space-y-1 p-3">
                <div className="text-xs text-muted-foreground">
                  Reconciled reads
                </div>
                <div className="flex items-center gap-1 text-[11px]">
                  <IconArrowsExchange className="h-3.5 w-3.5 text-blue-500" />
                  {summary?.transferCount ?? 0} transfer line(s)
                </div>
                <div className="flex items-center gap-1 text-[11px]">
                  <IconAlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                  {summary?.restatedOpeningCount ?? 0} restated opening(s)
                </div>
              </CardContent>
            </Card>
          </div>

          {(lifeline.meta.truncated ||
            lifeline.meta.seedTruncated ||
            summary?.mixedUnits) && (
            <div className="flex flex-wrap items-center gap-2 rounded-md border border-amber-500/40 bg-amber-500/[0.06] px-3 py-2 text-xs text-amber-700 dark:text-amber-400">
              <IconAlertTriangle className="h-3.5 w-3.5 shrink-0" />
              {lifeline.meta.truncated && (
                <span>
                  Showing the first {lifeline.meta.limit} line(s) — raise “Max
                  lines” to see the rest of the history.
                </span>
              )}
              {lifeline.meta.seedTruncated && (
                <span>
                  The pre-window history was too long to replay, so the balances
                  carried in may be incomplete — drop the start date to read the
                  full history.
                </span>
              )}
              {summary?.mixedUnits && (
                <span>
                  This batch number spans items whose quantities are in
                  different units — pick a bucket to read them one unit at a
                  time.
                </span>
              )}
            </div>
          )}

          <Card className="overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b bg-muted/30 px-3 py-2">
              <p className="text-xs font-medium">
                {bucketKey === ALL_BUCKETS
                  ? 'Whole batch number'
                  : bucketLabel(
                      lifeline.buckets.find((b) => b.key === bucketKey)!,
                    )}
              </p>
              <p className="text-[11px] text-muted-foreground">
                {lifeline.meta.seedRowCount > 0 &&
                  `${lifeline.meta.seedRowCount} earlier line(s) replayed for the balance · `}
                {lifeline.meta.includesClosingSnapshots
                  ? 'year-end snapshots included (markers only)'
                  : 'year-end snapshots hidden'}
              </p>
            </div>
            <LifelineTimeline
              rows={rows}
              years={years}
              showItem={multipleBuckets && bucketKey === ALL_BUCKETS}
              asOnDate={lifeline.asOnDate}
              seedRowCount={lifeline.meta.seedRowCount}
            />
          </Card>
        </>
      )}
    </Main>
  )
}
