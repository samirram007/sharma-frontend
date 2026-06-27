import { Main } from '@/layouts/components/main'
import { Tabs, TabsContent } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { columns } from './components/columns'
import { GridTable } from './components/grid-table'
import { ExportDropdown } from '@/components/export-dropdown'
import { receiptNoteReportListSchema, type ReceiptNoteReportList } from './data/schema'
import type { PaginationMeta } from './data/schema'
// AlertTriangle is used in the route file, not here
import { useQuery } from '@tanstack/react-query'
import { groupedByLedgerQueryOptions, groupedByStockItemQueryOptions, groupedByGodownQueryOptions, groupedByDateQueryOptions } from './data/queryOptions'
import { Loader, Search, BarChart3, Download, FileSpreadsheet, FileText, FileJson, Clipboard, Printer } from 'lucide-react'
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
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
import { toNum, formatFixed } from '@/utils/format-num'
import ReportingPeriod from '@/features/global/components/reporting-period'


interface ReceiptNoteReportProps {
  data: ReceiptNoteReportList
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
    const stockItemsSummary = entries
      .filter(Boolean)
      .map((entry: any) => {
        const godownEntries = entry.stockJournalGodownEntries?.filter(Boolean) ?? []
        const batches = godownEntries
          .map((ge: any) => `Godown: ${ge.godown?.name ?? '-'}, Batch: ${ge.batchNo ?? '-'}, Qty: ${ge.actualQuantity ?? 0}`)
          .join('; ')
        return `${entry.stockItem?.name ?? entry.stockItemId ?? '-'} (Qty: ${entry.actualQuantity ?? 0}, Rate: ${entry.rate ?? 0})${batches ? ' [' + batches + ']' : ''}`
      })
      .join(' | ')

    const dd = row.voucherDispatchDetail

    return {
      voucherDate: row.voucherDate ? fmtDate(row.voucherDate) : '',
      voucherNo: row.voucherNo ?? '',
      partyLedger: row.partyLedger?.name ?? '',
      stockItems: stockItemsSummary || 'No items',
      dispatchInfo: dd
        ? `Billing: ${dd.billingPreference ?? '-'} | Carrier: ${dd.carrierName ?? '-'} | Vehicle: ${dd.motorVehicleNo ?? '-'} | Destination: ${dd.destination ?? '-'}`
        : 'No dispatch details',
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
      // Voucher with no items — still include a row
      rows.push({
        voucherDate: row.voucherDate ? fmtDate(row.voucherDate) : '',
        voucherNo: row.voucherNo ?? '',
        partyLedger: row.partyLedger?.name ?? '',
        stockItem: '',
        godown: '',
        batchNo: '',
        mfgDate: '',
        expiryDate: '',
        actualQty: '',
        billingQty: '',
        rate: '',
        amount: formatFixed(row.amount),
        remarks: row.remarks ?? '',
      })
      continue
    }
    for (const entry of validEntries) {
      const godownEntries = entry.stockJournalGodownEntries?.filter(Boolean) ?? []
      if (godownEntries.length === 0) {
        // Item entry with no godown batches
        rows.push({
          voucherDate: row.voucherDate ? fmtDate(row.voucherDate) : '',
          voucherNo: row.voucherNo ?? '',
          partyLedger: row.partyLedger?.name ?? '',
          stockItem: entry.stockItem?.name ?? `Item #${entry.stockItemId}`,
          godown: '',
          batchNo: '',
          mfgDate: '',
          expiryDate: '',
          actualQty: formatFixed(entry.actualQuantity),
          billingQty: formatFixed(entry.billingQuantity),
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
          partyLedger: row.partyLedger?.name ?? '',
          stockItem: entry.stockItem?.name ?? `Item #${entry.stockItemId}`,
          godown: ge.godown?.name ?? '',
          batchNo: ge.batchNo ?? '',
          mfgDate: ge.mfgDate ? fmtDate(ge.mfgDate) : '',
          expiryDate: ge.expiryDate ? fmtDate(ge.expiryDate) : '',
          actualQty: formatFixed(ge.actualQuantity),
          billingQty: formatFixed(ge.billingQuantity),
          rate: formatFixed(ge.rate),
          amount: formatFixed(ge.amount),
          remarks: row.remarks ?? '',
        })
      }
    }
  }
  return rows
}

export default function ReceiptNoteReport({
  data,
  paginationMeta,
  onPageChange,
  onPageSizeChange,
  onSearchChange,
  onSortChange,
  sorting,
}: ReceiptNoteReportProps) {
  const [activeTab, setActiveTab] = useState('list')

  const { data: ledgerGrouped, isLoading: ledgerLoading } = useQuery({ ...groupedByLedgerQueryOptions(), enabled: activeTab === 'by-ledger' })
  const { data: stockGrouped, isLoading: stockLoading } = useQuery({ ...groupedByStockItemQueryOptions(), enabled: activeTab === 'by-stock-item' })
  const { data: godownGrouped, isLoading: godownLoading } = useQuery({ ...groupedByGodownQueryOptions(), enabled: activeTab === 'by-godown' })
  const { data: dateGrouped, isLoading: dateLoading } = useQuery({ ...groupedByDateQueryOptions(), enabled: activeTab === 'by-date' })

  const formatAmt = (val: unknown) => {
    const num = toNum(val)
    return num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }
  const formatDate = (value: string | Date) => {
    const date = new Date(value)
    return isNaN(date.getTime()) ? String(value) : date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
  }

  // Export data for the List View (summary per voucher)
  const listExportColumns = useMemo(() => [
    { header: 'Voucher Date', accessor: 'voucherDate' as const },
    { header: 'Voucher No', accessor: 'voucherNo' as const },
    { header: 'Party Ledger', accessor: 'partyLedger' as const },
    { header: 'Stock Items', accessor: 'stockItems' as const },
    { header: 'Dispatch Info', accessor: 'dispatchInfo' as const },
    { header: 'Remarks', accessor: 'remarks' as const },
    { header: 'Amount', accessor: 'amount' as const },
  ], [])

  const listExportData = useMemo(() => formatExportRows(data), [data])
  const listHeaders = listExportColumns.map((c) => c.header)
  const listFlatRows = useMemo(
    () => listExportData.map((row) => listExportColumns.map((c) => String(row[c.accessor] ?? ''))),
    [listExportData, listExportColumns]
  )

  // Export data for the List View (item details, one row per godown entry)
  const detailExportColumns = useMemo(() => [
    { header: 'Voucher Date', accessor: 'voucherDate' as const },
    { header: 'Voucher No', accessor: 'voucherNo' as const },
    { header: 'Party Ledger', accessor: 'partyLedger' as const },
    { header: 'Stock Item', accessor: 'stockItem' as const },
    { header: 'Godown', accessor: 'godown' as const },
    { header: 'Batch No', accessor: 'batchNo' as const },
    { header: 'Mfg Date', accessor: 'mfgDate' as const },
    { header: 'Expiry Date', accessor: 'expiryDate' as const },
    { header: 'Actual Qty', accessor: 'actualQty' as const },
    { header: 'Billing Qty', accessor: 'billingQty' as const },
    { header: 'Rate', accessor: 'rate' as const },
    { header: 'Amount', accessor: 'amount' as const },
    { header: 'Remarks', accessor: 'remarks' as const },
  ], [])

  const detailExportData = useMemo(() => formatItemDetailRows(data), [data])
  const detailHeaders = detailExportColumns.map((c) => c.header)
  const detailFlatRows = useMemo(
    () => detailExportData.map((row) => detailExportColumns.map((c) => String(row[c.accessor] ?? ''))),
    [detailExportData, detailExportColumns]
  )

  const exportGroupedPdf = useCallback(async (tab: string, title: string, columnData: { header: string; accessor: string }[], data: any[], chartData?: { labels: string[]; datasets: { label: string; data: number[] }[] }) => {
    const { default: exportTableToPdf } = await import('@/utils/export-table-pdf')
    exportTableToPdf({
      fileName: `receipt-note-report-${tab}.pdf`,
      sections: [{
        title,
        columnData,
        data,
        ...(chartData ? { chart: chartData } : {}),
      }],
    })
  }, [])

  const exportGroupedExcel = useCallback(async (tab: string, title: string, columnData: { header: string; accessor: string }[], data: any[]) => {
    const { default: exportTableToExcel } = await import('@/utils/export-table-excel')
    await exportTableToExcel({
      title,
      columnData,
      data,
      fileName: `receipt-note-report-${tab}.xlsx`,
    })
  }, [])

  const downloadBlob = useCallback((content: string, fileName: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = fileName
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, [])

  const downloadCsv = useCallback((headers: string[], flatRows: string[][], tab: string) => {
    const bom = '\uFEFF'
    const csv = bom + [headers.join(','), ...flatRows.map((r) => r.join(','))].join('\n')
    downloadBlob(csv, `receipt-note-report-${tab}.csv`, 'text/csv;charset=utf-8;')
  }, [downloadBlob])

  const downloadJson = useCallback((data: unknown, tab: string) => {
    downloadBlob(JSON.stringify(data, null, 2), `receipt-note-report-${tab}.json`, 'application/json')
  }, [downloadBlob])

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
    <Main className='min-w-full'>
      <div className='flex flex-row justify-between mb-4 rounded-lg border border-slate-200/70 bg-white/80 px-4 py-3 shadow-sm dark:border-white/[0.07] dark:bg-white/5'>
      <div>

        <h2 className='text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100'>Receipt Note Report</h2>
        <p className='text-sm text-slate-600 dark:text-slate-400'>
          View, filter, and analyze receipt note vouchers
        </p>
      </div>
      {/* IMP: dont remove this component, it is used to set the reporting period for the report */}
      <ReportingPeriod disableHotkey />
      </div>

      <div className='mb-4 flex items-center gap-2 rounded-lg border border-slate-200/70 bg-white/80 px-3 py-2 shadow-sm dark:border-white/[0.07] dark:bg-white/5'>
        <Search className='h-4 w-4 text-muted-foreground shrink-0' />
        <input
          placeholder='Search receipt notes...'
          defaultValue=''
          onChange={(e) => onSearchChange?.(e.target.value)}
          className='h-7 flex-1 min-w-[120px] bg-transparent text-sm outline-none placeholder:text-muted-foreground/60'
        />
        <div className='h-5 w-px bg-border mx-1' />
        <Select value={activeTab} onValueChange={setActiveTab}>
          <SelectTrigger className='h-7 w-[160px] border-0 bg-transparent shadow-none p-0 text-sm font-medium text-muted-foreground hover:text-foreground focus:ring-0'>
            <SelectValue />
          </SelectTrigger>
          <SelectContent side='bottom' align='end'>
            <SelectItem value='list'>📋 List View</SelectItem>
            <SelectItem value='by-ledger'>📒 By Ledger</SelectItem>
            <SelectItem value='by-stock-item'>📦 By Stock Item</SelectItem>
            <SelectItem value='by-godown'>🏭 By Godown</SelectItem>
            <SelectItem value='by-date'>📅 By Date</SelectItem>
          </SelectContent>
        </Select>

        {/* Details view export controls */}
        {activeTab === 'list' && (
          <>
            <div className='h-5 w-px bg-border mx-1' />
            <div className='flex items-center gap-1'>
              <Button
                variant='ghost'
                size='icon'
                className='h-7 w-7'
                onClick={() => {
                  const tsv = [listHeaders.join('\t'), ...listFlatRows.map((r) => r.join('\t'))].join('\n')
                  copyToClipboard(tsv)
                }}
              >
                <Clipboard className='h-3.5 w-3.5' />
              </Button>
              <Button
                variant='ghost'
                size='icon'
                className='h-7 w-7'
                onClick={() => window.print()}
              >
                <Printer className='h-3.5 w-3.5' />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant='ghost' size='icon' className='h-7 w-7'>
                    <Download className='h-3.5 w-3.5' />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align='end' className='w-56'>
                  <DropdownMenuLabel className='text-xs font-medium'>Summary View</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={async () => {
                    const { default: exportPdf } = await import('@/utils/export-table-pdf')
                    exportPdf({ title: 'Receipt Note Report', columnData: listExportColumns as any, data: listExportData, fileName: 'receipt-note-report.pdf' })
                  }}>
                    <FileText className='mr-2 h-4 w-4' />
                    PDF
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={async () => {
                    const { default: exportExcel } = await import('@/utils/export-table-excel')
                    await exportExcel({ title: 'Receipt Note Report', columnData: listExportColumns as any, data: listExportData, fileName: 'receipt-note-report.xlsx' })
                  }}>
                    <FileSpreadsheet className='mr-2 h-4 w-4' />
                    Excel
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => downloadCsv(listHeaders, listFlatRows, 'list-summary')}>
                    <FileSpreadsheet className='mr-2 h-4 w-4' />
                    CSV
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => downloadJson(listExportData, 'list-summary')}>
                    <FileJson className='mr-2 h-4 w-4' />
                    JSON
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />
                  <DropdownMenuLabel className='text-xs font-medium'>Item Details View</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={async () => {
                    const { default: exportPdf } = await import('@/utils/export-table-pdf')
                    exportPdf({ title: 'Receipt Note Report — Item Details', columnData: detailExportColumns as any, data: detailExportData, fileName: 'receipt-note-report-item-details.pdf' })
                  }}>
                    <FileText className='mr-2 h-4 w-4' />
                    PDF
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={async () => {
                    const { default: exportExcel } = await import('@/utils/export-table-excel')
                    await exportExcel({ title: 'Receipt Note Report — Item Details', columnData: detailExportColumns as any, data: detailExportData, fileName: 'receipt-note-report-item-details.xlsx' })
                  }}>
                    <FileSpreadsheet className='mr-2 h-4 w-4' />
                    Excel
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => downloadCsv(detailHeaders, detailFlatRows, 'item-details')}>
                    <FileSpreadsheet className='mr-2 h-4 w-4' />
                    CSV
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => downloadJson(detailExportData, 'item-details')}>
                    <FileJson className='mr-2 h-4 w-4' />
                    JSON
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className='w-full'>

        <TabsContent value='list' className='-mx-4 flex-1 overflow-auto px-4 py-1'>
          <GridTable
data={(() => {
                const parsed = receiptNoteReportListSchema.safeParse(data)
                if (!parsed.success) {
                  console.error('[ReceiptNoteReport] Zod validation error:', parsed.error.issues)
                  return data as ReceiptNoteReportList
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

        <TabsContent value='by-ledger'>
          {ledgerLoading ? (
            <div className='flex items-center justify-center h-32'><Loader className='animate-spin h-6 w-6' /></div>
          ) : (
            <div className='space-y-3'>
              <div className='flex items-center justify-between'>
                <div className='text-sm text-muted-foreground'>
                  <span className='font-semibold text-foreground'>{(ledgerGrouped?.data ?? []).length}</span> ledgers
                </div>
                <ExportDropdown
                  tab='by-ledger'
                  title='Receipt Note Report — By Ledger'
                  rawData={ledgerGrouped?.data ?? []}
                  columns={[
                    { header: 'Ledger', accessor: 'ledger_name' },
                    { header: 'Vouchers', accessor: 'voucher_count' },
                    { header: 'Total Debit', accessor: 'total_debit' },
                    { header: 'Total Credit', accessor: 'total_credit' },
                    { header: 'Total Amount', accessor: 'total_amount' },
                  ]}
                  formatRow={(r: any) => ({
                    ledger_name: r.ledger_name,
                    voucher_count: r.voucher_count,
                    total_debit: formatAmt(r.total_debit),
                    total_credit: formatAmt(r.total_credit),
                    total_amount: formatAmt(r.total_amount),
                  })}
                  computeTotals={(data: any[]) => {
                    const sDebit = data.reduce((s: number, r: any) => s + (r.total_debit ?? 0), 0)
                    const sCredit = data.reduce((s: number, r: any) => s + (r.total_credit ?? 0), 0)
                    const sAmount = data.reduce((s: number, r: any) => s + (r.total_amount ?? 0), 0)
                    const sVch = data.reduce((s: number, r: any) => s + (r.voucher_count ?? 0), 0)
                    return { ledger_name: 'TOTAL', voucher_count: sVch, total_debit: formatAmt(sDebit), total_credit: formatAmt(sCredit), total_amount: formatAmt(sAmount) }
                  }}
                  onExportPdf={exportGroupedPdf}
                  onExportExcel={exportGroupedExcel}
                  onDownloadCsv={downloadCsv}
                  onDownloadJson={downloadJson}
                  onCopyToClipboard={copyToClipboard}
                  chartConfig={{
                    labelKey: 'ledger_name',
                    valueKey: 'total_amount',
                    chartLabel: 'Total Amount by Ledger',
                  }}
                />
              </div>
              {/* Chart */}
              {(ledgerGrouped?.data ?? []).length > 0 && (
                <div className='rounded-lg border bg-card p-4'>
                  <h4 className='flex items-center gap-2 text-sm font-semibold mb-3 text-slate-700 dark:text-slate-300'>
                    <BarChart3 className='h-4 w-4 text-primary' />
                    Total Amount by Ledger
                  </h4>
                  <ResponsiveContainer width='100%' height={220}>
                    <BarChart data={(ledgerGrouped?.data ?? []).slice(0, 15).map((r: any) => ({ name: r.ledger_name?.length > 18 ? r.ledger_name.slice(0, 16) + '…' : r.ledger_name, amount: r.total_amount ?? 0 }))}>
                      <XAxis dataKey='name' stroke='#888888' fontSize={11} tickLine={false} axisLine={false} interval={0} angle={-20} textAnchor='end' height={60} />
                      <YAxis stroke='#888888' fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v: number) => v >= 100000 ? `${(v / 100000).toFixed(1)}L` : v >= 1000 ? `${(v / 1000).toFixed(1)}K` : String(v)} />
                      <Tooltip
                        contentStyle={{ fontSize: 12, borderRadius: 8 }}
                        formatter={(value) => [formatAmt(Number(value) || 0), 'Total Amount']}
                        labelFormatter={(label) => `Ledger: ${label}`}
                      />
                      <Bar dataKey='amount' fill='hsl(221.2 83.2% 53.3%)' radius={[4, 4, 0, 0]} maxBarSize={60} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
              <div className='rounded-md border'>
              <table className='w-full text-sm'>
                <thead>
                  <tr className='border-b bg-muted/50'>
                    <th className='text-left p-3 font-medium'>Ledger</th>
                    <th className='text-right p-3 font-medium'>Vouchers</th>
                    <th className='text-right p-3 font-medium'>Total Debit</th>
                    <th className='text-right p-3 font-medium'>Total Credit</th>
                    <th className='text-right p-3 font-medium'>Total Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {(ledgerGrouped?.data ?? []).map((row: any, i: number) => (
                    <tr key={i} className='border-b hover:bg-muted/30'>
                      <td className='p-3 font-medium'>{row.ledger_name}</td>
                      <td className='p-3 text-right'>{row.voucher_count}</td>
                      <td className='p-3 text-right tabular-nums'>{formatAmt(row.total_debit)}</td>
                      <td className='p-3 text-right tabular-nums'>{formatAmt(row.total_credit)}</td>
                      <td className='p-3 text-right tabular-nums font-semibold'>{formatAmt(row.total_amount)}</td>
                    </tr>
                  ))}
                  {(ledgerGrouped?.data ?? []).length > 0 && (
                    <tr className='border-t-2 border-primary/30 bg-primary/[0.04] font-semibold'>
                      <td className='p-3 text-primary'>Total</td>
                      <td className='p-3 text-right'>{(ledgerGrouped?.data ?? []).reduce((s: number, r: any) => s + (r.voucher_count ?? 0), 0)}</td>
                      <td className='p-3 text-right tabular-nums'>{formatAmt((ledgerGrouped?.data ?? []).reduce((s: number, r: any) => s + (r.total_debit ?? 0), 0))}</td>
                      <td className='p-3 text-right tabular-nums'>{formatAmt((ledgerGrouped?.data ?? []).reduce((s: number, r: any) => s + (r.total_credit ?? 0), 0))}</td>
                      <td className='p-3 text-right tabular-nums'>{formatAmt((ledgerGrouped?.data ?? []).reduce((s: number, r: any) => s + (r.total_amount ?? 0), 0))}</td>
                    </tr>
                  )}
                  {(ledgerGrouped?.data ?? []).length === 0 && (
                    <tr><td colSpan={5} className='p-6 text-center text-muted-foreground'>No data found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value='by-stock-item'>
          {stockLoading ? (
            <div className='flex items-center justify-center h-32'><Loader className='animate-spin h-6 w-6' /></div>
          ) : (
            <div className='space-y-3'>
              <div className='flex items-center justify-between'>
                <div className='text-sm text-muted-foreground'>
                  <span className='font-semibold text-foreground'>{(stockGrouped?.data ?? []).length}</span> stock items
                </div>
                <ExportDropdown
                  tab='by-stock-item'
                  title='Receipt Note Report — By Stock Item'
                  rawData={stockGrouped?.data ?? []}
                  columns={[
                    { header: 'Stock Item', accessor: 'stock_item_name' },
                    { header: 'Vouchers', accessor: 'voucher_count' },
                    { header: 'Total Qty', accessor: 'total_quantity' },
                    { header: 'Total Amount', accessor: 'total_amount' },
                  ]}
                  formatRow={(r: any) => ({
                    stock_item_name: r.stock_item_name,
                    voucher_count: r.voucher_count,
                    total_quantity: toNum(r.total_quantity).toFixed(2),
                    total_amount: formatAmt(r.total_amount),
                  })}
                  computeTotals={(data: any[]) => {
                    const sQty = data.reduce((s: number, r: any) => s + (r.total_quantity ?? 0), 0)
                    const sAmt = data.reduce((s: number, r: any) => s + (r.total_amount ?? 0), 0)
                    const sVch = data.reduce((s: number, r: any) => s + (r.voucher_count ?? 0), 0)
                    return { stock_item_name: 'TOTAL', voucher_count: sVch, total_quantity: toNum(sQty).toFixed(2), total_amount: formatAmt(sAmt) }
                  }}
                  onExportPdf={exportGroupedPdf}
                  onExportExcel={exportGroupedExcel}
                  onDownloadCsv={downloadCsv}
                  onDownloadJson={downloadJson}
                  onCopyToClipboard={copyToClipboard}
                  chartConfig={{
                    labelKey: 'stock_item_name',
                    valueKey: 'total_amount',
                    chartLabel: 'Total Amount by Stock Item',
                  }}
                />
              </div>
              {/* Chart */}
              {(stockGrouped?.data ?? []).length > 0 && (
                <div className='rounded-lg border bg-card p-4'>
                  <h4 className='flex items-center gap-2 text-sm font-semibold mb-3 text-slate-700 dark:text-slate-300'>
                    <BarChart3 className='h-4 w-4 text-primary' />
                    Total Amount by Stock Item
                  </h4>
                  <ResponsiveContainer width='100%' height={220}>
                    <BarChart data={(stockGrouped?.data ?? []).slice(0, 15).map((r: any) => ({ name: r.stock_item_name?.length > 18 ? r.stock_item_name.slice(0, 16) + '…' : r.stock_item_name, amount: r.total_amount ?? 0 }))}>
                      <XAxis dataKey='name' stroke='#888888' fontSize={11} tickLine={false} axisLine={false} interval={0} angle={-20} textAnchor='end' height={60} />
                      <YAxis stroke='#888888' fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v: number) => v >= 100000 ? `${(v / 100000).toFixed(1)}L` : v >= 1000 ? `${(v / 1000).toFixed(1)}K` : String(v)} />
                      <Tooltip
                        contentStyle={{ fontSize: 12, borderRadius: 8 }}
                        formatter={(value) => [formatAmt(Number(value) || 0), 'Total Amount']}
                        labelFormatter={(label) => `Item: ${label}`}
                      />
                      <Bar dataKey='amount' fill='#10b981' radius={[4, 4, 0, 0]} maxBarSize={60} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
              <div className='rounded-md border'>
              <table className='w-full text-sm'>
                <thead>
                  <tr className='border-b bg-muted/50'>
                    <th className='text-left p-3 font-medium'>Stock Item</th>
                    <th className='text-right p-3 font-medium'>Vouchers</th>
                    <th className='text-right p-3 font-medium'>Total Qty</th>
                    <th className='text-right p-3 font-medium'>Total Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {(stockGrouped?.data ?? []).map((row: any, i: number) => (
                    <tr key={i} className='border-b hover:bg-muted/30'>
                      <td className='p-3 font-medium'>{row.stock_item_name}</td>
                      <td className='p-3 text-right'>{row.voucher_count}</td>
                      <td className='p-3 text-right tabular-nums'>{toNum(row.total_quantity).toFixed(2)}</td>
                      <td className='p-3 text-right tabular-nums font-semibold'>{formatAmt(row.total_amount)}</td>
                    </tr>
                  ))}
                  {(stockGrouped?.data ?? []).length > 0 && (
                    <tr className='border-t-2 border-primary/30 bg-primary/[0.04] font-semibold'>
                      <td className='p-3 text-primary'>Total</td>
                      <td className='p-3 text-right'>{(stockGrouped?.data ?? []).reduce((s: number, r: any) => s + (r.voucher_count ?? 0), 0)}</td>
                      <td className='p-3 text-right tabular-nums'>{toNum((stockGrouped?.data ?? []).reduce((s: number, r: any) => s + (r.total_quantity ?? 0), 0)).toFixed(2)}</td>
                      <td className='p-3 text-right tabular-nums'>{formatAmt((stockGrouped?.data ?? []).reduce((s: number, r: any) => s + (r.total_amount ?? 0), 0))}</td>
                    </tr>
                  )}
                  {(stockGrouped?.data ?? []).length === 0 && (
                    <tr><td colSpan={4} className='p-6 text-center text-muted-foreground'>No data found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value='by-godown'>
          {godownLoading ? (
            <div className='flex items-center justify-center h-32'><Loader className='animate-spin h-6 w-6' /></div>
          ) : (
            <div className='space-y-3'>
              <div className='flex items-center justify-between'>
                <div className='text-sm text-muted-foreground'>
                  <span className='font-semibold text-foreground'>{(godownGrouped?.data ?? []).length}</span> godowns
                </div>
                <ExportDropdown
                  tab='by-godown'
                  title='Receipt Note Report — By Godown'
                  rawData={godownGrouped?.data ?? []}
                  columns={[
                    { header: 'Godown', accessor: 'godown_name' },
                    { header: 'Vouchers', accessor: 'voucher_count' },
                    { header: 'Total Qty', accessor: 'total_quantity' },
                    { header: 'Billing Qty', accessor: 'total_billing_quantity' },
                  ]}
                  formatRow={(r: any) => ({
                    godown_name: r.godown_name,
                    voucher_count: r.voucher_count,
                    total_quantity: toNum(r.total_quantity).toFixed(2),
                    total_billing_quantity: toNum(r.total_billing_quantity).toFixed(2),
                  })}
                  computeTotals={(data: any[]) => {
                    const sQty = data.reduce((s: number, r: any) => s + (r.total_quantity ?? 0), 0)
                    const sBillingQty = data.reduce((s: number, r: any) => s + (r.total_billing_quantity ?? 0), 0)
                    const sVch = data.reduce((s: number, r: any) => s + (r.voucher_count ?? 0), 0)
                    return { godown_name: 'TOTAL', voucher_count: sVch, total_quantity: toNum(sQty).toFixed(2), total_billing_quantity: toNum(sBillingQty).toFixed(2) }
                  }}
                  onExportPdf={exportGroupedPdf}
                  onExportExcel={exportGroupedExcel}
                  onDownloadCsv={downloadCsv}
                  onDownloadJson={downloadJson}
                  onCopyToClipboard={copyToClipboard}
                  chartConfig={{
                    labelKey: 'godown_name',
                    valueKey: 'total_quantity',
                    chartLabel: 'Total Quantity by Godown',
                  }}
                />
              </div>
              {/* Chart */}
              {(godownGrouped?.data ?? []).length > 0 && (
                <div className='rounded-lg border bg-card p-4'>
                  <h4 className='flex items-center gap-2 text-sm font-semibold mb-3 text-slate-700 dark:text-slate-300'>
                    <BarChart3 className='h-4 w-4 text-primary' />
                    Total Quantity by Godown
                  </h4>
                  <ResponsiveContainer width='100%' height={220}>
                    <BarChart data={(godownGrouped?.data ?? []).slice(0, 15).map((r: any) => ({ name: r.godown_name?.length > 18 ? r.godown_name.slice(0, 16) + '…' : r.godown_name, quantity: r.total_quantity ?? 0 }))}>
                      <XAxis dataKey='name' stroke='#888888' fontSize={11} tickLine={false} axisLine={false} interval={0} angle={-20} textAnchor='end' height={60} />
                      <YAxis stroke='#888888' fontSize={11} tickLine={false} axisLine={false} />
                      <Tooltip
                        contentStyle={{ fontSize: 12, borderRadius: 8 }}
                        formatter={(value) => [(Number(value) || 0).toFixed(2), 'Total Qty']}
                        labelFormatter={(label) => `Godown: ${label}`}
                      />
                      <Bar dataKey='quantity' fill='#8b5cf6' radius={[4, 4, 0, 0]} maxBarSize={60} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
              <div className='rounded-md border'>
              <table className='w-full text-sm'>
                <thead>
                  <tr className='border-b bg-muted/50'>
                    <th className='text-left p-3 font-medium'>Godown</th>
                    <th className='text-right p-3 font-medium'>Vouchers</th>
                    <th className='text-right p-3 font-medium'>Total Qty</th>
                    <th className='text-right p-3 font-medium'>Billing Qty</th>
                  </tr>
                </thead>
                <tbody>
                  {(godownGrouped?.data ?? []).map((row: any, i: number) => (
                    <tr key={i} className='border-b hover:bg-muted/30'>
                      <td className='p-3 font-medium'>{row.godown_name}</td>
                      <td className='p-3 text-right'>{row.voucher_count}</td>
                      <td className='p-3 text-right tabular-nums'>{toNum(row.total_quantity).toFixed(2)}</td>
                      <td className='p-3 text-right tabular-nums'>{toNum(row.total_billing_quantity).toFixed(2)}</td>
                    </tr>
                  ))}
                  {(godownGrouped?.data ?? []).length > 0 && (
                    <tr className='border-t-2 border-primary/30 bg-primary/[0.04] font-semibold'>
                      <td className='p-3 text-primary'>Total</td>
                      <td className='p-3 text-right'>{(godownGrouped?.data ?? []).reduce((s: number, r: any) => s + (r.voucher_count ?? 0), 0)}</td>
                      <td className='p-3 text-right tabular-nums'>{toNum((godownGrouped?.data ?? []).reduce((s: number, r: any) => s + (r.total_quantity ?? 0), 0)).toFixed(2)}</td>
                      <td className='p-3 text-right tabular-nums'>{toNum((godownGrouped?.data ?? []).reduce((s: number, r: any) => s + (r.total_billing_quantity ?? 0), 0)).toFixed(2)}</td>
                    </tr>
                  )}
                  {(godownGrouped?.data ?? []).length === 0 && (
                    <tr><td colSpan={4} className='p-6 text-center text-muted-foreground'>No data found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value='by-date'>
          {dateLoading ? (
            <div className='flex items-center justify-center h-32'><Loader className='animate-spin h-6 w-6' /></div>
          ) : (
            <div className='space-y-3'>
              <div className='flex items-center justify-between'>
                <div className='text-sm text-muted-foreground'>
                  <span className='font-semibold text-foreground'>{(dateGrouped?.data ?? []).length}</span> dates
                </div>
                <ExportDropdown
                  tab='by-date'
                  title='Receipt Note Report — By Date'
                  rawData={dateGrouped?.data ?? []}
                  columns={[
                    { header: 'Date', accessor: 'voucher_date' },
                    { header: 'Vouchers', accessor: 'voucher_count' },
                    { header: 'Total Amount', accessor: 'total_amount' },
                  ]}
                  formatRow={(r: any) => ({
                    voucher_date: r.voucher_date ? formatDate(r.voucher_date) : '',
                    voucher_count: r.voucher_count,
                    total_amount: formatAmt(r.total_amount),
                  })}
                  computeTotals={(data: any[]) => {
                    const sAmt = data.reduce((s: number, r: any) => s + (r.total_amount ?? 0), 0)
                    const sVch = data.reduce((s: number, r: any) => s + (r.voucher_count ?? 0), 0)
                    return { voucher_date: 'TOTAL', voucher_count: sVch, total_amount: formatAmt(sAmt) }
                  }}
                  onExportPdf={exportGroupedPdf}
                  onExportExcel={exportGroupedExcel}
                  onDownloadCsv={downloadCsv}
                  onDownloadJson={downloadJson}
                  onCopyToClipboard={copyToClipboard}
                  chartConfig={{
                    labelKey: 'voucher_date',
                    valueKey: 'total_amount',
                    chartLabel: 'Total Amount by Date',
                    formatLabel: formatDate,
                  }}
                />
              </div>
              {/* Chart */}
              {(dateGrouped?.data ?? []).length > 0 && (
                <div className='rounded-lg border bg-card p-4'>
                  <h4 className='flex items-center gap-2 text-sm font-semibold mb-3 text-slate-700 dark:text-slate-300'>
                    <BarChart3 className='h-4 w-4 text-primary' />
                    Total Amount by Date
                  </h4>
                  <ResponsiveContainer width='100%' height={220}>
                    <BarChart data={(dateGrouped?.data ?? []).slice(0, 20).map((r: any) => ({ name: r.voucher_date ? formatDate(r.voucher_date) : '', amount: r.total_amount ?? 0 }))}>
                      <XAxis dataKey='name' stroke='#888888' fontSize={10} tickLine={false} axisLine={false} interval={0} angle={-30} textAnchor='end' height={70} />
                      <YAxis stroke='#888888' fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v: number) => v >= 100000 ? `${(v / 100000).toFixed(1)}L` : v >= 1000 ? `${(v / 1000).toFixed(1)}K` : String(v)} />
                      <Tooltip
                        contentStyle={{ fontSize: 12, borderRadius: 8 }}
                        formatter={(value) => [formatAmt(Number(value) || 0), 'Total Amount']}
                        labelFormatter={(label) => `Date: ${label}`}
                      />
                      <Bar dataKey='amount' fill='#f59e0b' radius={[4, 4, 0, 0]} maxBarSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
              <div className='rounded-md border'>
              <table className='w-full text-sm'>
                <thead>
                  <tr className='border-b bg-muted/50'>
                    <th className='text-left p-3 font-medium'>Date</th>
                    <th className='text-right p-3 font-medium'>Vouchers</th>
                    <th className='text-right p-3 font-medium'>Total Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {(dateGrouped?.data ?? []).map((row: any, i: number) => (
                    <tr key={i} className='border-b hover:bg-muted/30'>
                      <td className='p-3 font-medium'>{row.voucher_date ? formatDate(row.voucher_date) : '—'}</td>
                      <td className='p-3 text-right'>{row.voucher_count}</td>
                      <td className='p-3 text-right tabular-nums font-semibold'>{formatAmt(row.total_amount)}</td>
                    </tr>
                  ))}
                  {(dateGrouped?.data ?? []).length > 0 && (
                    <tr className='border-t-2 border-primary/30 bg-primary/[0.04] font-semibold'>
                      <td className='p-3 text-primary'>Total</td>
                      <td className='p-3 text-right'>{(dateGrouped?.data ?? []).reduce((s: number, r: any) => s + (r.voucher_count ?? 0), 0)}</td>
                      <td className='p-3 text-right tabular-nums'>{formatAmt((dateGrouped?.data ?? []).reduce((s: number, r: any) => s + (r.total_amount ?? 0), 0))}</td>
                    </tr>
                  )}
                  {(dateGrouped?.data ?? []).length === 0 && (
                    <tr><td colSpan={3} className='p-6 text-center text-muted-foreground'>No data found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </Main>
  )
}
