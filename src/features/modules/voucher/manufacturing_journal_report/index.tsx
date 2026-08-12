import { Main } from '@/layouts/components/main'
import { Tabs, TabsContent } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { columns } from './components/columns'
import { GridTable } from './components/grid-table'
import { ExportDropdown } from '@/components/export-dropdown'
import {
  manufacturingJournalReportListSchema,
  type ManufacturingJournalReportList,
} from './data/schema'
import type { PaginationMeta } from './data/schema'
import { useQuery } from '@tanstack/react-query'
import {
  groupedByStockItemQueryOptions,
  groupedByGodownQueryOptions,
  groupedByDateQueryOptions,
} from './data/queryOptions'
import {
  Loader,
  Search,
  BarChart3,
  Download,
  FileSpreadsheet,
  FileText,
  FileJson,
  Clipboard,
  Printer,
  ArrowDownCircle,
  ArrowUpCircle,
} from 'lucide-react'
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
} from 'recharts'
import { useCallback, useMemo, useState } from 'react'
import { format } from 'date-fns'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { SortingState } from '@tanstack/react-table'
import {
  toNum,
  formatFixed,
  formatQty,
  formatQtyFixed,
} from '@/utils/format-num'
import ReportingPeriod from '@/features/global/components/reporting-period'

interface ManufacturingJournalReportProps {
  data: ManufacturingJournalReportList
  paginationMeta?: PaginationMeta
  onPageChange?: (page: number) => void
  onPageSizeChange?: (size: number) => void
  onSearchChange?: (value: string) => void
  onSortChange?: (sortBy: string, sortOrder: string) => void
  sorting?: SortingState
}

function fmtDate(value: string | Date | null | undefined): string {
  if (!value) return ''
  const d = new Date(value)
  if (isNaN(d.getTime())) return String(value)
  return format(d, 'dd-MMM-yyyy')
}

function formatExportRows(data: any[]): Record<string, string>[] {
  return data.map((row) => {
    const entries = row.stockJournal?.stockJournalEntries ?? []
    const consumption = entries
      .filter(Boolean)
      .filter((entry: any) => (entry.movementType ?? 'in') !== 'in')
      .map(
        (entry: any) =>
          `${entry.stockItem?.name ?? entry.stockItemId ?? '-'} (Qty: ${entry.actualQuantity ?? 0}, Rate: ${entry.rate ?? 0})`,
      )
      .join(' | ')
    const production = entries
      .filter(Boolean)
      .filter((entry: any) => (entry.movementType ?? 'in') === 'in')
      .map(
        (entry: any) =>
          `${entry.stockItem?.name ?? entry.stockItemId ?? '-'} (Qty: ${entry.actualQuantity ?? 0}, Rate: ${entry.rate ?? 0})`,
      )
      .join(' | ')

    return {
      voucherDate: row.voucherDate ? fmtDate(row.voucherDate) : '',
      voucherNo: row.voucherNo ?? '',
      consumedQty: formatFixed(row.consumptionQty ?? 0),
      producedQty: formatFixed(row.productionQty ?? 0),
      consumedItems: consumption || 'No consumption',
      producedItems: production || 'No production',
      remarks: row.remarks ?? '',
      amount: formatFixed(row.amount),
    }
  })
}

function formatItemDetailRows(data: any[]): Record<string, string>[] {
  const rows: Record<string, string>[] = []
  for (const row of data) {
    const entries = row.stockJournal?.stockJournalEntries ?? []
    const validEntries = entries.filter(Boolean)
    if (validEntries.length === 0) {
      rows.push({
        voucherDate: row.voucherDate ? fmtDate(row.voucherDate) : '',
        voucherNo: row.voucherNo ?? '',
        movement: '',
        stockItem: '',
        godown: '',
        batchNo: '',
        actualQty: '',
        rate: '',
        amount: formatFixed(row.amount),
        remarks: row.remarks ?? '',
      })
      continue
    }
    for (const entry of validEntries) {
      const movement =
        (entry.movementType ?? 'in') === 'in'
          ? 'IN - Produced'
          : 'OUT - Consumed'
      const godownEntries =
        entry.stockJournalGodownEntries?.filter(Boolean) ?? []
      if (godownEntries.length === 0) {
        rows.push({
          voucherDate: row.voucherDate ? fmtDate(row.voucherDate) : '',
          voucherNo: row.voucherNo ?? '',
          movement,
          stockItem: entry.stockItem?.name ?? `Item #${entry.stockItemId}`,
          godown: '',
          batchNo: '',
          actualQty: formatFixed(entry.actualQuantity),
          rate: formatFixed(entry.rate),
          amount: formatFixed(entry.amount),
          remarks: row.remarks ?? '',
        })
        continue
      }
      for (const ge of godownEntries) {
        rows.push({
          voucherDate: row.voucherDate ? fmtDate(row.voucherDate) : '',
          voucherNo: row.voucherNo ?? '',
          movement,
          stockItem: entry.stockItem?.name ?? `Item #${entry.stockItemId}`,
          godown: ge.godown?.name ?? '',
          batchNo: ge.batchNo ?? '',
          actualQty: formatFixed(ge.actualQuantity),
          rate: formatFixed(ge.rate),
          amount: formatFixed(ge.amount),
          remarks: row.remarks ?? '',
        })
      }
    }
  }
  return rows
}

export default function ManufacturingJournalReport({
  data,
  paginationMeta,
  onPageChange,
  onPageSizeChange,
  onSearchChange,
  onSortChange,
  sorting,
}: ManufacturingJournalReportProps) {
  const [activeTab, setActiveTab] = useState('list')

  const { data: stockGrouped, isLoading: stockLoading } = useQuery({
    ...groupedByStockItemQueryOptions(),
    enabled: activeTab === 'by-stock-item',
  })
  const { data: godownGrouped, isLoading: godownLoading } = useQuery({
    ...groupedByGodownQueryOptions(),
    enabled: activeTab === 'by-godown',
  })
  const { data: dateGrouped, isLoading: dateLoading } = useQuery({
    ...groupedByDateQueryOptions(),
    enabled: activeTab === 'by-date',
  })

  const formatAmt = (val: unknown) => {
    const num = toNum(val)
    return num.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  }
  const formatDate = (value: string | Date) => {
    const date = new Date(value)
    return isNaN(date.getTime())
      ? String(value)
      : date.toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        })
  }

  // Export data for the List View (summary per voucher)
  const listExportColumns = useMemo(
    () => [
      { header: 'Voucher Date', accessor: 'voucherDate' as const },
      { header: 'Voucher No', accessor: 'voucherNo' as const },
      { header: 'Consumed Qty', accessor: 'consumedQty' as const },
      { header: 'Produced Qty', accessor: 'producedQty' as const },
      { header: 'Consumed Items', accessor: 'consumedItems' as const },
      { header: 'Produced Items', accessor: 'producedItems' as const },
      { header: 'Remarks', accessor: 'remarks' as const },
      { header: 'Amount', accessor: 'amount' as const },
    ],
    [],
  )

  const listExportData = useMemo(() => formatExportRows(data), [data])
  const listHeaders = listExportColumns.map((c) => c.header)
  const listFlatRows = useMemo(
    () =>
      listExportData.map((row) =>
        listExportColumns.map((c) => String(row[c.accessor] ?? '')),
      ),
    [listExportData, listExportColumns],
  )

  // Export data for the List View (item details, one row per godown entry)
  const detailExportColumns = useMemo(
    () => [
      { header: 'Voucher Date', accessor: 'voucherDate' as const },
      { header: 'Voucher No', accessor: 'voucherNo' as const },
      { header: 'Movement', accessor: 'movement' as const },
      { header: 'Stock Item', accessor: 'stockItem' as const },
      { header: 'Godown', accessor: 'godown' as const },
      { header: 'Batch No', accessor: 'batchNo' as const },
      { header: 'Actual Qty', accessor: 'actualQty' as const },
      { header: 'Rate', accessor: 'rate' as const },
      { header: 'Amount', accessor: 'amount' as const },
      { header: 'Remarks', accessor: 'remarks' as const },
    ],
    [],
  )

  const detailExportData = useMemo(() => formatItemDetailRows(data), [data])
  const detailHeaders = detailExportColumns.map((c) => c.header)
  const detailFlatRows = useMemo(
    () =>
      detailExportData.map((row) =>
        detailExportColumns.map((c) => String(row[c.accessor] ?? '')),
      ),
    [detailExportData, detailExportColumns],
  )

  const exportGroupedPdf = useCallback(
    async (
      tab: string,
      title: string,
      columnData: { header: string; accessor: string }[],
      data: any[],
      chartData?: {
        labels: string[]
        datasets: { label: string; data: number[] }[]
      },
    ) => {
      const { default: exportTableToPdf } =
        await import('@/utils/export-table-pdf')
      exportTableToPdf({
        fileName: `manufacturing-journal-report-${tab}.pdf`,
        sections: [
          {
            title,
            columnData,
            data,
            ...(chartData ? { chart: chartData } : {}),
          },
        ],
      })
    },
    [],
  )

  const exportGroupedExcel = useCallback(
    async (
      tab: string,
      title: string,
      columnData: { header: string; accessor: string }[],
      data: any[],
    ) => {
      const { default: exportTableToExcel } =
        await import('@/utils/export-table-excel')
      await exportTableToExcel({
        title,
        columnData,
        data,
        fileName: `manufacturing-journal-report-${tab}.xlsx`,
      })
    },
    [],
  )

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
    (headers: string[], flatRows: string[][], tab: string) => {
      const bom = '\uFEFF'
      const csv =
        bom +
        [headers.join(','), ...flatRows.map((r) => r.join(','))].join('\n')
      downloadBlob(
        csv,
        `manufacturing-journal-report-${tab}.csv`,
        'text/csv;charset=utf-8;',
      )
    },
    [downloadBlob],
  )

  const downloadJson = useCallback(
    (data: unknown, tab: string) => {
      downloadBlob(
        JSON.stringify(data, null, 2),
        `manufacturing-journal-report-${tab}.json`,
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

  return (
    <Main className="min-w-full">
      <div className="flex flex-row justify-between mb-4 rounded-lg border border-slate-200/70 bg-white/80 px-4 py-3 shadow-sm dark:border-white/[0.07] dark:bg-white/5">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Manufacturing Journal Report
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Consumption (OUT) vs Production (IN) across manufacturing journal
            vouchers
          </p>
        </div>
        {/* IMP: dont remove this component, it is used to set the reporting period for the report */}
        <ReportingPeriod disableHotkey />
      </div>

      <div className="mb-4 flex items-center gap-2 rounded-lg border border-slate-200/70 bg-white/80 px-3 py-2 shadow-sm dark:border-white/[0.07] dark:bg-white/5">
        <Search className="h-4 w-4 text-muted-foreground shrink-0" />
        <input
          placeholder="Search manufacturing journals..."
          defaultValue=""
          onChange={(e) => onSearchChange?.(e.target.value)}
          className="h-7 flex-1 min-w-[120px] bg-transparent text-sm outline-none placeholder:text-muted-foreground/60"
        />
        <div className="h-5 w-px bg-border mx-1" />
        <Select value={activeTab} onValueChange={setActiveTab}>
          <SelectTrigger className="h-7 w-[160px] border-0 bg-transparent shadow-none p-0 text-sm font-medium text-muted-foreground hover:text-foreground focus:ring-0">
            <SelectValue />
          </SelectTrigger>
          <SelectContent side="bottom" align="end">
            <SelectItem value="list">📋 List View</SelectItem>
            <SelectItem value="by-stock-item">📦 By Stock Item</SelectItem>
            <SelectItem value="by-godown">🏭 By Godown</SelectItem>
            <SelectItem value="by-date">📅 By Date</SelectItem>
          </SelectContent>
        </Select>

        {/* Details view export controls */}
        {activeTab === 'list' && (
          <>
            <div className="h-5 w-px bg-border mx-1" />
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => {
                  const tsv = [
                    listHeaders.join('\t'),
                    ...listFlatRows.map((r) => r.join('\t')),
                  ].join('\n')
                  copyToClipboard(tsv)
                }}
              >
                <Clipboard className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => window.print()}
              >
                <Printer className="h-3.5 w-3.5" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7">
                    <Download className="h-3.5 w-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="text-xs font-medium">
                    Summary View
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={async () => {
                      const { default: exportPdf } =
                        await import('@/utils/export-table-pdf')
                      exportPdf({
                        title: 'Manufacturing Journal Report',
                        columnData: listExportColumns as any,
                        data: listExportData,
                        fileName: 'manufacturing-journal-report.pdf',
                      })
                    }}
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    PDF
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={async () => {
                      const { default: exportExcel } =
                        await import('@/utils/export-table-excel')
                      await exportExcel({
                        title: 'Manufacturing Journal Report',
                        columnData: listExportColumns as any,
                        data: listExportData,
                        fileName: 'manufacturing-journal-report.xlsx',
                      })
                    }}
                  >
                    <FileSpreadsheet className="mr-2 h-4 w-4" />
                    Excel
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() =>
                      downloadCsv(listHeaders, listFlatRows, 'list-summary')
                    }
                  >
                    <FileSpreadsheet className="mr-2 h-4 w-4" />
                    CSV
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => downloadJson(listExportData, 'list-summary')}
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
                    onClick={async () => {
                      const { default: exportPdf } =
                        await import('@/utils/export-table-pdf')
                      exportPdf({
                        title: 'Manufacturing Journal Report — Item Details',
                        columnData: detailExportColumns as any,
                        data: detailExportData,
                        fileName:
                          'manufacturing-journal-report-item-details.pdf',
                      })
                    }}
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    PDF
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={async () => {
                      const { default: exportExcel } =
                        await import('@/utils/export-table-excel')
                      await exportExcel({
                        title: 'Manufacturing Journal Report — Item Details',
                        columnData: detailExportColumns as any,
                        data: detailExportData,
                        fileName:
                          'manufacturing-journal-report-item-details.xlsx',
                      })
                    }}
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
            </div>
          </>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsContent
          value="list"
          className="-mx-4 flex-1 overflow-auto px-4 py-1"
        >
          <GridTable
            data={(() => {
              const parsed =
                manufacturingJournalReportListSchema.safeParse(data)
              if (!parsed.success) {
                console.error(
                  '[ManufacturingJournalReport] Zod validation error:',
                  parsed.error.issues,
                )
                return data as ManufacturingJournalReportList
              }
              return parsed.data
            })()}
            columns={columns}
            paginationMeta={paginationMeta}
            onPageChange={onPageChange}
            onPageSizeChange={onPageSizeChange}
            onSortChange={onSortChange}
            sorting={sorting}
          />
        </TabsContent>

        <TabsContent value="by-stock-item">
          {stockLoading ? (
            <div className="flex items-center justify-center h-32">
              <Loader className="animate-spin h-6 w-6" />
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  <span className="font-semibold text-foreground">
                    {(stockGrouped?.data ?? []).length}
                  </span>{' '}
                  stock items
                </div>
                <ExportDropdown
                  tab="by-stock-item"
                  title="Manufacturing Journal Report — By Stock Item"
                  rawData={stockGrouped?.data ?? []}
                  columns={[
                    { header: 'Stock Item', accessor: 'stock_item_name' },
                    { header: 'Vouchers', accessor: 'voucher_count' },
                    { header: 'Consumed Qty', accessor: 'total_out_quantity' },
                    { header: 'Produced Qty', accessor: 'total_in_quantity' },
                    { header: 'Consumed Amt', accessor: 'total_out_amount' },
                    { header: 'Produced Amt', accessor: 'total_in_amount' },
                  ]}
                  formatRow={(r: any) => ({
                    stock_item_name: r.stock_item_name,
                    voucher_count: r.voucher_count,
                    total_out_quantity: formatQtyFixed(r.total_out_quantity),
                    total_in_quantity: formatQtyFixed(r.total_in_quantity),
                    total_out_amount: formatAmt(r.total_out_amount),
                    total_in_amount: formatAmt(r.total_in_amount),
                  })}
                  computeTotals={(data: any[]) => {
                    const sOutQty = data.reduce(
                      (s: number, r: any) => s + (r.total_out_quantity ?? 0),
                      0,
                    )
                    const sInQty = data.reduce(
                      (s: number, r: any) => s + (r.total_in_quantity ?? 0),
                      0,
                    )
                    const sOutAmt = data.reduce(
                      (s: number, r: any) => s + (r.total_out_amount ?? 0),
                      0,
                    )
                    const sInAmt = data.reduce(
                      (s: number, r: any) => s + (r.total_in_amount ?? 0),
                      0,
                    )
                    const sVch = data.reduce(
                      (s: number, r: any) => s + (r.voucher_count ?? 0),
                      0,
                    )
                    return {
                      stock_item_name: 'TOTAL',
                      voucher_count: sVch,
                      total_out_quantity: formatQtyFixed(sOutQty),
                      total_in_quantity: formatQtyFixed(sInQty),
                      total_out_amount: formatAmt(sOutAmt),
                      total_in_amount: formatAmt(sInAmt),
                    }
                  }}
                  onExportPdf={exportGroupedPdf}
                  onExportExcel={exportGroupedExcel}
                  onDownloadCsv={downloadCsv}
                  onDownloadJson={downloadJson}
                  onCopyToClipboard={copyToClipboard}
                  chartConfig={{
                    labelKey: 'stock_item_name',
                    valueKey: 'total_out_quantity',
                    chartLabel: 'Quantity by Stock Item',
                  }}
                />
              </div>
              {/* Chart */}
              {(stockGrouped?.data ?? []).length > 0 && (
                <div className="rounded-lg border bg-card p-4">
                  <h4 className="flex items-center gap-2 text-sm font-semibold mb-3 text-slate-700 dark:text-slate-300">
                    <BarChart3 className="h-4 w-4 text-primary" />
                    Consumed vs Produced Quantity by Stock Item
                  </h4>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart
                      data={(stockGrouped?.data ?? [])
                        .slice(0, 15)
                        .map((r: any) => ({
                          name:
                            r.stock_item_name?.length > 18
                              ? r.stock_item_name.slice(0, 16) + '…'
                              : r.stock_item_name,
                          consumed: r.total_out_quantity ?? 0,
                          produced: r.total_in_quantity ?? 0,
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
                      />
                      <Tooltip
                        contentStyle={{ fontSize: 12, borderRadius: 8 }}
                        formatter={(value, name) => [
                          `${Number(value) || 0}`,
                          name === 'consumed' ? 'Consumed' : 'Produced',
                        ]}
                        labelFormatter={(label) => `Item: ${label}`}
                      />
                      <Legend wrapperStyle={{ fontSize: 12 }} />
                      <Bar
                        dataKey="consumed"
                        name="Consumed"
                        fill="#ef4444"
                        radius={[4, 4, 0, 0]}
                        maxBarSize={40}
                      />
                      <Bar
                        dataKey="produced"
                        name="Produced"
                        fill="#10b981"
                        radius={[4, 4, 0, 0]}
                        maxBarSize={40}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
              <div className="rounded-md border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="text-left p-3 font-medium">Stock Item</th>
                      <th className="text-right p-3 font-medium">Vouchers</th>
                      <th className="text-right p-3 font-medium">
                        Consumed Qty
                      </th>
                      <th className="text-right p-3 font-medium">
                        Produced Qty
                      </th>
                      <th className="text-right p-3 font-medium">
                        Consumed Amt
                      </th>
                      <th className="text-right p-3 font-medium">
                        Produced Amt
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {(stockGrouped?.data ?? []).map((row: any, i: number) => (
                      <tr key={i} className="border-b hover:bg-muted/30">
                        <td className="p-3 font-medium">
                          {row.stock_item_name}
                        </td>
                        <td className="p-3 text-right">{row.voucher_count}</td>
                        <td className="p-3 text-right tabular-nums text-red-600 dark:text-red-400">
                          {formatQty(row.total_out_quantity)}
                        </td>
                        <td className="p-3 text-right tabular-nums text-emerald-600 dark:text-emerald-400">
                          {formatQty(row.total_in_quantity)}
                        </td>
                        <td className="p-3 text-right tabular-nums">
                          {formatAmt(row.total_out_amount)}
                        </td>
                        <td className="p-3 text-right tabular-nums font-semibold">
                          {formatAmt(row.total_in_amount)}
                        </td>
                      </tr>
                    ))}
                    {(stockGrouped?.data ?? []).length > 0 && (
                      <tr className="border-t-2 border-primary/30 bg-primary/[0.04] font-semibold">
                        <td className="p-3 text-primary">Total</td>
                        <td className="p-3 text-right">
                          {(stockGrouped?.data ?? []).reduce(
                            (s: number, r: any) => s + (r.voucher_count ?? 0),
                            0,
                          )}
                        </td>
                        <td className="p-3 text-right tabular-nums">
                          {formatQty(
                            (stockGrouped?.data ?? []).reduce(
                              (s: number, r: any) =>
                                s + (r.total_out_quantity ?? 0),
                              0,
                            ),
                          )}
                        </td>
                        <td className="p-3 text-right tabular-nums">
                          {formatQty(
                            (stockGrouped?.data ?? []).reduce(
                              (s: number, r: any) =>
                                s + (r.total_in_quantity ?? 0),
                              0,
                            ),
                          )}
                        </td>
                        <td className="p-3 text-right tabular-nums">
                          {formatAmt(
                            (stockGrouped?.data ?? []).reduce(
                              (s: number, r: any) =>
                                s + (r.total_out_amount ?? 0),
                              0,
                            ),
                          )}
                        </td>
                        <td className="p-3 text-right tabular-nums">
                          {formatAmt(
                            (stockGrouped?.data ?? []).reduce(
                              (s: number, r: any) =>
                                s + (r.total_in_amount ?? 0),
                              0,
                            ),
                          )}
                        </td>
                      </tr>
                    )}
                    {(stockGrouped?.data ?? []).length === 0 && (
                      <tr>
                        <td
                          colSpan={6}
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

        <TabsContent value="by-godown">
          {godownLoading ? (
            <div className="flex items-center justify-center h-32">
              <Loader className="animate-spin h-6 w-6" />
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  <span className="font-semibold text-foreground">
                    {(godownGrouped?.data ?? []).length}
                  </span>{' '}
                  godowns
                </div>
                <ExportDropdown
                  tab="by-godown"
                  title="Manufacturing Journal Report — By Godown"
                  rawData={godownGrouped?.data ?? []}
                  columns={[
                    { header: 'Godown', accessor: 'godown_name' },
                    { header: 'Vouchers', accessor: 'voucher_count' },
                    { header: 'Consumed Qty', accessor: 'total_out_quantity' },
                    { header: 'Produced Qty', accessor: 'total_in_quantity' },
                  ]}
                  formatRow={(r: any) => ({
                    godown_name: r.godown_name,
                    voucher_count: r.voucher_count,
                    total_out_quantity: formatQtyFixed(r.total_out_quantity),
                    total_in_quantity: formatQtyFixed(r.total_in_quantity),
                  })}
                  computeTotals={(data: any[]) => {
                    const sOutQty = data.reduce(
                      (s: number, r: any) => s + (r.total_out_quantity ?? 0),
                      0,
                    )
                    const sInQty = data.reduce(
                      (s: number, r: any) => s + (r.total_in_quantity ?? 0),
                      0,
                    )
                    const sVch = data.reduce(
                      (s: number, r: any) => s + (r.voucher_count ?? 0),
                      0,
                    )
                    return {
                      godown_name: 'TOTAL',
                      voucher_count: sVch,
                      total_out_quantity: formatQtyFixed(sOutQty),
                      total_in_quantity: formatQtyFixed(sInQty),
                    }
                  }}
                  onExportPdf={exportGroupedPdf}
                  onExportExcel={exportGroupedExcel}
                  onDownloadCsv={downloadCsv}
                  onDownloadJson={downloadJson}
                  onCopyToClipboard={copyToClipboard}
                  chartConfig={{
                    labelKey: 'godown_name',
                    valueKey: 'total_out_quantity',
                    chartLabel: 'Quantity by Godown',
                  }}
                />
              </div>
              {/* Chart */}
              {(godownGrouped?.data ?? []).length > 0 && (
                <div className="rounded-lg border bg-card p-4">
                  <h4 className="flex items-center gap-2 text-sm font-semibold mb-3 text-slate-700 dark:text-slate-300">
                    <BarChart3 className="h-4 w-4 text-primary" />
                    Consumed vs Produced Quantity by Godown
                  </h4>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart
                      data={(godownGrouped?.data ?? [])
                        .slice(0, 15)
                        .map((r: any) => ({
                          name:
                            r.godown_name?.length > 18
                              ? r.godown_name.slice(0, 16) + '…'
                              : r.godown_name,
                          consumed: r.total_out_quantity ?? 0,
                          produced: r.total_in_quantity ?? 0,
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
                      />
                      <Tooltip
                        contentStyle={{ fontSize: 12, borderRadius: 8 }}
                        formatter={(value, name) => [
                          `${Number(value) || 0}`,
                          name === 'consumed' ? 'Consumed' : 'Produced',
                        ]}
                        labelFormatter={(label) => `Godown: ${label}`}
                      />
                      <Legend wrapperStyle={{ fontSize: 12 }} />
                      <Bar
                        dataKey="consumed"
                        name="Consumed"
                        fill="#ef4444"
                        radius={[4, 4, 0, 0]}
                        maxBarSize={40}
                      />
                      <Bar
                        dataKey="produced"
                        name="Produced"
                        fill="#10b981"
                        radius={[4, 4, 0, 0]}
                        maxBarSize={40}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
              <div className="rounded-md border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="text-left p-3 font-medium">Godown</th>
                      <th className="text-right p-3 font-medium">Vouchers</th>
                      <th className="text-right p-3 font-medium">
                        Consumed Qty
                      </th>
                      <th className="text-right p-3 font-medium">
                        Produced Qty
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {(godownGrouped?.data ?? []).map((row: any, i: number) => (
                      <tr key={i} className="border-b hover:bg-muted/30">
                        <td className="p-3 font-medium">{row.godown_name}</td>
                        <td className="p-3 text-right">{row.voucher_count}</td>
                        <td className="p-3 text-right tabular-nums text-red-600 dark:text-red-400">
                          {formatQty(row.total_out_quantity)}
                        </td>
                        <td className="p-3 text-right tabular-nums text-emerald-600 dark:text-emerald-400">
                          {formatQty(row.total_in_quantity)}
                        </td>
                      </tr>
                    ))}
                    {(godownGrouped?.data ?? []).length > 0 && (
                      <tr className="border-t-2 border-primary/30 bg-primary/[0.04] font-semibold">
                        <td className="p-3 text-primary">Total</td>
                        <td className="p-3 text-right">
                          {(godownGrouped?.data ?? []).reduce(
                            (s: number, r: any) => s + (r.voucher_count ?? 0),
                            0,
                          )}
                        </td>
                        <td className="p-3 text-right tabular-nums">
                          {formatQty(
                            (godownGrouped?.data ?? []).reduce(
                              (s: number, r: any) =>
                                s + (r.total_out_quantity ?? 0),
                              0,
                            ),
                          )}
                        </td>
                        <td className="p-3 text-right tabular-nums">
                          {formatQty(
                            (godownGrouped?.data ?? []).reduce(
                              (s: number, r: any) =>
                                s + (r.total_in_quantity ?? 0),
                              0,
                            ),
                          )}
                        </td>
                      </tr>
                    )}
                    {(godownGrouped?.data ?? []).length === 0 && (
                      <tr>
                        <td
                          colSpan={4}
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

        <TabsContent value="by-date">
          {dateLoading ? (
            <div className="flex items-center justify-center h-32">
              <Loader className="animate-spin h-6 w-6" />
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  <span className="font-semibold text-foreground">
                    {(dateGrouped?.data ?? []).length}
                  </span>{' '}
                  dates
                </div>
                <ExportDropdown
                  tab="by-date"
                  title="Manufacturing Journal Report — By Date"
                  rawData={dateGrouped?.data ?? []}
                  columns={[
                    { header: 'Date', accessor: 'voucher_date' },
                    { header: 'Vouchers', accessor: 'voucher_count' },
                    { header: 'Consumed Qty', accessor: 'total_out_quantity' },
                    { header: 'Produced Qty', accessor: 'total_in_quantity' },
                    { header: 'Consumed Amt', accessor: 'total_out_amount' },
                    { header: 'Produced Amt', accessor: 'total_in_amount' },
                  ]}
                  formatRow={(r: any) => ({
                    voucher_date: r.voucher_date
                      ? formatDate(r.voucher_date)
                      : '',
                    voucher_count: r.voucher_count,
                    total_out_quantity: formatQtyFixed(r.total_out_quantity),
                    total_in_quantity: formatQtyFixed(r.total_in_quantity),
                    total_out_amount: formatAmt(r.total_out_amount),
                    total_in_amount: formatAmt(r.total_in_amount),
                  })}
                  computeTotals={(data: any[]) => {
                    const sOutQty = data.reduce(
                      (s: number, r: any) => s + (r.total_out_quantity ?? 0),
                      0,
                    )
                    const sInQty = data.reduce(
                      (s: number, r: any) => s + (r.total_in_quantity ?? 0),
                      0,
                    )
                    const sOutAmt = data.reduce(
                      (s: number, r: any) => s + (r.total_out_amount ?? 0),
                      0,
                    )
                    const sInAmt = data.reduce(
                      (s: number, r: any) => s + (r.total_in_amount ?? 0),
                      0,
                    )
                    const sVch = data.reduce(
                      (s: number, r: any) => s + (r.voucher_count ?? 0),
                      0,
                    )
                    return {
                      voucher_date: 'TOTAL',
                      voucher_count: sVch,
                      total_out_quantity: formatQtyFixed(sOutQty),
                      total_in_quantity: formatQtyFixed(sInQty),
                      total_out_amount: formatAmt(sOutAmt),
                      total_in_amount: formatAmt(sInAmt),
                    }
                  }}
                  onExportPdf={exportGroupedPdf}
                  onExportExcel={exportGroupedExcel}
                  onDownloadCsv={downloadCsv}
                  onDownloadJson={downloadJson}
                  onCopyToClipboard={copyToClipboard}
                  chartConfig={{
                    labelKey: 'voucher_date',
                    valueKey: 'total_out_quantity',
                    chartLabel: 'Quantity by Date',
                    formatLabel: formatDate,
                  }}
                />
              </div>
              {/* Chart */}
              {(dateGrouped?.data ?? []).length > 0 && (
                <div className="rounded-lg border bg-card p-4">
                  <h4 className="flex items-center gap-2 text-sm font-semibold mb-3 text-slate-700 dark:text-slate-300">
                    <BarChart3 className="h-4 w-4 text-primary" />
                    Consumed vs Produced Quantity by Date
                  </h4>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart
                      data={(dateGrouped?.data ?? [])
                        .slice(0, 20)
                        .map((r: any) => ({
                          name: r.voucher_date
                            ? formatDate(r.voucher_date)
                            : '',
                          consumed: r.total_out_quantity ?? 0,
                          produced: r.total_in_quantity ?? 0,
                        }))}
                    >
                      <XAxis
                        dataKey="name"
                        stroke="#888888"
                        fontSize={10}
                        tickLine={false}
                        axisLine={false}
                        interval={0}
                        angle={-30}
                        textAnchor="end"
                        height={70}
                      />
                      <YAxis
                        stroke="#888888"
                        fontSize={11}
                        tickLine={false}
                        axisLine={false}
                      />
                      <Tooltip
                        contentStyle={{ fontSize: 12, borderRadius: 8 }}
                        formatter={(value, name) => [
                          `${Number(value) || 0}`,
                          name === 'consumed' ? 'Consumed' : 'Produced',
                        ]}
                        labelFormatter={(label) => `Date: ${label}`}
                      />
                      <Legend wrapperStyle={{ fontSize: 12 }} />
                      <Bar
                        dataKey="consumed"
                        name="Consumed"
                        fill="#ef4444"
                        radius={[4, 4, 0, 0]}
                        maxBarSize={24}
                      />
                      <Bar
                        dataKey="produced"
                        name="Produced"
                        fill="#10b981"
                        radius={[4, 4, 0, 0]}
                        maxBarSize={24}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
              <div className="rounded-md border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="text-left p-3 font-medium">Date</th>
                      <th className="text-right p-3 font-medium">Vouchers</th>
                      <th className="text-right p-3 font-medium">
                        Consumed Qty
                      </th>
                      <th className="text-right p-3 font-medium">
                        Produced Qty
                      </th>
                      <th className="text-right p-3 font-medium">
                        Consumed Amt
                      </th>
                      <th className="text-right p-3 font-medium">
                        Produced Amt
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {(dateGrouped?.data ?? []).map((row: any, i: number) => (
                      <tr key={i} className="border-b hover:bg-muted/30">
                        <td className="p-3 font-medium">
                          {row.voucher_date
                            ? formatDate(row.voucher_date)
                            : '—'}
                        </td>
                        <td className="p-3 text-right">{row.voucher_count}</td>
                        <td className="p-3 text-right tabular-nums text-red-600 dark:text-red-400">
                          {formatQty(row.total_out_quantity)}
                        </td>
                        <td className="p-3 text-right tabular-nums text-emerald-600 dark:text-emerald-400">
                          {formatQty(row.total_in_quantity)}
                        </td>
                        <td className="p-3 text-right tabular-nums">
                          {formatAmt(row.total_out_amount)}
                        </td>
                        <td className="p-3 text-right tabular-nums font-semibold">
                          {formatAmt(row.total_in_amount)}
                        </td>
                      </tr>
                    ))}
                    {(dateGrouped?.data ?? []).length > 0 && (
                      <tr className="border-t-2 border-primary/30 bg-primary/[0.04] font-semibold">
                        <td className="p-3 text-primary">Total</td>
                        <td className="p-3 text-right">
                          {(dateGrouped?.data ?? []).reduce(
                            (s: number, r: any) => s + (r.voucher_count ?? 0),
                            0,
                          )}
                        </td>
                        <td className="p-3 text-right tabular-nums">
                          {formatQty(
                            (dateGrouped?.data ?? []).reduce(
                              (s: number, r: any) =>
                                s + (r.total_out_quantity ?? 0),
                              0,
                            ),
                          )}
                        </td>
                        <td className="p-3 text-right tabular-nums">
                          {formatQty(
                            (dateGrouped?.data ?? []).reduce(
                              (s: number, r: any) =>
                                s + (r.total_in_quantity ?? 0),
                              0,
                            ),
                          )}
                        </td>
                        <td className="p-3 text-right tabular-nums">
                          {formatAmt(
                            (dateGrouped?.data ?? []).reduce(
                              (s: number, r: any) =>
                                s + (r.total_out_amount ?? 0),
                              0,
                            ),
                          )}
                        </td>
                        <td className="p-3 text-right tabular-nums">
                          {formatAmt(
                            (dateGrouped?.data ?? []).reduce(
                              (s: number, r: any) =>
                                s + (r.total_in_amount ?? 0),
                              0,
                            ),
                          )}
                        </td>
                      </tr>
                    )}
                    {(dateGrouped?.data ?? []).length === 0 && (
                      <tr>
                        <td
                          colSpan={6}
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

      {/* Legend */}
      <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <ArrowUpCircle className="h-3.5 w-3.5 text-red-500" /> OUT — Consumed
          (raw material issued)
        </span>
        <span className="flex items-center gap-1.5">
          <ArrowDownCircle className="h-3.5 w-3.5 text-emerald-500" /> IN —
          Produced (finished goods received)
        </span>
      </div>
    </Main>
  )
}
