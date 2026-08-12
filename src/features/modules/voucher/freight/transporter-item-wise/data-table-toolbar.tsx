import {
  BarChartIcon,
  CheckIcon,
  Cross2Icon,
  PlusCircledIcon,
} from '@radix-ui/react-icons'
import { IconFilter } from '@tabler/icons-react'
import { useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

import ReportingPeriod from '@/features/global/components/reporting-period'
import { formatQtyFixed } from '@/utils/format-num'
import { date_format } from '@/utils/removeEmptyStrings'
import type { TransporterItemWiseItem } from './data/schema'
import { ExportDropdown, ExportOverlay } from '../shared/export-controls'
import { useExportJob } from '../shared/export-job'

interface DataTableToolbarProps {
  placeHolder: string
  filteredRows: Array<TransporterItemWiseItem>
  /** Rows that should be exported (post-filter) — defaults to filteredRows. */
  exportRows?: Array<TransporterItemWiseItem>
  title?: string
  globalFilter: string
  onGlobalFilterChange: (value: string) => void
  showChart?: boolean
  onToggleChart?: () => void
  transporterFilter: Array<string>
  onTransporterFilterChange: (value: Array<string>) => void
}

// ─── Export builders (receive the scope rows so PDF/Excel always match
//     exactly what the dropdown said it would export) ─────────────────────

const summaryData = (rows: Array<TransporterItemWiseItem>) =>
  rows.map((t) => ({
    transporterName: t.transporterName ?? '',
    vehicleNumber: t.vehicleNumber ?? '',
    totalQuantity: formatQtyFixed(
      t.totalQuantity,
      t.entries?.[0]?.noOfDecimalPlaces,
    ),
    totalAmount: (t.totalAmount ?? 0).toFixed(2),
    totalVouchers: t.totalVouchers ?? 0,
  }))

const SUMMARY_COLUMNS = [
  { header: 'Transporter', accessor: 'transporterName' },
  { header: 'Vehicle No', accessor: 'vehicleNumber' },
  { header: 'Vouchers', accessor: 'totalVouchers' },
  { header: 'Total Qty', accessor: 'totalQuantity' },
  { header: 'Total Amount', accessor: 'totalAmount' },
]

const DETAIL_COLUMNS = [
  { header: 'Vch No', accessor: 'voucherNo' },
  { header: 'Date', accessor: 'voucherDate' },
  { header: 'Party', accessor: 'partyName' },
  { header: 'Item Name', accessor: 'itemName' },
  { header: 'Unit', accessor: 'unitCode' },
  { header: 'Source', accessor: 'source' },
  { header: 'Destination', accessor: 'destination' },
  { header: 'Qty', accessor: 'actualQuantity' },
  { header: 'Bill Qty', accessor: 'billingQuantity' },
  { header: 'Amount', accessor: 'amount' },
  { header: 'Total Fare', accessor: 'totalFare' },
  { header: 'Status', accessor: 'paymentStatus' },
]

const safeName = (name: string | null | undefined, max: number) =>
  (name || 'Unknown Transporter').replace(/[\\/*?:[\]]/g, '_').substring(0, max)

const voucherGroupedRows = (
  entries: Array<TransporterItemWiseItem['entries'][number]>,
) => {
  const voucherMap = new Map<string, typeof entries>()
  entries.forEach((entry) => {
    const key = entry.voucherNo
    if (!voucherMap.has(key)) voucherMap.set(key, [])
    voucherMap.get(key)!.push(entry)
  })
  return voucherMap
}

// ─── PDF: Detailed (Summary → Transporter → Voucher → Items) ────────────
const exportDetailedPdf = async (rows: Array<TransporterItemWiseItem>) => {
  const { default: exportTableToPdf } = await import('@/utils/export-table-pdf')

  const sections: Array<any> = [
    {
      title: 'Summary - Transporter Item Wise',
      columnData: SUMMARY_COLUMNS,
      data: summaryData(rows),
    },
  ]

  rows.forEach((transporter) => {
    const entries = transporter.entries ?? []
    const pdfRows: Array<any> = []
    voucherGroupedRows(entries).forEach((voucherEntries, voucherNo) => {
      voucherEntries.forEach((entry, entryIdx) => {
        const isFirstPdfRow = entryIdx === 0
        pdfRows.push({
          voucherNo: isFirstPdfRow ? voucherNo : '',
          voucherDate:
            isFirstPdfRow && entry.voucherDate
              ? (date_format(entry.voucherDate) ?? '')
              : '',
          partyName: isFirstPdfRow ? entry.partyName : '',
          itemName: entry.itemName,
          unitCode: entry.unitCode ?? '',
          source: isFirstPdfRow ? entry.source : '',
          destination: isFirstPdfRow ? entry.destination : '',
          actualQuantity: (entry.actualQuantity ?? 0).toFixed(
            entry.noOfDecimalPlaces ?? 2,
          ),
          billingQuantity: (entry.billingQuantity ?? 0).toFixed(
            entry.noOfDecimalPlaces ?? 2,
          ),
          amount: (entry.amount ?? 0).toFixed(2),
          totalFare: (entry.totalFare ?? 0).toFixed(2),
          paymentStatus: isFirstPdfRow ? entry.paymentStatus : '',
        })
      })
    })

    sections.push({
      title: safeName(transporter.transporterName, 60),
      columnData: DETAIL_COLUMNS,
      data: pdfRows,
    })
  })

  await exportTableToPdf({
    fileName: 'freight-transporter-item-wise-detailed.pdf',
    sections,
    orientation: 'landscape',
  })
}

// ─── PDF: Summary only ───────────────────────────────────────────────────
const exportSummaryPdf = async (rows: Array<TransporterItemWiseItem>) => {
  const { default: exportTableToPdf } = await import('@/utils/export-table-pdf')
  await exportTableToPdf({
    fileName: 'freight-transporter-item-wise-summary.pdf',
    sections: [
      {
        title: 'Summary - Transporter Item Wise',
        columnData: SUMMARY_COLUMNS,
        data: summaryData(rows),
      },
    ],
    orientation: 'landscape',
  })
}

// ─── Excel: Detailed (Transporter → Voucher → Items hierarchy) ───────────
const exportDetailedExcel = async (rows: Array<TransporterItemWiseItem>) => {
  const { default: exportTableToExcel } =
    await import('@/utils/export-table-excel')

  const sheets: Array<any> = []

  // Summary sheet — each row links to the corresponding per-transporter sheet
  const summaryRows = rows.map((t) => {
    const sheetName = safeName(t.transporterName, 31)
    return {
      transporterName: t.transporterName ?? '',
      vehicleNumber: t.vehicleNumber ?? '',
      totalQuantity: formatQtyFixed(
        t.totalQuantity,
        t.entries?.[0]?.noOfDecimalPlaces,
      ),
      totalAmount: (t.totalAmount ?? 0).toFixed(2),
      totalVouchers: t.totalVouchers ?? 0,
      _sheetLink: sheetName,
    }
  })

  sheets.push({
    title: 'Summary',
    columnData: SUMMARY_COLUMNS,
    data: summaryRows,
  })

  rows.forEach((transporter) => {
    const entries = transporter.entries ?? []
    const excelRows: Array<{
      voucherNo: string
      voucherDate: string
      partyName: string
      source: string
      destination: string
      itemName: string
      unitCode: string
      actualQuantity: string
      billingQuantity: string
      amount: string
      totalFare: string
      paymentStatus: string
      _isHeader?: boolean
      _isSubtotal?: boolean
      _isGrandTotal?: boolean
    }> = []

    let transporterTotalQty = 0
    let transporterTotalAmount = 0

    voucherGroupedRows(entries).forEach((voucherEntries) => {
      const voucherNo = voucherEntries[0].voucherNo
      const voucherDate = voucherEntries[0].voucherDate
        ? (date_format(voucherEntries[0].voucherDate) ?? '')
        : ''
      const partyName = voucherEntries[0].partyName
      const source = voucherEntries[0].source
      const destination = voucherEntries[0].destination
      const paymentStatus = voucherEntries[0].paymentStatus

      excelRows.push({
        voucherNo,
        voucherDate,
        partyName,
        source,
        destination,
        itemName: '',
        unitCode: '',
        actualQuantity: '',
        billingQuantity: '',
        amount: '',
        totalFare: (voucherEntries[0].totalFare ?? 0).toFixed(2),
        paymentStatus,
        _isHeader: true,
        _isSubtotal: false,
        _isGrandTotal: false,
      })

      const itemMap = new Map<string, typeof voucherEntries>()
      voucherEntries.forEach((entry) => {
        const itemKey = entry.itemName
        if (!itemMap.has(itemKey)) itemMap.set(itemKey, [])
        itemMap.get(itemKey)!.push(entry)
      })

      let voucherQty = 0
      let voucherAmount = 0

      itemMap.forEach((itemEntries, itemName) => {
        let itemQty = 0
        let itemAmount = 0

        itemEntries.forEach((entry) => {
          const qty = entry.actualQuantity ?? 0
          const amt = entry.amount ?? 0
          itemQty += qty
          itemAmount += amt
          voucherQty += qty
          voucherAmount += amt

          excelRows.push({
            voucherNo: '',
            voucherDate: '',
            partyName: '',
            source: '',
            destination: '',
            itemName: entry.itemName,
            unitCode: entry.unitCode ?? '',
            actualQuantity: qty.toFixed(entry.noOfDecimalPlaces ?? 2),
            billingQuantity: (entry.billingQuantity ?? 0).toFixed(
              entry.noOfDecimalPlaces ?? 2,
            ),
            amount: amt.toFixed(2),
            totalFare: '',
            paymentStatus: '',
            _isHeader: false,
            _isSubtotal: false,
            _isGrandTotal: false,
          })
        })

        if (itemEntries.length > 1) {
          const itemDecimalPlaces = Math.max(
            ...itemEntries.map((e) => e.noOfDecimalPlaces ?? 2),
          )
          excelRows.push({
            voucherNo: '',
            voucherDate: '',
            partyName: '',
            source: '',
            destination: '',
            itemName: `Subtotal - ${itemName}`,
            unitCode: '',
            actualQuantity: itemQty.toFixed(itemDecimalPlaces),
            billingQuantity: '',
            amount: itemAmount.toFixed(2),
            totalFare: '',
            paymentStatus: '',
            _isHeader: false,
            _isSubtotal: true,
            _isGrandTotal: false,
          })
        }
      })

      if (voucherEntries.length > 1) {
        const subDecimalPlaces = Math.max(
          ...voucherEntries.map((e) => e.noOfDecimalPlaces ?? 2),
        )
        excelRows.push({
          voucherNo: '',
          voucherDate: '',
          partyName: '',
          source: '',
          destination: '',
          itemName: '',
          unitCode: '',
          actualQuantity: voucherQty.toFixed(subDecimalPlaces),
          billingQuantity: '',
          amount: voucherAmount.toFixed(2),
          totalFare: '',
          paymentStatus: '',
          _isHeader: false,
          _isSubtotal: true,
          _isGrandTotal: false,
        })
      }

      transporterTotalQty += voucherQty
      transporterTotalAmount += voucherAmount
    })

    excelRows.push({
      voucherNo: '',
      voucherDate: '',
      partyName: '',
      source: '',
      destination: '',
      itemName: '',
      unitCode: '',
      actualQuantity: formatQtyFixed(
        transporterTotalQty,
        transporter.entries?.[0]?.noOfDecimalPlaces,
      ),
      billingQuantity: '',
      amount: transporterTotalAmount.toFixed(2),
      totalFare: '',
      paymentStatus: '',
      _isHeader: false,
      _isSubtotal: false,
      _isGrandTotal: true,
    })

    sheets.push({
      title: safeName(transporter.transporterName, 31),
      columnData: DETAIL_COLUMNS,
      data: excelRows,
    })
  })

  await exportTableToExcel({
    fileName: 'freight-transporter-item-wise-detailed.xlsx',
    sheets: sheets as any,
  })
}

// ─── Excel: Summary only ─────────────────────────────────────────────────
const exportSummaryExcel = async (rows: Array<TransporterItemWiseItem>) => {
  const { default: exportTableToExcel } =
    await import('@/utils/export-table-excel')
  await exportTableToExcel({
    fileName: 'freight-transporter-item-wise-summary.xlsx',
    sheets: [
      {
        title: 'Summary',
        columnData: SUMMARY_COLUMNS,
        data: summaryData(rows),
      },
    ],
  })
}

// ─── Excel: Flat (no hierarchy, one row per entry) ───────────────────────
const exportFlatExcel = async (rows: Array<TransporterItemWiseItem>) => {
  const { default: exportTableToExcel } =
    await import('@/utils/export-table-excel')

  const flatRows: Array<any> = []

  rows.forEach((transporter) => {
    const entries = transporter.entries ?? []
    entries.forEach((entry) => {
      flatRows.push({
        transporterName: transporter.transporterName ?? '',
        vehicleNumber: transporter.vehicleNumber ?? '',
        voucherNo: entry.voucherNo,
        voucherDate: entry.voucherDate
          ? (date_format(entry.voucherDate) ?? '')
          : '',
        partyName: entry.partyName,
        itemName: entry.itemName,
        unitCode: entry.unitCode ?? '',
        source: entry.source,
        destination: entry.destination,
        actualQuantity: (entry.actualQuantity ?? 0).toFixed(
          entry.noOfDecimalPlaces ?? 2,
        ),
        billingQuantity: (entry.billingQuantity ?? 0).toFixed(
          entry.noOfDecimalPlaces ?? 2,
        ),
        amount: (entry.amount ?? 0).toFixed(2),
        totalFare: (entry.totalFare ?? 0).toFixed(2),
        paymentStatus: entry.paymentStatus,
      })
    })
  })

  await exportTableToExcel({
    fileName: 'freight-transporter-item-wise-flat.xlsx',
    sheets: [
      {
        title: 'Flat Data',
        columnData: [
          { header: 'Transporter', accessor: 'transporterName' },
          { header: 'Vehicle No', accessor: 'vehicleNumber' },
          { header: 'Vch No', accessor: 'voucherNo' },
          { header: 'Date', accessor: 'voucherDate' },
          { header: 'Party', accessor: 'partyName' },
          { header: 'Item Name', accessor: 'itemName' },
          { header: 'Unit', accessor: 'unitCode' },
          { header: 'Source', accessor: 'source' },
          { header: 'Destination', accessor: 'destination' },
          { header: 'Qty', accessor: 'actualQuantity' },
          { header: 'Bill Qty', accessor: 'billingQuantity' },
          { header: 'Amount', accessor: 'amount' },
          { header: 'Total Fare', accessor: 'totalFare' },
          { header: 'Status', accessor: 'paymentStatus' },
        ],
        data: flatRows,
      },
    ],
  })
}

// ─── Excel: Item-wise (grouped by item across all transporters) ──────────
const exportItemWiseExcel = async (rows: Array<TransporterItemWiseItem>) => {
  const { default: exportTableToExcel } =
    await import('@/utils/export-table-excel')

  // Collect all entries across all transporters
  const allEntries: Array<any> = []
  rows.forEach((transporter) => {
    const entries = transporter.entries ?? []
    entries.forEach((entry) => {
      allEntries.push({
        ...entry,
        _transporterName: transporter.transporterName ?? '',
        _vehicleNumber: transporter.vehicleNumber ?? '',
      })
    })
  })

  // Group by item name
  const itemMap = new Map<string, typeof allEntries>()
  allEntries.forEach((entry) => {
    const itemKey = entry.itemName
    if (!itemMap.has(itemKey)) itemMap.set(itemKey, [])
    itemMap.get(itemKey)!.push(entry)
  })

  const itemWiseRows: Array<{
    itemName: string
    transporterName: string
    vehicleNumber: string
    voucherNo: string
    voucherDate: string
    partyName: string
    unitCode: string
    source: string
    destination: string
    actualQuantity: string
    billingQuantity: string
    amount: string
    totalFare: string
    paymentStatus: string
    _isHeader?: boolean
    _isSubtotal?: boolean
  }> = []

  itemMap.forEach((itemEntries, itemName) => {
    let itemTotalQty = 0
    let itemTotalAmount = 0

    // Item header row
    itemWiseRows.push({
      itemName,
      transporterName: '',
      vehicleNumber: '',
      voucherNo: '',
      voucherDate: '',
      partyName: '',
      unitCode: '',
      source: '',
      destination: '',
      actualQuantity: '',
      billingQuantity: '',
      amount: '',
      totalFare: '',
      paymentStatus: '',
      _isHeader: true,
      _isSubtotal: false,
    })

    // Detail rows
    itemEntries.forEach((entry: any) => {
      const qty = entry.actualQuantity ?? 0
      const amt = entry.amount ?? 0
      itemTotalQty += qty
      itemTotalAmount += amt

      itemWiseRows.push({
        itemName: '',
        transporterName: entry._transporterName,
        vehicleNumber: entry._vehicleNumber,
        voucherNo: entry.voucherNo,
        voucherDate: entry.voucherDate
          ? (date_format(entry.voucherDate) ?? '')
          : '',
        partyName: entry.partyName,
        unitCode: entry.unitCode ?? '',
        source: entry.source,
        destination: entry.destination,
        actualQuantity: qty.toFixed(entry.noOfDecimalPlaces ?? 2),
        billingQuantity: (entry.billingQuantity ?? 0).toFixed(
          entry.noOfDecimalPlaces ?? 2,
        ),
        amount: amt.toFixed(2),
        totalFare: (entry.totalFare ?? 0).toFixed(2),
        paymentStatus: entry.paymentStatus,
        _isHeader: false,
        _isSubtotal: false,
      })
    })

    // Item subtotal row
    if (itemEntries.length > 1) {
      const itemDecimalPlaces = Math.max(
        ...itemEntries.map((e: any) => e.noOfDecimalPlaces ?? 2),
      )
      itemWiseRows.push({
        itemName: `Subtotal - ${itemName}`,
        transporterName: '',
        vehicleNumber: '',
        voucherNo: '',
        voucherDate: '',
        partyName: '',
        unitCode: '',
        source: '',
        destination: '',
        actualQuantity: itemTotalQty.toFixed(itemDecimalPlaces),
        billingQuantity: '',
        amount: itemTotalAmount.toFixed(2),
        totalFare: '',
        paymentStatus: '',
        _isHeader: false,
        _isSubtotal: true,
      })
    }
  })

  await exportTableToExcel({
    fileName: 'freight-transporter-item-wise-item-wise.xlsx',
    sheets: [
      {
        title: 'Item Wise',
        columnData: [
          { header: 'Item Name', accessor: 'itemName' },
          { header: 'Transporter', accessor: 'transporterName' },
          { header: 'Vehicle No', accessor: 'vehicleNumber' },
          { header: 'Vch No', accessor: 'voucherNo' },
          { header: 'Date', accessor: 'voucherDate' },
          { header: 'Party', accessor: 'partyName' },
          { header: 'Unit', accessor: 'unitCode' },
          { header: 'Source', accessor: 'source' },
          { header: 'Destination', accessor: 'destination' },
          { header: 'Qty', accessor: 'actualQuantity' },
          { header: 'Bill Qty', accessor: 'billingQuantity' },
          { header: 'Amount', accessor: 'amount' },
          { header: 'Total Fare', accessor: 'totalFare' },
          { header: 'Status', accessor: 'paymentStatus' },
        ],
        data: itemWiseRows,
      },
    ],
  })
}

export function DataTableToolbar({
  placeHolder,
  filteredRows,
  exportRows,
  globalFilter,
  onGlobalFilterChange,
  showChart,
  onToggleChart,
  transporterFilter,
  onTransporterFilterChange,
}: DataTableToolbarProps) {
  const isFiltered = globalFilter.length > 0 || transporterFilter.length > 0

  // Compute transporter options from the raw data
  const transporterOptions = useMemo(() => {
    const transporterMap = new Map<string, number>()
    filteredRows.forEach((row) => {
      if (row.transporterName) {
        const current = transporterMap.get(row.transporterName) ?? 0
        transporterMap.set(
          row.transporterName,
          current + (row.totalVouchers ?? 0),
        )
      }
    })
    return Array.from(transporterMap.entries()).map(([name, count]) => ({
      value: name,
      label: `${name} (${count})`,
    }))
  }, [filteredRows])

  // Rows that the export dropdown operates on (post-filter). The report has
  // no pagination at transporter level, so "This page" and "All records
  // (filtered)" share the same set.
  const rowsToExport = exportRows ?? filteredRows

  const {
    exportJob,
    eta,
    progress,
    runExport,
    handleRunInBackground,
    cancelExport,
  } = useExportJob<TransporterItemWiseItem>({
    getPageRows: () => rowsToExport,
    getFilteredRows: () => rowsToExport,
    generate: async (action, rows) => {
      if (action === 'pdf') await exportDetailedPdf(rows)
      else if (action === 'excel') await exportDetailedExcel(rows)
      else if (action === 'pdf-summary') await exportSummaryPdf(rows)
      else if (action === 'excel-summary') await exportSummaryExcel(rows)
      else if (action === 'excel-flat') await exportFlatExcel(rows)
      else if (action === 'excel-item-wise') await exportItemWiseExcel(rows)
    },
    successLabel: 'transporter',
  })

  return (
    <div className="flex items-center justify-end">
      <div className="flex flex-1 flex-col-reverse gap-x-8 pr-8 items-start gap-y-2 sm:flex-row sm:items-center sm:space-x-2">
        <Input
          placeholder={placeHolder}
          value={globalFilter}
          onChange={(e) => onGlobalFilterChange(e.target.value)}
          className="h-8 w-[150px] lg:w-[250px]"
        />

        <ReportingPeriod disableHotkey />

        <div className="flex flex-row items-center gap-2">
          <div>
            <IconFilter className="h-6 w-6 text-blue-600" />
          </div>
          <div className="flex gap-x-2">
            {/* Transporter filter dropdown */}
            {transporterOptions.length > 0 && (
              <TransporterFilterDropdown
                options={transporterOptions}
                selectedValues={transporterFilter}
                onSelectionChange={onTransporterFilterChange}
              />
            )}
          </div>
        </div>

        {/* Chart toggle button */}
        {onToggleChart && (
          <Button
            variant={showChart ? 'default' : 'outline'}
            size="sm"
            className="h-8 text-xs gap-1"
            onClick={onToggleChart}
          >
            <BarChartIcon className="h-4 w-4" />
            {showChart ? 'Hide Chart' : 'Chart'}
          </Button>
        )}

        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => {
              onGlobalFilterChange('')
              onTransporterFilterChange([])
            }}
            className="h-8 px-2 lg:px-3"
          >
            Reset
            <Cross2Icon className="ml-2 h-4 w-4" />
          </Button>
        )}

        {rowsToExport.length > 0 && (
          <ExportDropdown
            job={exportJob}
            pageCount={rowsToExport.length}
            totalCount={rowsToExport.length}
            onSelect={runExport}
            extraGroups={[
              {
                label: 'More formats',
                items: [
                  { action: 'pdf-summary', label: 'Summary PDF' },
                  { action: 'excel-summary', label: 'Summary Excel' },
                  { action: 'excel-flat', label: 'Flat Excel' },
                  { action: 'excel-item-wise', label: 'Item-wise Excel' },
                ],
              },
            ]}
          />
        )}
      </div>
      {exportJob && (
        <ExportOverlay
          job={exportJob}
          eta={eta}
          progress={progress}
          onBackground={handleRunInBackground}
          onCancel={cancelExport}
        />
      )}
    </div>
  )
}

/** Inline transporter filter dropdown using the same Popover/Command pattern as DataTableFacetedFilter */
function TransporterFilterDropdown({
  options,
  selectedValues,
  onSelectionChange,
}: {
  options: Array<{ value: string; label: string }>
  selectedValues: Array<string>
  onSelectionChange: (values: Array<string>) => void
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 border-dashed">
          <PlusCircledIcon className="h-4 w-4" />
          Transporter
          {selectedValues.length > 0 && (
            <>
              <Separator orientation="vertical" className="mx-2 h-4" />
              <Badge
                variant="secondary"
                className="rounded-sm px-1 font-normal lg:hidden"
              >
                {selectedValues.length}
              </Badge>
              <div className="hidden space-x-1 lg:flex">
                {selectedValues.length > 2 ? (
                  <Badge
                    variant="secondary"
                    className="rounded-sm px-1 font-normal"
                  >
                    {selectedValues.length} selected
                  </Badge>
                ) : (
                  options
                    .filter((option) => selectedValues.includes(option.value))
                    .map((option) => (
                      <Badge
                        variant="secondary"
                        key={option.value}
                        className="rounded-sm px-1 font-normal"
                      >
                        {option.label}
                      </Badge>
                    ))
                )}
              </div>
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Transporter..." />
          <CommandList className="max-h-full">
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => {
                const isSelected = selectedValues.includes(option.value)
                return (
                  <CommandItem
                    key={option.value}
                    onSelect={() => {
                      const newValues = isSelected
                        ? selectedValues.filter((v) => v !== option.value)
                        : [...selectedValues, option.value]
                      onSelectionChange(newValues)
                    }}
                  >
                    <div
                      className={cn(
                        'border-primary flex h-4 w-4 items-center justify-center rounded-sm border',
                        isSelected
                          ? 'bg-primary text-primary-foreground'
                          : 'opacity-50 [&_svg]:invisible',
                      )}
                    >
                      <CheckIcon className="h-4 w-4" />
                    </div>
                    <span className="text-nowrap">{option.label}</span>
                  </CommandItem>
                )
              })}
            </CommandGroup>
            {selectedValues.length > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem
                    onSelect={() => onSelectionChange([])}
                    className="justify-center text-center"
                  >
                    Clear filters
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
