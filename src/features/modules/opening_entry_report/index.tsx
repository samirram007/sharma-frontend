import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Tabs, TabsContent } from '@/components/ui/tabs'
import { Main } from '@/layouts/components/main'
import { useQuery } from '@tanstack/react-query'
import {
  IconBuildingBank,
  IconChevronDown,
  IconChevronRight,
  IconDatabase,
  IconDoorEnter,
  IconEye,
  IconPackage,
  IconRefresh,
  IconX,
} from '@tabler/icons-react'
import {
  Loader,
  Download,
  FileSpreadsheet,
  FileText,
  FileJson,
  Clipboard,
  Printer,
  BarChart3,
} from 'lucide-react'
import { useCallback, useMemo, useState } from 'react'
import { getRouteApi, useNavigate } from '@tanstack/react-router'
import { format } from 'date-fns'
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  openingEntryReportQueryOptions,
  groupedByLedgerQueryOptions,
} from './data/queryOptions'
import { getNatureBadge } from '@/utils/nature-badge'
import { useAuth } from '@/features/auth/contexts/AuthContext'
import type { OpeningEntryReport } from './data/schema'

function fmtDate(value: string | Date | null | undefined): string {
  if (!value) return ''
  const d = new Date(value)
  if (isNaN(d.getTime())) return String(value)
  return format(d, 'dd-MMM-yyyy')
}

function formatExportRows(vouchers: any[]): Record<string, string>[] {
  return vouchers.map((v) => {
    const entries = v.voucherEntries ?? []
    const ledgersSummary = entries
      .map(
        (e: any) =>
          `${e.accountLedgerName} (${e.natureCode ?? e.nature ?? '-'}) ${e.debit > 0 ? `Dr ${e.debit}` : ''}${e.credit > 0 ? `Cr ${e.credit}` : ''}`,
      )
      .join('; ')

    const stockItems = v.stockJournal?.entries ?? []
    const stockSummary = stockItems
      .map((e: any) => {
        const godowns = (e.godownEntries ?? [])
          .map((ge: any) => `${ge.godownName ?? '-'}: ${ge.actualQuantity}`)
          .join(', ')
        return `${e.stockItemName ?? 'Item#' + e.stockItemId} (Qty: ${e.actualQuantity}${godowns ? ` [${godowns}]` : ''})`
      })
      .join(' | ')

    return {
      voucherNo: v.voucherNo ?? '',
      voucherDate: v.voucherDate ? fmtDate(v.voucherDate) : '',
      ledgers: ledgersSummary || 'No entries',
      totalDebit: (v.totalDebit ?? 0).toFixed(2),
      totalCredit: (v.totalCredit ?? 0).toFixed(2),
      stockItems: stockSummary || 'No stock',
      remarks: v.remarks ?? '',
    }
  })
}

function formatItemDetailRows(vouchers: any[]): Record<string, string>[] {
  const rows: Record<string, string>[] = []
  for (const v of vouchers) {
    const entries = v.voucherEntries ?? []
    const stockEntries = v.stockJournal?.entries ?? []

    if (stockEntries.length === 0) {
      rows.push({
        voucherNo: v.voucherNo ?? '',
        voucherDate: v.voucherDate ? fmtDate(v.voucherDate) : '',
        ledgerName:
          entries
            .map((e: any) => e.accountLedgerName)
            .filter(Boolean)
            .join('; ') || '—',
        stockItem: '',
        godown: '',
        batchNo: '',
        quantity: '',
        rate: '',
        amount: '',
      })
      continue
    }

    for (const entry of stockEntries) {
      const godownEntries = entry.godownEntries ?? []

      if (godownEntries.length === 0) {
        rows.push({
          voucherNo: v.voucherNo ?? '',
          voucherDate: v.voucherDate ? fmtDate(v.voucherDate) : '',
          ledgerName:
            entries
              .map((e: any) => e.accountLedgerName)
              .filter(Boolean)
              .join('; ') || '—',
          stockItem: entry.stockItemName ?? `Item #${entry.stockItemId}`,
          godown: '',
          batchNo: '',
          quantity: (entry.actualQuantity ?? 0).toFixed(2),
          rate: (entry.rate ?? 0).toFixed(2),
          amount: (entry.amount ?? 0).toFixed(2),
        })
        continue
      }

      for (const ge of godownEntries) {
        rows.push({
          voucherNo: v.voucherNo ?? '',
          voucherDate: v.voucherDate ? fmtDate(v.voucherDate) : '',
          ledgerName:
            entries
              .map((e: any) => e.accountLedgerName)
              .filter(Boolean)
              .join('; ') || '—',
          stockItem: entry.stockItemName ?? `Item #${entry.stockItemId}`,
          godown: ge.godownName ?? '',
          batchNo: ge.batchNo ?? '',
          quantity: (ge.actualQuantity ?? 0).toFixed(2),
          rate: (entry.rate ?? 0).toFixed(2),
          amount: (entry.amount ?? 0).toFixed(2),
        })
      }
    }
  }
  return rows
}

const routeApi = getRouteApi('/_protected/reports/opening_entry/')

export default function OpeningEntryReport() {
  const navigate = useNavigate()
  const { userFiscalYear } = useAuth()
  const { fy: searchFyId } = routeApi.useSearch()
  // The report follows the user's assigned fiscal year (userFiscalYear). A ?fy=
  // search param (e.g. from the fiscal year open success page) overrides it.
  const fiscalYearId = searchFyId ?? userFiscalYear?.fiscalYearId ?? null
  const [expandedVouchers, setExpandedVouchers] = useState<Set<number>>(
    new Set(),
  )
  const [expandedEntries, setExpandedEntries] = useState<Set<number>>(new Set())
  const [activeTab, setActiveTab] = useState('list')

  const {
    data: reportData,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    ...openingEntryReportQueryOptions(fiscalYearId ?? 0),
    enabled: !!fiscalYearId,
  })

  const { data: ledgerGrouped, isLoading: ledgerLoading } = useQuery({
    ...groupedByLedgerQueryOptions(fiscalYearId ?? 0),
    enabled: activeTab === 'by-ledger' && !!fiscalYearId,
  })

  const report = reportData?.data as OpeningEntryReport | undefined

  const toggleVoucher = (id: number) => {
    setExpandedVouchers((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleEntry = (id: number) => {
    setExpandedEntries((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const formatAmt = (val: number) =>
    val.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })

  const formatDate = (val: string | null | undefined) => {
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

  const vouchers = report?.vouchers ?? []

  // ---- Export columns & data ----
  const summaryExportColumns = useMemo(
    () => [
      { header: 'Voucher No', accessor: 'voucherNo' as const },
      { header: 'Voucher Date', accessor: 'voucherDate' as const },
      { header: 'Ledgers (Dr/Cr)', accessor: 'ledgers' as const },
      { header: 'Total Debit', accessor: 'totalDebit' as const },
      { header: 'Total Credit', accessor: 'totalCredit' as const },
      { header: 'Stock Items', accessor: 'stockItems' as const },
      { header: 'Remarks', accessor: 'remarks' as const },
    ],
    [],
  )

  const summaryExportData = useMemo(
    () => formatExportRows(vouchers),
    [vouchers],
  )
  const summaryHeaders = summaryExportColumns.map((c) => c.header)
  const summaryFlatRows = useMemo(
    () =>
      summaryExportData.map((row) =>
        summaryExportColumns.map((c) => String(row[c.accessor] ?? '')),
      ),
    [summaryExportData, summaryExportColumns],
  )

  const detailExportColumns = useMemo(
    () => [
      { header: 'Voucher No', accessor: 'voucherNo' as const },
      { header: 'Voucher Date', accessor: 'voucherDate' as const },
      { header: 'Ledger Names', accessor: 'ledgerName' as const },
      { header: 'Stock Item', accessor: 'stockItem' as const },
      { header: 'Godown', accessor: 'godown' as const },
      { header: 'Batch No', accessor: 'batchNo' as const },
      { header: 'Quantity', accessor: 'quantity' as const },
      { header: 'Rate', accessor: 'rate' as const },
      { header: 'Amount', accessor: 'amount' as const },
    ],
    [],
  )

  const detailExportData = useMemo(
    () => formatItemDetailRows(vouchers),
    [vouchers],
  )
  const detailHeaders = detailExportColumns.map((c) => c.header)
  const detailFlatRows = useMemo(
    () =>
      detailExportData.map((row) =>
        detailExportColumns.map((c) => String(row[c.accessor] ?? '')),
      ),
    [detailExportData, detailExportColumns],
  )

  // ---- Export handlers ----
  const downloadBlob = useCallback(
    (content: string, fileName: string, mimeType: string) => {
      const blob = new Blob([content], { type: mimeType })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = fileName
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    },
    [],
  )

  const downloadCsv = useCallback(
    (headers: string[], flatRows: string[][], suffix: string) => {
      const bom = '\uFEFF'
      const csv =
        bom +
        [headers.join(','), ...flatRows.map((r) => r.join(','))].join('\n')
      downloadBlob(
        csv,
        `opening-entry-report-${suffix}.csv`,
        'text/csv;charset=utf-8;',
      )
    },
    [downloadBlob],
  )

  const downloadJson = useCallback(
    (data: unknown, suffix: string) => {
      downloadBlob(
        JSON.stringify(data, null, 2),
        `opening-entry-report-${suffix}.json`,
        'application/json',
      )
    },
    [downloadBlob],
  )

  const copyToClipboard = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      const ta = document.createElement('textarea')
      ta.value = text
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
    }
  }, [])

  const exportPdf = useCallback(
    async (
      title: string,
      columns: { header: string; accessor: string }[],
      data: Record<string, string>[],
      suffix: string,
    ) => {
      const { default: exportTableToPdf } =
        await import('@/utils/export-table-pdf')
      exportTableToPdf({
        fileName: `opening-entry-report-${suffix}.pdf`,
        sections: [{ title, columnData: columns, data }],
      })
    },
    [],
  )

  const exportExcel = useCallback(
    async (
      title: string,
      columns: { header: string; accessor: string }[],
      data: Record<string, string>[],
      suffix: string,
    ) => {
      const { default: exportTableToExcel } =
        await import('@/utils/export-table-excel')
      await exportTableToExcel({
        title,
        columnData: columns,
        data,
        fileName: `opening-entry-report-${suffix}.xlsx`,
      })
    },
    [],
  )

  return (
    <Main className="max-w-6xl mx-auto space-y-6 py-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <IconDoorEnter className="h-6 w-6 text-primary" />
            <h1 className="text-3xl font-bold tracking-tight">
              Opening Entry Report
            </h1>
          </div>
          <p className="text-muted-foreground">
            View opening journal voucher details — carried forward ledger
            balances and stock quantities
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* View Selector */}
          {fiscalYearId && report && (
            <Select value={activeTab} onValueChange={setActiveTab}>
              <SelectTrigger className="h-8 w-[170px] border-0 bg-transparent shadow-none p-0 text-sm font-medium text-muted-foreground hover:text-foreground focus:ring-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent side="bottom" align="end">
                <SelectItem value="list">📋 Voucher Details</SelectItem>
                <SelectItem value="by-ledger">📒 By Ledger</SelectItem>
              </SelectContent>
            </Select>
          )}

          {/* Export Controls — only shown for list view */}
          {report && vouchers.length > 0 && activeTab === 'list' && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                title="Copy to Clipboard"
                onClick={() => {
                  const tsv = [
                    summaryHeaders.join('\t'),
                    ...summaryFlatRows.map((r) => r.join('\t')),
                  ].join('\n')
                  copyToClipboard(tsv)
                }}
              >
                <Clipboard className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                title="Print"
                onClick={() => window.print()}
              >
                <Printer className="h-4 w-4" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    title="Export"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="text-xs font-medium">
                    Summary View
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() =>
                      exportPdf(
                        'Opening Entry Report — Summary',
                        summaryExportColumns,
                        summaryExportData,
                        'summary',
                      )
                    }
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    PDF
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() =>
                      exportExcel(
                        'Opening Entry Report — Summary',
                        summaryExportColumns,
                        summaryExportData,
                        'summary',
                      )
                    }
                  >
                    <FileSpreadsheet className="mr-2 h-4 w-4" />
                    Excel
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() =>
                      downloadCsv(summaryHeaders, summaryFlatRows, 'summary')
                    }
                  >
                    <FileSpreadsheet className="mr-2 h-4 w-4" />
                    CSV
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => downloadJson(summaryExportData, 'summary')}
                  >
                    <FileJson className="mr-2 h-4 w-4" />
                    JSON
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />
                  <DropdownMenuLabel className="text-xs font-medium">
                    Item Details View
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() =>
                      exportPdf(
                        'Opening Entry Report — Item Details',
                        detailExportColumns,
                        detailExportData,
                        'item-details',
                      )
                    }
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    PDF
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() =>
                      exportExcel(
                        'Opening Entry Report — Item Details',
                        detailExportColumns,
                        detailExportData,
                        'item-details',
                      )
                    }
                  >
                    <FileSpreadsheet className="mr-2 h-4 w-4" />
                    Excel
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() =>
                      downloadCsv(detailHeaders, detailFlatRows, 'item-details')
                    }
                  >
                    <FileSpreadsheet className="mr-2 h-4 w-4" />
                    CSV
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() =>
                      downloadJson(detailExportData, 'item-details')
                    }
                  >
                    <FileJson className="mr-2 h-4 w-4" />
                    JSON
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
          <Button
            onClick={() => navigate({ to: '/transactions/opening-balance' })}
          >
            <IconDoorEnter className="mr-2 h-4 w-4" />
            Opening Balance Setup
          </Button>
          <Button
            variant="outline"
            onClick={() =>
              navigate({ to: '/masters/organization/fiscal_year' })
            }
          >
            <IconEye className="mr-2 h-4 w-4" />
            Back
          </Button>
        </div>
      </div>

      <Separator />

      {/* No Fiscal Year Assigned */}
      {!fiscalYearId && (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <IconDatabase className="h-12 w-12 mx-auto mb-3 opacity-40" />
            <p className="text-lg font-medium">No fiscal year assigned</p>
            <p className="text-sm mt-1">
              Assign a fiscal year to your account to view its opening entry
              details.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {fiscalYearId && isLoading && (
        <div className="flex items-center justify-center py-16">
          <Loader className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Error State */}
      {fiscalYearId && isError && (
        <div className="flex items-center justify-center py-16">
          <div className="text-center space-y-4">
            <IconX className="h-12 w-12 text-destructive mx-auto" />
            <p className="text-lg font-medium text-destructive">
              Failed to load opening entry report
            </p>
            <Button variant="outline" onClick={() => refetch()}>
              <IconRefresh className="mr-2 h-4 w-4" />
              Retry
            </Button>
          </div>
        </div>
      )}

      {/* Report Content — wrapped in Tabs */}
      {fiscalYearId && report && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Card className="transition-shadow hover:shadow-md">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-2xl font-bold">
                    {report.totalVouchers}
                  </CardTitle>
                  <IconDoorEnter className="h-5 w-5 text-muted-foreground" />
                </div>
                <CardDescription>Opening Journal Vouchers</CardDescription>
              </CardHeader>
            </Card>
            <Card className="transition-shadow hover:shadow-md">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-2xl font-bold">
                    {report.fiscalYear.name}
                  </CardTitle>
                  <IconDatabase className="h-5 w-5 text-muted-foreground" />
                </div>
                <CardDescription>Fiscal Year</CardDescription>
              </CardHeader>
            </Card>
            <Card className="transition-shadow hover:shadow-md">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-2xl font-bold">
                    {formatDate(report.fiscalYear.startDate)} —{' '}
                    {formatDate(report.fiscalYear.endDate)}
                  </CardTitle>
                  <IconPackage className="h-5 w-5 text-muted-foreground" />
                </div>
                <CardDescription>Period</CardDescription>
              </CardHeader>
            </Card>
          </div>

          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            {/* ── Voucher Details View ── */}
            <TabsContent value="list">
              {vouchers.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center text-muted-foreground">
                    <IconPackage className="h-12 w-12 mx-auto mb-3 opacity-40" />
                    <p className="text-lg font-medium">
                      No opening entries found
                    </p>
                    <p className="text-sm mt-1">
                      This fiscal year has no opening journal vouchers. Open the
                      fiscal year first.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {vouchers.map((voucher) => {
                    const isExpanded = expandedVouchers.has(voucher.id)
                    const hasStock = !!voucher.stockJournal

                    return (
                      <Card key={voucher.id} className="overflow-hidden">
                        {/* Voucher Header */}
                        <button
                          onClick={() => toggleVoucher(voucher.id)}
                          className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors text-left"
                        >
                          <div className="flex items-center gap-3">
                            {isExpanded ? (
                              <IconChevronDown className="h-5 w-5 text-muted-foreground" />
                            ) : (
                              <IconChevronRight className="h-5 w-5 text-muted-foreground" />
                            )}
                            <div>
                              <span className="font-semibold text-base">
                                {voucher.voucherNo ?? `Voucher #${voucher.id}`}
                              </span>
                              <span className="ml-3 text-sm text-muted-foreground">
                                {formatDate(voucher.voucherDate)}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge
                              variant="outline"
                              className="font-mono text-xs"
                            >
                              {voucher.voucherEntries.length} entries
                            </Badge>
                            {hasStock && (
                              <Badge variant="secondary" className="text-xs">
                                <IconPackage className="mr-1 h-3 w-3" />
                                {voucher.stockJournal!.entries.length} items
                              </Badge>
                            )}
                          </div>
                        </button>

                        {/* Expanded Content */}
                        {isExpanded && (
                          <div className="border-t">
                            {/* Remarks */}
                            {voucher.remarks && (
                              <div className="px-4 py-2 text-sm text-muted-foreground bg-muted/20 border-b">
                                <span className="font-medium">Remarks:</span>{' '}
                                {voucher.remarks}
                              </div>
                            )}

                            {/* Voucher Entries Table (Ledgers) */}
                            <div className="p-4">
                              <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                                <IconBuildingBank className="h-4 w-4 text-blue-500" />
                                Balance Sheet Ledgers
                              </h4>
                              <div className="overflow-x-auto rounded-md border">
                                <table className="w-full text-sm">
                                  <thead>
                                    <tr className="border-b bg-muted/50">
                                      <th className="p-2.5 text-left font-medium">
                                        #
                                      </th>
                                      <th className="p-2.5 text-left font-medium">
                                        Ledger
                                      </th>
                                      <th className="p-2.5 text-left font-medium">
                                        Nature
                                      </th>
                                      <th className="p-2.5 text-right font-medium">
                                        Debit
                                      </th>
                                      <th className="p-2.5 text-right font-medium">
                                        Credit
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {voucher.voucherEntries.map(
                                      (entry, idx) => (
                                        <tr
                                          key={entry.id}
                                          className="border-b last:border-0 hover:bg-muted/30"
                                        >
                                          <td className="p-2.5 text-muted-foreground">
                                            {idx + 1}
                                          </td>
                                          <td className="p-2.5 font-medium">
                                            {entry.accountLedgerName ??
                                              `Ledger #${entry.accountLedgerId}`}
                                          </td>
                                          <td className="p-2.5">
                                            <Badge
                                              variant="outline"
                                              className={
                                                getNatureBadge(entry.natureCode)
                                                  .className
                                              }
                                            >
                                              {entry.nature ??
                                                entry.natureCode ??
                                                '—'}
                                            </Badge>
                                          </td>
                                          <td className="p-2.5 text-right font-mono tabular-nums">
                                            {entry.debit > 0
                                              ? formatAmt(entry.debit)
                                              : '—'}
                                          </td>
                                          <td className="p-2.5 text-right font-mono tabular-nums">
                                            {entry.credit > 0
                                              ? formatAmt(entry.credit)
                                              : '—'}
                                          </td>
                                        </tr>
                                      ),
                                    )}
                                  </tbody>
                                  <tfoot>
                                    <tr className="border-t-2 border-primary/30 bg-primary/[0.04] font-semibold">
                                      <td
                                        colSpan={3}
                                        className="p-2.5 text-primary"
                                      >
                                        Total
                                      </td>
                                      <td className="p-2.5 text-right font-mono tabular-nums">
                                        {formatAmt(voucher.totalDebit)}
                                      </td>
                                      <td className="p-2.5 text-right font-mono tabular-nums">
                                        {formatAmt(voucher.totalCredit)}
                                      </td>
                                    </tr>
                                  </tfoot>
                                </table>
                              </div>
                            </div>

                            {/* Stock Journal Section */}
                            {hasStock && voucher.stockJournal && (
                              <div className="border-t px-4 py-3">
                                <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                                  <IconPackage className="h-4 w-4 text-emerald-500" />
                                  Stock Items — {voucher.stockJournal.journalNo}
                                </h4>
                                <div className="space-y-2">
                                  {voucher.stockJournal.entries.map((entry) => {
                                    const isEntryExpanded = expandedEntries.has(
                                      entry.id,
                                    )
                                    return (
                                      <div
                                        key={entry.id}
                                        className="rounded-md border bg-card overflow-hidden"
                                      >
                                        <button
                                          onClick={() => toggleEntry(entry.id)}
                                          className="w-full flex items-center justify-between p-3 hover:bg-muted/30 transition-colors text-left"
                                        >
                                          <div className="flex items-center gap-2">
                                            {isEntryExpanded ? (
                                              <IconChevronDown className="h-4 w-4 text-muted-foreground" />
                                            ) : (
                                              <IconChevronRight className="h-4 w-4 text-muted-foreground" />
                                            )}
                                            <span className="font-medium text-sm">
                                              {entry.stockItemName ??
                                                `Item #${entry.stockItemId}`}
                                            </span>
                                          </div>
                                          <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                            <span>
                                              Qty:{' '}
                                              <strong>
                                                {entry.actualQuantity.toFixed(
                                                  2,
                                                )}
                                              </strong>
                                            </span>
                                            {entry.stockUnitName && (
                                              <span className="font-mono text-xs">
                                                {entry.stockUnitName}
                                              </span>
                                            )}
                                            {entry.rate > 0 && (
                                              <span>
                                                @ {formatAmt(entry.rate)}
                                              </span>
                                            )}
                                          </div>
                                        </button>

                                        {isEntryExpanded &&
                                          entry.godownEntries.length > 0 && (
                                            <div className="border-t bg-muted/10">
                                              <table className="w-full text-sm">
                                                <thead>
                                                  <tr className="border-b bg-muted/20">
                                                    <th className="p-2 pl-6 text-left font-medium text-xs text-muted-foreground">
                                                      Godown
                                                    </th>
                                                    <th className="p-2 text-left font-medium text-xs text-muted-foreground">
                                                      Batch No
                                                    </th>
                                                    <th className="p-2 text-right font-medium text-xs text-muted-foreground">
                                                      Quantity
                                                    </th>
                                                    <th className="p-2 text-left font-medium text-xs text-muted-foreground">
                                                      Remarks
                                                    </th>
                                                  </tr>
                                                </thead>
                                                <tbody>
                                                  {entry.godownEntries.map(
                                                    (ge) => (
                                                      <tr
                                                        key={ge.id}
                                                        className="border-b last:border-0"
                                                      >
                                                        <td className="p-2 pl-6 font-medium">
                                                          {ge.godownName ??
                                                            `Godown #${ge.godownId}`}
                                                        </td>
                                                        <td className="p-2">
                                                          {ge.batchNo ? (
                                                            <Badge
                                                              variant="outline"
                                                              className="text-[11px] px-1.5 py-0 font-mono"
                                                            >
                                                              {ge.batchNo}
                                                              {ge.expiryDate && (
                                                                <span className="ml-1 text-muted-foreground">
                                                                  exp{' '}
                                                                  {formatDate(
                                                                    ge.expiryDate,
                                                                  )}
                                                                </span>
                                                              )}
                                                            </Badge>
                                                          ) : (
                                                            <span className="text-muted-foreground">
                                                              —
                                                            </span>
                                                          )}
                                                        </td>
                                                        <td className="p-2 text-right font-mono tabular-nums">
                                                          {ge.actualQuantity.toFixed(
                                                            2,
                                                          )}
                                                        </td>
                                                        <td className="p-2 text-muted-foreground">
                                                          {ge.remarks ?? '—'}
                                                        </td>
                                                      </tr>
                                                    ),
                                                  )}
                                                </tbody>
                                              </table>
                                            </div>
                                          )}

                                        {isEntryExpanded &&
                                          entry.godownEntries.length === 0 && (
                                            <div className="border-t px-6 py-3 text-sm text-muted-foreground bg-muted/10">
                                              No godown-level breakdown for this
                                              item.
                                            </div>
                                          )}
                                      </div>
                                    )
                                  })}
                                </div>
                              </div>
                            )}

                            {/* No Stock */}
                            {!hasStock && (
                              <div className="border-t px-4 py-3 text-sm text-muted-foreground">
                                <IconPackage className="inline h-4 w-4 mr-1 opacity-50" />
                                No stock items carried forward in this voucher.
                              </div>
                            )}
                          </div>
                        )}
                      </Card>
                    )
                  })}
                </div>
              )}
            </TabsContent>

            {/* ── Grouped by Ledger View ── */}
            <TabsContent value="by-ledger">
              {ledgerLoading ? (
                <div className="flex items-center justify-center h-32">
                  <Loader className="animate-spin h-6 w-6" />
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      <span className="font-semibold text-foreground">
                        {(ledgerGrouped?.data ?? []).length}
                      </span>{' '}
                      ledgers
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => {
                          const headers = [
                            'Ledger',
                            'Vouchers',
                            'Total Debit',
                            'Total Credit',
                            'Net Balance',
                          ]
                          const rows = (ledgerGrouped?.data ?? []).map(
                            (r: any) => [
                              r.ledgerName,
                              r.voucherCount,
                              formatAmt(r.totalDebit),
                              formatAmt(r.totalCredit),
                              formatAmt(r.netBalance),
                            ],
                          )
                          const bom = '\uFEFF'
                          const csv =
                            bom +
                            [
                              headers.join(','),
                              ...rows.map((r: string[]) => r.join(',')),
                            ].join('\n')
                          downloadBlob(
                            csv,
                            'opening-entry-report-by-ledger.csv',
                            'text/csv;charset=utf-8;',
                          )
                        }}
                      >
                        <Download className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>

                  {/* Chart */}
                  {(ledgerGrouped?.data ?? []).length > 0 && (
                    <div className="rounded-lg border bg-card p-4">
                      <h4 className="flex items-center gap-2 text-sm font-semibold mb-3 text-slate-700 dark:text-slate-300">
                        <BarChart3 className="h-4 w-4 text-primary" />
                        Net Balance by Ledger
                      </h4>
                      <ResponsiveContainer width="100%" height={220}>
                        <BarChart
                          data={(ledgerGrouped?.data ?? [])
                            .slice(0, 15)
                            .map((r: any) => ({
                              name:
                                r.ledgerName?.length > 18
                                  ? r.ledgerName.slice(0, 16) + '…'
                                  : r.ledgerName,
                              balance: Math.abs(r.netBalance ?? 0),
                            }))}
                        >
                          <XAxis
                            dataKey="name"
                            stroke="#888888"
                            fontSize={11}
                            tickLine={false}
                            axisLine={false}
                            interval={0}
                            angle={-20}
                            textAnchor="end"
                            height={60}
                          />
                          <YAxis
                            stroke="#888888"
                            fontSize={11}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(v: number) =>
                              v >= 100000
                                ? `${(v / 100000).toFixed(1)}L`
                                : v >= 1000
                                  ? `${(v / 1000).toFixed(1)}K`
                                  : String(v)
                            }
                          />
                          <Tooltip
                            contentStyle={{ fontSize: 12, borderRadius: 8 }}
                            formatter={(value) => [
                              formatAmt(Number(value) || 0),
                              'Net Balance',
                            ]}
                            labelFormatter={(label) => `Ledger: ${label}`}
                          />
                          <Bar
                            dataKey="balance"
                            fill="hsl(221.2 83.2% 53.3%)"
                            radius={[4, 4, 0, 0]}
                            maxBarSize={60}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}

                  {/* Table */}
                  <div className="rounded-md border">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b bg-muted/50">
                          <th className="text-left p-3 font-medium">Ledger</th>
                          <th className="text-right p-3 font-medium">
                            Vouchers
                          </th>
                          <th className="text-right p-3 font-medium">
                            Total Debit
                          </th>
                          <th className="text-right p-3 font-medium">
                            Total Credit
                          </th>
                          <th className="text-right p-3 font-medium">
                            Net Balance
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {(ledgerGrouped?.data ?? []).map(
                          (row: any, i: number) => (
                            <tr key={i} className="border-b hover:bg-muted/30">
                              <td className="p-3 font-medium">
                                {row.ledgerName}
                              </td>
                              <td className="p-3 text-right">
                                {row.voucherCount}
                              </td>
                              <td className="p-3 text-right tabular-nums">
                                {formatAmt(row.totalDebit)}
                              </td>
                              <td className="p-3 text-right tabular-nums">
                                {formatAmt(row.totalCredit)}
                              </td>
                              <td className="p-3 text-right tabular-nums font-semibold">
                                {formatAmt(row.netBalance)}
                              </td>
                            </tr>
                          ),
                        )}
                        {(ledgerGrouped?.data ?? []).length > 0 && (
                          <tr className="border-t-2 border-primary/30 bg-primary/[0.04] font-semibold">
                            <td className="p-3 text-primary">Total</td>
                            <td className="p-3 text-right">
                              {(ledgerGrouped?.data ?? []).reduce(
                                (s: number, r: any) =>
                                  s + (r.voucherCount ?? 0),
                                0,
                              )}
                            </td>
                            <td className="p-3 text-right tabular-nums">
                              {formatAmt(
                                (ledgerGrouped?.data ?? []).reduce(
                                  (s: number, r: any) =>
                                    s + (r.totalDebit ?? 0),
                                  0,
                                ),
                              )}
                            </td>
                            <td className="p-3 text-right tabular-nums">
                              {formatAmt(
                                (ledgerGrouped?.data ?? []).reduce(
                                  (s: number, r: any) =>
                                    s + (r.totalCredit ?? 0),
                                  0,
                                ),
                              )}
                            </td>
                            <td className="p-3 text-right tabular-nums">
                              {formatAmt(
                                (ledgerGrouped?.data ?? []).reduce(
                                  (s: number, r: any) =>
                                    s + (r.netBalance ?? 0),
                                  0,
                                ),
                              )}
                            </td>
                          </tr>
                        )}
                        {(ledgerGrouped?.data ?? []).length === 0 && (
                          <tr>
                            <td
                              colSpan={5}
                              className="p-6 text-center text-muted-foreground"
                            >
                              No data found.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </>
      )}
    </Main>
  )
}
