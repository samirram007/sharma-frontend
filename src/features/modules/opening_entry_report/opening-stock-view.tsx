import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import {
  IconBuildingWarehouse,
  IconPackage,
  IconRefresh,
  IconX,
} from '@tabler/icons-react'
import { useQuery } from '@tanstack/react-query'
import { fetchGodownService } from '@/features/modules/godown/data/api'
import { fetchStockItemService } from '@/features/modules/stock_item/data/api'
import { useAuth } from '@/features/auth/contexts/AuthContext'
import { cn } from '@/lib/utils'
import { Fragment, useMemo, useState } from 'react'
import {
  ChevronDown,
  ChevronUp,
  Download,
  FileSpreadsheet,
  FileText,
} from 'lucide-react'
import { openingStockReportQueryOptions } from './data/queryOptions'
import type { OpeningStockBatch, OpeningStockReport } from './data/schema'
import type { OpeningStockReportParams } from './data/api'

type StockViewMode = 'item-wise' | 'godown-wise'

function formatAmt(val: number | null | undefined): string {
  return (val ?? 0).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

/** Formats a quantity with exactly 2 decimal places — grouping levels whose
 * members can mix units (godown totals, grand totals) must not pick one
 * item's decimal setting, so they use the global 2-dp default. */
function fmtQty(val: number): string {
  return val.toLocaleString('en-IN', {
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

/**
 * Flattens the report into one row per level for CSV/Excel/PDF export —
 * mirroring the on-screen grouped layout for the ACTIVE view (item-wise or
 * godown-wise). Every row carries `Item:` / `Godown:` / `BatchNo:` prefixes
 * like the preview rows, `depth` drives the indent (CSV/Excel indent via
 * withIndent, the formatted PDF indents by depth), and a grand TOTAL row
 * closes the sheet.
 */
function flattenForExport(report: OpeningStockReport, viewMode: StockViewMode) {
  const rows: Record<string, any>[] = []

  if (viewMode === 'item-wise') {
    for (const item of report.items) {
      // Item summary row (the expandable level in the preview)
      rows.push({
        level: 'ITEM',
        depth: 0,
        particulars: `Item: ${item.itemName}${item.itemCode ? ` (${item.itemCode})` : ''}`,
        unit: item.unitCode ?? '',
        batchNo: '',
        expiryDate: '',
        quantity: item.quantity.toFixed(item.noOfDecimalPlaces),
        rate: item.quantity > 0 ? formatAmt(item.amount / item.quantity) : '',
        amount: formatAmt(item.amount),
      })

      for (const godown of item.godowns) {
        // Godown summary row
        rows.push({
          level: 'GODOWN',
          depth: 1,
          particulars: `Godown: ${godown.godownName ?? `Godown #${godown.godownId}`}`,
          unit: item.unitCode ?? '',
          batchNo: '',
          expiryDate: '',
          quantity: godown.quantity.toFixed(item.noOfDecimalPlaces),
          rate:
            godown.quantity > 0
              ? formatAmt(godown.amount / godown.quantity)
              : '',
          amount: formatAmt(godown.amount),
        })

        // Batch detail rows — godown + batch inline, same as the grid rows
        for (const batch of godown.batches) {
          rows.push({
            level: 'BATCH',
            depth: 2,
            particulars: `BatchNo: ${batch.batchNo || '—'}`,
            unit: item.unitCode ?? '',
            batchNo: batch.batchNo ?? '',
            expiryDate: formatDate(batch.expiryDate),
            quantity: batch.quantity.toFixed(item.noOfDecimalPlaces),
            rate: formatAmt(batch.rate),
            amount: formatAmt(batch.amount),
          })
        }
      }
    }
  } else {
    for (const godown of report.godowns) {
      const godownUnits = new Set(
        godown.items.map((it) => it.unitCode).filter((u): u is string => !!u),
      )
      const godownUnit = godownUnits.size === 1 ? [...godownUnits][0] : ''
      // Godown summary row (the expandable level in the preview)
      rows.push({
        level: 'GODOWN',
        depth: 0,
        particulars: `Godown: ${godown.godownName ?? `Godown #${godown.godownId}`}${godown.godownCode ? ` (${godown.godownCode})` : ''}`,
        unit: godownUnit,
        batchNo: '',
        expiryDate: '',
        quantity: godown.quantity.toFixed(2),
        rate:
          godown.quantity > 0 ? formatAmt(godown.amount / godown.quantity) : '',
        amount: formatAmt(godown.amount),
      })

      for (const item of godown.items) {
        rows.push({
          level: 'ITEM',
          depth: 1,
          particulars: `Item: ${item.itemName}${item.itemCode ? ` (${item.itemCode})` : ''}`,
          unit: item.unitCode ?? '',
          batchNo: '',
          expiryDate: '',
          quantity: item.quantity.toFixed(item.noOfDecimalPlaces),
          rate: item.quantity > 0 ? formatAmt(item.amount / item.quantity) : '',
          amount: formatAmt(item.amount),
        })

        for (const batch of item.batches) {
          rows.push({
            level: 'BATCH',
            depth: 2,
            particulars: `BatchNo: ${batch.batchNo || '—'}`,
            unit: item.unitCode ?? '',
            batchNo: batch.batchNo ?? '',
            expiryDate: formatDate(batch.expiryDate),
            quantity: batch.quantity.toFixed(item.noOfDecimalPlaces),
            rate: formatAmt(batch.rate),
            amount: formatAmt(batch.amount),
          })
        }
      }
    }
  }

  // Grand total row
  rows.push({
    level: 'TOTAL',
    depth: 0,
    particulars: 'TOTAL',
    unit: '',
    batchNo: '',
    expiryDate: '',
    quantity: report.totals.totalQuantity.toFixed(2),
    rate: '',
    amount: formatAmt(report.totals.totalAmount),
  })

  return rows
}

/** Indents `Item:` / `Godown:` / `BatchNo:` rows by depth for CSV/Excel. */
function withIndent(rows: Record<string, any>[]): Record<string, any>[] {
  return rows.map((r) => ({
    ...r,
    particulars:
      '  '.repeat(Number(r.depth ?? 0)) + String(r.particulars ?? ''),
  }))
}

type FormattedPdfRow = {
  text: string
  /** `BatchNo: …  exp …` — rendered in its own fixed-width column so every
   * batch number starts at the same tab stop, like the on-screen badges. */
  batch?: string
  quantity: string
  rate: string
  amount: string
  bold?: boolean
  total?: boolean
  continuation?: boolean
}

/** Appends the unit code to a qty (e.g. `47.30 MT`), like the on-screen rows. */
function withUnit(
  qty: number,
  dp: number,
  unitCode: string | null | undefined,
): string {
  return qty.toFixed(dp) + (unitCode ? ` ${unitCode}` : '')
}

/**
 * Builds the formatted-PDF rows: child levels render on a SINGLE line —
 * `Item: X  BatchNo: 010426` / `Godown: Y  BatchNo: …` — matching the
 * on-screen same-row layout, with a deeper left indent for child rows
 * and muted `» batch N` continuation labels for extra batches.
 */
function buildFormattedPdfRows(
  report: OpeningStockReport,
  viewMode: StockViewMode,
): FormattedPdfRow[] {
  const rows: FormattedPdfRow[] = []
  // Deeper left gap for child rows, matching the on-screen child indent
  const CHILD_INDENT = '      '

  const batchLabel = (batch: OpeningStockBatch | null): string => {
    if (!batch) return ''
    let label = `BatchNo: ${batch.batchNo || '—'}`
    if (batch.expiryDate) label += `   exp ${formatDate(batch.expiryDate)}`
    return label
  }

  if (viewMode === 'item-wise') {
    for (const item of report.items) {
      rows.push({
        text: `Item: ${item.itemName}${item.itemCode ? ` (${item.itemCode})` : ''}`,
        quantity: withUnit(
          item.quantity,
          item.noOfDecimalPlaces,
          item.unitCode,
        ),
        rate: item.quantity > 0 ? formatAmt(item.amount / item.quantity) : '',
        amount: formatAmt(item.amount),
        bold: true,
      })
      for (const godown of item.godowns) {
        const godownRows = godown.batches.length > 0 ? godown.batches : [null]
        godownRows.forEach((batch, idx) => {
          const qty = batch ? batch.quantity : godown.quantity
          const amt = batch ? batch.amount : godown.amount
          rows.push({
            text:
              CHILD_INDENT +
              (idx === 0
                ? `Godown: ${godown.godownName ?? `Godown #${godown.godownId}`}`
                : `» batch ${idx + 1}`),
            batch: batchLabel(batch),
            quantity: withUnit(qty, item.noOfDecimalPlaces, item.unitCode),
            rate: batch
              ? formatAmt(batch.rate)
              : qty > 0
                ? formatAmt(amt / qty)
                : '',
            amount: formatAmt(amt),
            continuation: idx > 0,
          })
        })
      }
    }
  } else {
    for (const godown of report.godowns) {
      // Godown totals show a unit only when every item shares one (mixed
      // units stay bare) — same rule as the on-screen godown rows.
      const godownUnits = new Set(
        godown.items.map((it) => it.unitCode).filter((u): u is string => !!u),
      )
      const godownUnit = godownUnits.size === 1 ? [...godownUnits][0] : null
      rows.push({
        text: `Godown: ${godown.godownName ?? `Godown #${godown.godownId}`}${godown.godownCode ? ` (${godown.godownCode})` : ''}`,
        quantity: withUnit(godown.quantity, 2, godownUnit),
        rate:
          godown.quantity > 0 ? formatAmt(godown.amount / godown.quantity) : '',
        amount: formatAmt(godown.amount),
        bold: true,
      })
      for (const item of godown.items) {
        const itemRows = item.batches.length > 0 ? item.batches : [null]
        itemRows.forEach((batch, idx) => {
          const qty = batch ? batch.quantity : item.quantity
          const amt = batch ? batch.amount : item.amount
          rows.push({
            text:
              CHILD_INDENT +
              (idx === 0
                ? `Item: ${item.itemName}${item.itemCode ? ` (${item.itemCode})` : ''}`
                : `» batch ${idx + 1}`),
            batch: batchLabel(batch),
            quantity: withUnit(qty, item.noOfDecimalPlaces, item.unitCode),
            rate: batch
              ? formatAmt(batch.rate)
              : qty > 0
                ? formatAmt(amt / qty)
                : '',
            amount: formatAmt(amt),
            continuation: idx > 0,
          })
        })
      }
    }
  }

  rows.push({
    text: 'TOTAL',
    quantity: report.totals.totalQuantity.toFixed(2),
    rate: '',
    amount: formatAmt(report.totals.totalAmount),
    total: true,
  })

  return rows
}

const EXPORT_COLUMNS = [
  { header: 'Level', accessor: 'level' as const },
  { header: 'Particulars', accessor: 'particulars' as const },
  { header: 'Batch No', accessor: 'batchNo' as const },
  { header: 'Expiry', accessor: 'expiryDate' as const },
  { header: 'Unit', accessor: 'unit' as const },
  { header: 'Quantity', accessor: 'quantity' as const },
  { header: 'Rate', accessor: 'rate' as const },
  { header: 'Amount', accessor: 'amount' as const },
]

export default function OpeningStockReportView() {
  const { userFiscalYear } = useAuth()
  const [viewMode, setViewMode] = useState<StockViewMode>('item-wise')
  const [godownId, setGodownId] = useState<string>('all')
  const [itemId, setItemId] = useState<string>('all')
  const [search, setSearch] = useState('')
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set())
  const [isExporting, setIsExporting] = useState(false)

  const filters = useMemo<OpeningStockReportParams>(
    () => ({
      godownId: godownId !== 'all' ? Number(godownId) : null,
      itemId: itemId !== 'all' ? Number(itemId) : null,
    }),
    [godownId, itemId],
  )

  const {
    data: reportData,
    isLoading,
    isError,
    isFetching,
    refetch,
  } = useQuery(openingStockReportQueryOptions(filters))

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

  const report = reportData?.data as OpeningStockReport | undefined
  const companyName = userFiscalYear?.fiscalYear?.company?.name ?? ''
  const fyName = userFiscalYear?.fiscalYear?.name ?? ''
  const voucherRef = report?.openingVoucher
    ? `Voucher ${report.openingVoucher.voucherNo} · ${formatDate(report.openingVoucher.voucherDate)}`
    : ''

  const toggle = (key: string) => {
    setExpandedKeys((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  // All expandable keys for the current view — drives Expand/Collapse all.
  const allKeys = useMemo(() => {
    if (!report) return []
    const keys: string[] = []
    if (viewMode === 'item-wise') {
      for (const item of report.items) {
        keys.push(`item-${item.itemId}`)
        for (const godown of item.godowns) {
          keys.push(`godown-${item.itemId}-${godown.godownId}`)
        }
      }
    } else {
      for (const godown of report.godowns) {
        keys.push(`g-${godown.godownId}`)
        for (const item of godown.items) {
          keys.push(`g-${godown.godownId}-i-${item.itemId}`)
        }
      }
    }
    return keys
  }, [report, viewMode])

  const allExpanded = allKeys.length > 0 && expandedKeys.size >= allKeys.length

  const toggleAll = () => {
    setExpandedKeys(allExpanded ? new Set() : new Set(allKeys))
  }

  // Client-side name search on top of the server-filtered payload.
  const filteredReport = useMemo(() => {
    if (!report) return undefined
    const q = search.trim().toLowerCase()
    if (!q) return report

    if (viewMode === 'item-wise') {
      return {
        ...report,
        items: report.items.filter(
          (item) =>
            item.itemName.toLowerCase().includes(q) ||
            (item.itemCode ?? '').toLowerCase().includes(q),
        ),
      }
    }
    return {
      ...report,
      godowns: report.godowns
        .map((godown) => ({
          ...godown,
          items: godown.items.filter(
            (item) =>
              item.itemName.toLowerCase().includes(q) ||
              (item.itemCode ?? '').toLowerCase().includes(q),
          ),
        }))
        .filter(
          (godown) =>
            (godown.godownName ?? '').toLowerCase().includes(q) ||
            godown.items.length > 0,
        ),
    }
  }, [report, search, viewMode])

  const exportCsv = () => {
    if (!filteredReport) return
    const rows = withIndent(flattenForExport(filteredReport, viewMode))
    const headers = EXPORT_COLUMNS.map((c) => c.header)
    const flat = rows.map((r) =>
      EXPORT_COLUMNS.map(
        (c) => `"${String(r[c.accessor] ?? '').replace(/"/g, '""')}"`,
      ),
    )
    const bom = '\uFEFF'
    const csv =
      bom + [headers.join(','), ...flat.map((r) => r.join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'opening-stock-report.csv'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleExport = async (format: 'excel' | 'pdf') => {
    if (!filteredReport || isExporting) return
    setIsExporting(true)
    try {
      const rows = withIndent(flattenForExport(filteredReport, viewMode))
      if (rows.length === 0) return

      const title = 'Opening Stock Report'

      if (format === 'excel') {
        const { default: exportTableToExcel } =
          await import('@/utils/export-table-excel')
        await exportTableToExcel({
          title: [companyName, title, fyName, voucherRef]
            .filter(Boolean)
            .join(' — '),
          columnData: EXPORT_COLUMNS,
          data: rows,
          fileName: 'opening-stock-report.xlsx',
        })
      } else {
        const { default: exportTableToPdf } =
          await import('@/utils/export-table-pdf')
        exportTableToPdf({
          // Header lines stacked above the table (company / report / FY / voucher)
          title: [companyName, title, fyName, voucherRef]
            .filter(Boolean)
            .join('\n'),
          columnData: EXPORT_COLUMNS,
          data: rows,
          fileName: 'opening-stock-report.pdf',
          orientation: 'l',
        })
      }
    } catch (error) {
      console.error('Opening stock report export failed:', error)
    } finally {
      setIsExporting(false)
    }
  }

  // Formatted PDF — mirrors the on-screen grouped layout with the same
  // filters applied: company/report header block, bold group rows, child
  // godown/item + BatchNo on ONE line with a deeper indent, muted
  // continuation labels and a highlighted TOTAL row.
  const handleFormattedPdf = async () => {
    if (!filteredReport || isExporting) return
    setIsExporting(true)
    try {
      const pdfRows = buildFormattedPdfRows(filteredReport, viewMode)
      if (pdfRows.length === 0) return

      const [{ jsPDF }, { default: autoTable }] = await Promise.all([
        import('jspdf'),
        import('jspdf-autotable'),
      ])
      const doc = new jsPDF({ orientation: 'l' })

      // Header block — company / report title / FY + voucher / view + filters
      let y = 16
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(14)
      doc.text(companyName, 14, y)
      y += 6
      doc.setFontSize(11)
      doc.text('Opening Stock Report', 14, y)
      y += 5
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(9)
      doc.setTextColor(110)
      const metaLine = [fyName, voucherRef].filter(Boolean).join('   |   ')
      if (metaLine) {
        doc.text(metaLine, 14, y)
        y += 4.5
      }
      const filteredNow =
        godownId !== 'all' || itemId !== 'all' || search.trim() !== ''
      doc.text(
        `${viewMode === 'item-wise' ? 'Item-wise' : 'Godown-wise'} view${filteredNow ? '  ·  Filtered' : ''}  ·  Generated ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}`,
        14,
        y,
      )
      doc.setTextColor(0)
      y += 4.5

      autoTable(doc, {
        startY: y + 2,
        head: [['Particulars', 'Batch No', 'Qty', 'Rate', 'Amount']],
        body: pdfRows.map((r) => [
          r.text,
          r.batch ?? '',
          r.quantity,
          r.rate,
          r.amount,
        ]),
        styles: { fontSize: 8, cellPadding: 1.5 },
        headStyles: { fillColor: [22, 160, 133], halign: 'left' },
        columnStyles: {
          0: { cellWidth: 'auto' },
          1: { cellWidth: 40 },
          2: { halign: 'right', cellWidth: 42 },
          3: { halign: 'right', cellWidth: 28 },
          4: { halign: 'right', cellWidth: 40 },
        },
        didParseCell: (data: any) => {
          // Numeric headers must sit over their right-aligned values
          if (data.section === 'head' && data.column.index >= 2) {
            data.cell.styles.halign = 'right'
            return
          }
          if (data.section !== 'body') return
          const row = pdfRows[data.row.index]
          if (!row) return
          if (row.total) {
            data.cell.styles.fontStyle = 'bold'
            data.cell.styles.fillColor = [238, 246, 243]
          } else if (row.bold && data.column.index === 0) {
            // Top-level group rows (Item-wise items / Godown-wise godowns)
            data.cell.styles.fontStyle = 'bold'
          } else if (row.continuation && data.column.index === 0) {
            // `» batch N` continuation labels — muted like on screen
            data.cell.styles.fontStyle = 'italic'
            data.cell.styles.textColor = 130
          }
        },
      })

      doc.save('opening-stock-report-formatted.pdf')
    } catch (error) {
      console.error('Formatted PDF export failed:', error)
    } finally {
      setIsExporting(false)
    }
  }

  const hasFilters = godownId !== 'all' || itemId !== 'all'

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    )
  }

  if (isError || !report) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center space-y-4">
          <IconX className="h-12 w-12 text-destructive mx-auto" />
          <p className="text-lg font-medium text-destructive">
            Failed to load opening stock report
          </p>
          <Button variant="outline" onClick={() => refetch()}>
            <IconRefresh className="mr-2 h-4 w-4" />
            Retry
          </Button>
        </div>
      </div>
    )
  }

  const empty =
    (viewMode === 'item-wise' && (filteredReport?.items.length ?? 0) === 0) ||
    (viewMode === 'godown-wise' && (filteredReport?.godowns.length ?? 0) === 0)

  return (
    <div className="space-y-4">
      {/* Voucher reference */}
      {report.openingVoucher && (
        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <IconPackage className="h-4 w-4 text-emerald-500" />
          <span>
            Opening voucher:{' '}
            <strong className="text-foreground">
              {report.openingVoucher.voucherNo}
            </strong>{' '}
            dated {formatDate(report.openingVoucher.voucherDate)}
          </span>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <Select
          value={viewMode}
          onValueChange={(v) => setViewMode(v as StockViewMode)}
        >
          <SelectTrigger className="h-9 w-[150px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="item-wise">Item-wise</SelectItem>
            <SelectItem value="godown-wise">Godown-wise</SelectItem>
          </SelectContent>
        </Select>

        <Select value={godownId} onValueChange={setGodownId}>
          <SelectTrigger className="h-9 w-[190px]">
            <SelectValue placeholder="All godowns" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All godowns</SelectItem>
            {(godownList?.data ?? []).map((g: any) => (
              <SelectItem key={g.id} value={String(g.id)}>
                {g.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={itemId} onValueChange={setItemId}>
          <SelectTrigger className="h-9 w-[190px]">
            <SelectValue placeholder="All items" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All items</SelectItem>
            {(itemList?.data ?? []).map((i: any) => (
              <SelectItem key={i.id} value={String(i.id)}>
                {i.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Input
          placeholder="Search item…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-9 w-[180px]"
        />

        {hasFilters && (
          <Button
            variant="ghost"
            size="sm"
            className="h-9"
            onClick={() => {
              setGodownId('all')
              setItemId('all')
            }}
          >
            <IconX className="mr-1 h-3.5 w-3.5" />
            Clear
          </Button>
        )}

        <div className="ml-auto flex items-center gap-2">
          {isFetching && !isLoading && (
            <IconRefresh className="h-4 w-4 animate-spin text-muted-foreground" />
          )}
          <Button
            variant="ghost"
            size="sm"
            className="h-9"
            onClick={toggleAll}
            disabled={allKeys.length === 0}
          >
            {allExpanded ? (
              <ChevronUp className="mr-1 h-3.5 w-3.5" />
            ) : (
              <ChevronDown className="mr-1 h-3.5 w-3.5" />
            )}
            {allExpanded ? 'Collapse all' : 'Expand all'}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-9"
                disabled={isExporting}
              >
                <Download className="mr-1 h-3.5 w-3.5" />
                {isExporting ? 'Exporting…' : 'Export'}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-60">
              <DropdownMenuItem onClick={exportCsv}>
                <Download className="mr-2 h-4 w-4" />
                CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('excel')}>
                <FileSpreadsheet className="mr-2 h-4 w-4 text-emerald-600" />
                Excel
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('pdf')}>
                <FileText className="mr-2 h-4 w-4 text-red-600" />
                PDF
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleFormattedPdf}>
                <FileText className="mr-2 h-4 w-4 text-teal-600" />
                Formatted PDF (as shown)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card>
          <CardContent className="p-3">
            <div className="text-xl font-bold">{report.totals.itemCount}</div>
            <div className="text-xs text-muted-foreground">Items</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <div className="text-xl font-bold">{report.totals.godownCount}</div>
            <div className="text-xs text-muted-foreground">Godowns</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <div className="text-xl font-bold tabular-nums">
              {fmtQty(report.totals.totalQuantity)}
            </div>
            <div className="text-xs text-muted-foreground">Total Quantity</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <div className="text-xl font-bold tabular-nums">
              {formatAmt(report.totals.totalAmount)}
            </div>
            <div className="text-xs text-muted-foreground">Total Value</div>
          </CardContent>
        </Card>
      </div>

      {empty ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <IconPackage className="h-12 w-12 mx-auto mb-3 opacity-40" />
            <p className="text-lg font-medium">No opening stock found</p>
            <p className="text-sm mt-1">
              {hasFilters || search
                ? 'No rows match the current filters.'
                : 'This fiscal year has no opening stock voucher yet. Create one under Transactions → Opening Stock.'}
            </p>
          </CardContent>
        </Card>
      ) : viewMode === 'item-wise' ? (
        <ItemWiseTable
          items={filteredReport!.items}
          expandedKeys={expandedKeys}
          onToggle={toggle}
        />
      ) : (
        <GodownWiseTable
          godowns={filteredReport!.godowns}
          expandedKeys={expandedKeys}
          onToggle={toggle}
        />
      )}
    </div>
  )
}

/* ──────────────────────────────────────────────────────────────────────────
   Grid alignment system
   Both views share one 5-column template so every number column lines up
   EXACTLY under its header and under the other levels:
     [particulars 1fr] [godown/item 1fr] [qty] [rate] [amount]
   Batch tables use the same template (their first column spans particulars
   + godown via col-span-2) — no nested table drift.
   ────────────────────────────────────────────────────────────────────────── */
const GRID_COLS =
  'grid grid-cols-[minmax(0,1.7fr)_minmax(0,1.2fr)_150px_110px_150px]'
const NUM = 'text-right font-mono tabular-nums whitespace-nowrap'

function GridHeader() {
  return (
    <div
      className={cn(
        GRID_COLS,
        'border-b bg-muted/50 text-xs font-medium uppercase tracking-wide text-muted-foreground',
      )}
    >
      {/* Name column spans both rails — child rows use col-span-2 too */}
      <div className="col-span-2 px-3 py-2.5 text-left">Particulars</div>
      <div className="px-3 py-2.5 text-right">Qty</div>
      <div className="px-3 py-2.5 text-right">Rate</div>
      <div className="px-3 py-2.5 pr-4 text-right">Amount</div>
    </div>
  )
}

/** Batch badge + expiry + remarks — rendered inline next to the godown/item
 * name so godown and batch sit on the SAME row (like the voucher entry grid). */
function BatchInline({ batch }: { batch: OpeningStockBatch }) {
  return (
    <>
      {batch.batchNo ? (
        <Badge
          variant="outline"
          className="shrink-0 px-1.5 py-0 font-mono text-[11px]"
        >
          BatchNo: {batch.batchNo}
        </Badge>
      ) : null}
      {batch.expiryDate && (
        <span className="shrink-0 text-[11px] text-muted-foreground">
          exp {formatDate(batch.expiryDate)}
        </span>
      )}
      {batch.remarks && (
        <span className="hidden truncate text-[11px] text-muted-foreground/70 italic lg:inline">
          {batch.remarks}
        </span>
      )}
    </>
  )
}

function ItemWiseTable({
  items,
  expandedKeys,
  onToggle,
}: {
  items: OpeningStockReport['items']
  expandedKeys: Set<string>
  onToggle: (key: string) => void
}) {
  const totalQty = items.reduce((s, i) => s + i.quantity, 0)
  const totalAmt = items.reduce((s, i) => s + i.amount, 0)

  return (
    <div className="overflow-hidden rounded-md border">
      <GridHeader />
      {items.map((item, itemIdx) => {
        const iKey = `item-${item.itemId}`
        const isExpanded = expandedKeys.has(iKey)
        const rate = item.quantity > 0 ? item.amount / item.quantity : null
        const striped = itemIdx % 2 === 0
        return (
          <Fragment key={iKey}>
            {/* Item level */}
            <div
              className={cn(
                GRID_COLS,
                'cursor-pointer border-b border-border/60 hover:bg-accent/40',
                striped ? 'bg-muted/30' : 'bg-card',
              )}
              onClick={() => onToggle(iKey)}
            >
              <div className="col-span-2 flex min-w-0 items-center gap-2 px-3 py-2.5 font-semibold">
                <IconPackage className="h-4 w-4 shrink-0 text-emerald-500" />
                <span className="shrink-0 font-mono text-[11px] font-normal uppercase text-muted-foreground">
                  Item:
                </span>
                <span className="min-w-0 break-words">{item.itemName}</span>
                {item.itemCode && (
                  <span className="shrink-0 font-mono text-xs font-normal text-muted-foreground">
                    {item.itemCode}
                  </span>
                )}
              </div>
              <div
                className={cn(
                  'px-3 py-2.5 font-semibold max-md:text-[11px]',
                  NUM,
                )}
              >
                {item.quantity.toLocaleString('en-IN', {
                  minimumFractionDigits: item.noOfDecimalPlaces,
                  maximumFractionDigits: item.noOfDecimalPlaces,
                })}
                {item.unitCode ? ` ${item.unitCode}` : ''}
              </div>
              <div className={cn('px-3 py-2.5', NUM)}>
                {rate !== null ? formatAmt(rate) : '—'}
              </div>
              <div className={cn('px-3 py-2.5 pr-4 font-semibold', NUM)}>
                {formatAmt(item.amount)}
              </div>
            </div>

            {/* Godown level — one row per godown×batch (godown + batch on the
                same row, like the voucher entry grid). When the godown has no
                batches, a single godown-only row carries the godown totals. */}
            {isExpanded &&
              item.godowns.map((godown) => {
                const gKey = `godown-${item.itemId}-${godown.godownId}`
                const rows = godown.batches.length > 0 ? godown.batches : [null]
                return (
                  <Fragment key={gKey}>
                    {rows.map((batch, batchIdx) => {
                      const rowKey = batch ? `${gKey}-b-${batchIdx}` : gKey
                      // Repeat the godown name only on the FIRST row of the
                      // group; continuation rows show a vertical indent guide
                      // (└-style elbow + rail) instead.
                      const isFirstRow = batchIdx === 0
                      return (
                        <div
                          key={rowKey}
                          className={cn(
                            GRID_COLS,
                            'cursor-pointer border-b border-border/40 last:border-0 hover:bg-accent/30',
                            striped ? 'bg-muted/15' : 'bg-card',
                          )}
                          onClick={() => onToggle(gKey)}
                        >
                          <div className="col-span-2 flex min-w-0 items-center gap-2 py-2 pl-10 text-sm">
                            <span className="flex shrink-0 items-center gap-2">
                              <IconBuildingWarehouse
                                className={cn(
                                  'h-3.5 w-3.5',
                                  isFirstRow
                                    ? 'text-blue-500'
                                    : 'text-blue-500/40',
                                )}
                              />
                            </span>
                            {isFirstRow ? (
                              <>
                                <span className="shrink-0 font-mono text-[11px] uppercase text-muted-foreground">
                                  Godown:
                                </span>
                                <span className="min-w-0 break-words">
                                  {godown.godownName ??
                                    `Godown #${godown.godownId}`}
                                </span>
                              </>
                            ) : (
                              <span className="shrink-0 text-xs italic text-muted-foreground/60">
                                {batch ? `↳ batch ${batchIdx + 1}` : '—'}
                              </span>
                            )}
                            {batch && <BatchInline batch={batch} />}
                          </div>
                          <div
                            className={cn('px-3 py-2 max-md:text-[11px]', NUM)}
                          >
                            {(batch
                              ? batch.quantity
                              : godown.quantity
                            ).toLocaleString('en-IN', {
                              minimumFractionDigits: item.noOfDecimalPlaces,
                              maximumFractionDigits: item.noOfDecimalPlaces,
                            })}
                            {item.unitCode ? ` ${item.unitCode}` : ''}
                          </div>
                          <div
                            className={cn(
                              'px-3 py-2 text-muted-foreground',
                              NUM,
                            )}
                          >
                            {batch
                              ? formatAmt(batch.rate)
                              : godown.quantity > 0
                                ? formatAmt(godown.amount / godown.quantity)
                                : '—'}
                          </div>
                          <div className={cn('px-3 py-2 pr-4', NUM)}>
                            {formatAmt(batch ? batch.amount : godown.amount)}
                          </div>
                        </div>
                      )
                    })}
                  </Fragment>
                )
              })}
          </Fragment>
        )
      })}

      {/* Grand total — same grid */}
      {items.length > 0 && (
        <div
          className={cn(
            GRID_COLS,
            'border-t-2 border-primary/30 bg-primary/[0.04] font-semibold',
          )}
        >
          {/* col-span-2 covers Item + Godown columns, then Qty / Rate / Amount */}
          <div className="col-span-2 px-3 py-2.5 text-primary">
            Total ({items.length} items)
          </div>
          <div className={cn('px-3 py-2.5', NUM)}>{fmtQty(totalQty)}</div>
          <div />
          <div className={cn('px-3 py-2.5 pr-4', NUM)}>
            {formatAmt(totalAmt)}
          </div>
        </div>
      )}
    </div>
  )
}

function GodownWiseTable({
  godowns,
  expandedKeys,
  onToggle,
}: {
  godowns: OpeningStockReport['godowns']
  expandedKeys: Set<string>
  onToggle: (key: string) => void
}) {
  const totalQty = godowns.reduce((s, g) => s + g.quantity, 0)
  const totalAmt = godowns.reduce((s, g) => s + g.amount, 0)

  return (
    <div className="overflow-hidden rounded-md border">
      <GridHeader />
      {godowns.map((godown, godownIdx) => {
        const gKey = `g-${godown.godownId}`
        const isExpanded = expandedKeys.has(gKey)
        const gRate =
          godown.quantity > 0 ? godown.amount / godown.quantity : null
        const striped = godownIdx % 2 === 0
        // Show a unit on the godown total only when every item inside shares
        // the same unit — mixed-unit godowns stay bare.
        const godownUnits = new Set(
          godown.items.map((it) => it.unitCode).filter((u): u is string => !!u),
        )
        const godownUnit = godownUnits.size === 1 ? [...godownUnits][0] : null
        return (
          <Fragment key={gKey}>
            {/* Godown level */}
            <div
              className={cn(
                GRID_COLS,
                'cursor-pointer border-b border-border/60 hover:bg-accent/40',
                striped ? 'bg-muted/30' : 'bg-card',
              )}
              onClick={() => onToggle(gKey)}
            >
              <div className="col-span-2 flex min-w-0 items-center gap-2 px-3 py-2.5 font-semibold">
                <IconBuildingWarehouse className="h-4 w-4 shrink-0 text-blue-500" />
                <span className="shrink-0 font-mono text-[11px] font-normal uppercase text-muted-foreground">
                  Godown:
                </span>
                <span className="min-w-0 break-words">
                  {godown.godownName ?? `Godown #${godown.godownId}`}
                </span>
                {godown.godownCode && (
                  <span className="shrink-0 font-mono text-xs font-normal text-muted-foreground">
                    {godown.godownCode}
                  </span>
                )}
              </div>
              <div className={cn('px-3 py-2.5 font-semibold', NUM)}>
                {fmtQty(godown.quantity)}
                {godownUnit ? ` ${godownUnit}` : ''}
              </div>
              <div className={cn('px-3 py-2.5', NUM)}>
                {gRate !== null ? formatAmt(gRate) : '—'}
              </div>
              <div className={cn('px-3 py-2.5 pr-4 font-semibold', NUM)}>
                {formatAmt(godown.amount)}
              </div>
            </div>

            {/* Item level — one row per item×batch (item + batch on the same
                row, like the voucher entry grid). When the item has no batches,
                a single item-only row carries the item totals. */}
            {isExpanded &&
              godown.items.map((item) => {
                const iKey = `g-${godown.godownId}-i-${item.itemId}`
                const rows = item.batches.length > 0 ? item.batches : [null]
                return (
                  <Fragment key={iKey}>
                    {rows.map((batch, batchIdx) => {
                      const rowKey = batch ? `${iKey}-b-${batchIdx}` : iKey
                      // Repeat the item name only on the FIRST row of the
                      // group; continuation rows show a vertical indent guide
                      // (└-style elbow + rail) instead.
                      const isFirstRow = batchIdx === 0
                      return (
                        <div
                          key={rowKey}
                          className={cn(
                            GRID_COLS,
                            'cursor-pointer border-b border-border/40 last:border-0 hover:bg-accent/30',
                            striped ? 'bg-muted/15' : 'bg-card',
                          )}
                          onClick={() => onToggle(iKey)}
                        >
                          <div className="col-span-2 flex min-w-0 items-center gap-2 py-2 pl-10 text-sm">
                            <span className="flex shrink-0 items-center gap-2">
                              <IconPackage
                                className={cn(
                                  'h-3.5 w-3.5',
                                  isFirstRow
                                    ? 'text-emerald-500'
                                    : 'text-emerald-500/40',
                                )}
                              />
                            </span>
                            {isFirstRow ? (
                              <>
                                <span className="shrink-0 font-mono text-[11px] uppercase text-muted-foreground">
                                  Item:
                                </span>
                                <span className="min-w-0 break-words">
                                  {item.itemName}
                                </span>
                              </>
                            ) : (
                              <span className="shrink-0 text-xs italic text-muted-foreground/60">
                                {batch ? `↳ batch ${batchIdx + 1}` : '—'}
                              </span>
                            )}
                            {batch && <BatchInline batch={batch} />}
                          </div>
                          <div
                            className={cn('px-3 py-2 max-md:text-[11px]', NUM)}
                          >
                            {(batch
                              ? batch.quantity
                              : item.quantity
                            ).toLocaleString('en-IN', {
                              minimumFractionDigits: item.noOfDecimalPlaces,
                              maximumFractionDigits: item.noOfDecimalPlaces,
                            })}
                            {item.unitCode ? ` ${item.unitCode}` : ''}
                          </div>
                          <div
                            className={cn(
                              'px-3 py-2 text-muted-foreground',
                              NUM,
                            )}
                          >
                            {batch
                              ? formatAmt(batch.rate)
                              : item.quantity > 0
                                ? formatAmt(item.amount / item.quantity)
                                : '—'}
                          </div>
                          <div className={cn('px-3 py-2 pr-4', NUM)}>
                            {formatAmt(batch ? batch.amount : item.amount)}
                          </div>
                        </div>
                      )
                    })}
                  </Fragment>
                )
              })}
          </Fragment>
        )
      })}

      {/* Grand total — same grid */}
      {godowns.length > 0 && (
        <div
          className={cn(
            GRID_COLS,
            'border-t-2 border-primary/30 bg-primary/[0.04] font-semibold',
          )}
        >
          <div className="px-3 py-2.5 text-primary">
            Total ({godowns.length} godowns)
          </div>
          <div />
          <div className={cn('px-3 py-2.5', NUM)}>{fmtQty(totalQty)}</div>
          <div />
          <div className={cn('px-3 py-2.5 pr-4', NUM)}>
            {formatAmt(totalAmt)}
          </div>
        </div>
      )}
    </div>
  )
}
