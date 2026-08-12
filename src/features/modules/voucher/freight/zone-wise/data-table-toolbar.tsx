import { Cross2Icon, BarChartIcon } from '@radix-ui/react-icons'
import { IconFilter } from '@tabler/icons-react'
import { useMemo } from 'react'
import type { Table } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

import ReportingPeriod from '@/features/global/components/reporting-period'

import { DataTableFacetedFilter } from '@/features/global/components/data-table/data-table-faceted-filter'
import { buildDispatchLabel } from '../shared/utils'
import { ExportDropdown, ExportOverlay } from '../shared/export-controls'
import { useExportJob } from '../shared/export-job'

interface DataTableToolbarProps<TData> {
  table: Table<TData>
  placeHolder: string
  filteredRows: Array<TData>
  showChart?: boolean
  onToggleChart?: () => void
  title?: string
}
export interface ExportColumn<T> {
  header: string
  accessor: keyof T
}

const SUMMARY_COLUMNS = [
  { header: 'Zone', accessor: 'zoneName' },
  { header: 'Total Entries', accessor: 'totalEntries' },
  { header: 'Inward Qty', accessor: 'totalInwardQuantity' },
  { header: 'Outward Qty', accessor: 'totalOutwardQuantity' },
  { header: 'Closing Qty', accessor: 'totalClosingQuantity' },
  { header: 'Inward Billing Qty', accessor: 'totalInwardBillingQuantity' },
  { header: 'Outward Billing Qty', accessor: 'totalOutwardBillingQuantity' },
  { header: 'Closing Billing Qty', accessor: 'totalBillingClosingQuantity' },
  { header: 'Total Amount', accessor: 'totalAmount' },
]

const DETAIL_COLUMNS = [
  { header: 'Voucher No', accessor: 'voucherNo' },
  { header: 'Date', accessor: 'voucherDate' },
  { header: 'Party', accessor: 'partyName' },
  { header: 'Item', accessor: 'itemName' },
  { header: 'Godown', accessor: 'godownName' },
  { header: 'Dispatch', accessor: 'dispatch' },
  { header: 'Qty', accessor: 'actualQuantity' },
  { header: 'Amount', accessor: 'amount' },
  { header: 'Status', accessor: 'paymentStatus' },
]

const summaryRows = (rows: Array<any>) =>
  rows.map((row) => ({
    zoneName: row.zoneName ?? '',
    totalEntries: row.totalEntries ?? '',
    totalInwardQuantity: row.totalInwardQuantity ?? '',
    totalOutwardQuantity: row.totalOutwardQuantity ?? '',
    totalClosingQuantity: row.totalClosingQuantity ?? '',
    totalInwardBillingQuantity: row.totalInwardBillingQuantity ?? '',
    totalOutwardBillingQuantity: row.totalOutwardBillingQuantity ?? '',
    totalBillingClosingQuantity: row.totalBillingClosingQuantity ?? '',
    totalAmount: row.totalAmount ?? '',
  }))

const zoneSummaryChart = (rows: Array<any>) => ({
  labels: rows.map((row) => row.zoneName),
  datasets: [
    {
      label: 'Total Amount per Zone',
      data: rows.map((row) => row.totalAmount),
    },
  ],
})

/** Per-zone detailed sections (one per zone) + a summary section first. */
function buildPdfSections(rows: Array<any>, title: string) {
  const isDetailedReport =
    title === 'Delivery Note (Zone Wise)' || title === 'Freight (Zone Wise)'

  if (isDetailedReport) {
    const sections = rows.map((zone) => ({
      title: zone.zoneName || 'Unknown Zone',
      columnData: DETAIL_COLUMNS,
      data: (zone.godownDetails || []).map((detail: any) => ({
        ...detail,
        dispatch: buildDispatchLabel(detail),
      })),
      chart: {
        labels: (zone.godownDetails || []).map((d: any) => d.voucherNo),
        datasets: [
          {
            label: `Actual Quantity - ${zone.zoneName}`,
            data: (zone.godownDetails || []).map((d: any) => d.actualQuantity),
          },
        ],
      },
    }))
    sections.unshift({
      title: 'Summary',
      columnData: SUMMARY_COLUMNS,
      data: summaryRows(rows),
      chart: zoneSummaryChart(rows),
    })
    return sections
  }

  return [
    {
      title: 'Summary Report',
      columnData: SUMMARY_COLUMNS,
      data: summaryRows(rows),
      chart: zoneSummaryChart(rows),
    },
  ]
}

/** Per-zone detailed sheets (one per zone) + a summary sheet first. */
function buildExcelSheets(rows: Array<any>, title: string) {
  const isDetailedReport =
    title === 'Delivery Note (Zone Wise)' || title === 'Freight (Zone Wise)'

  if (isDetailedReport) {
    const sheets = rows.map((zone) => ({
      // Excel worksheet names cannot exceed 31 chars and cannot contain: * ? : / \ [ ]
      title: (zone.zoneName || 'Unknown Zone')
        .replace(/[\\/*?:[\]]/g, '')
        .substring(0, 31),
      columnData: DETAIL_COLUMNS,
      data: (zone.godownDetails || []).map((detail: any) => ({
        ...detail,
        dispatch: buildDispatchLabel(detail),
      })),
      chart: {
        type: 'bar' as const,
        labels: (zone.godownDetails || []).map((d: any) => d.voucherNo),
        datasets: [
          {
            label: `Actual Quantity - ${zone.zoneName}`,
            data: (zone.godownDetails || []).map((d: any) => d.actualQuantity),
          },
        ],
      },
    }))
    sheets.unshift({
      title: 'Summary',
      columnData: SUMMARY_COLUMNS,
      data: summaryRows(rows),
      chart: { type: 'bar' as const, ...zoneSummaryChart(rows) },
    })
    return sheets
  }

  return [
    {
      title: 'Report',
      columnData: SUMMARY_COLUMNS,
      data: summaryRows(rows),
      chart: { type: 'bar' as const, ...zoneSummaryChart(rows) },
    },
  ]
}

export function DataTableToolbar<TData>({
  table,
  placeHolder,
  filteredRows,
  showChart,
  onToggleChart,
  title = 'Freight (Zone Wise)',
}: DataTableToolbarProps<TData>) {
  // Compute zone options from the raw (unfiltered) data so they remain static
  const zoneOptions = useMemo(() => {
    const zoneMap = new Map<string, number>()
    ;(filteredRows as Array<any>).forEach((row) => {
      if (row.zoneName) {
        const current = zoneMap.get(row.zoneName) ?? 0
        zoneMap.set(row.zoneName, current + (row.totalEntries ?? 0))
      }
    })
    return Array.from(zoneMap.entries()).map(([name, count]) => ({
      value: name,
      label: `${name} (${count})`,
    }))
  }, [filteredRows])

  // Rows currently shown on the report (respects the Zone faceted filter +
  // global search). The report has no pagination, so "This page" and
  // "All records (filtered)" share the same set.
  const visibleRows = table
    .getFilteredRowModel()
    .rows.map((row) => row.original)

  const {
    exportJob,
    eta,
    progress,
    runExport,
    handleRunInBackground,
    cancelExport,
  } = useExportJob<any>({
    getPageRows: () =>
      table.getFilteredRowModel().rows.map((row) => row.original),
    getFilteredRows: () =>
      table.getFilteredRowModel().rows.map((row) => row.original),
    generate: async (action, rows) => {
      const fileNameBase = title.toLowerCase().replace(/\s+/g, '-')
      if (action === 'pdf') {
        const { default: exportTableToPdf } =
          await import('@/utils/export-table-pdf')
        exportTableToPdf({
          fileName: `${fileNameBase}.pdf`,
          sections: buildPdfSections(rows, title),
          orientation: 'landscape', // Landscape is better for more columns
        })
      } else {
        const { default: exportTableToExcel } =
          await import('@/utils/export-table-excel')
        exportTableToExcel({
          fileName: `${fileNameBase}.xlsx`,
          sheets: buildExcelSheets(rows, title) as any,
        })
      }
    },
    successLabel: 'zone',
  })

  const zoneNameColumn = table.getColumn('zoneName')
  const isFiltered = table.getState().columnFilters.length > 0

  return (
    <div className="flex items-center justify-end">
      <div className="flex flex-1 flex-col-reverse gap-x-8 pr-8 items-start gap-y-2 sm:flex-row sm:items-center sm:space-x-2">
        <Input
          placeholder={placeHolder}
          value={table.getState().globalFilter ?? ''}
          onChange={(e) => table.setGlobalFilter(e.target.value)}
          className="h-8 w-[150px] lg:w-[250px]"
        />

        <ReportingPeriod disableHotkey />

        <div className="flex flex-row items-center gap-2">
          <div>
            <IconFilter className="h-6 w-6 text-blue-600" />
          </div>
          <div className="flex gap-x-2">
            {zoneNameColumn && zoneOptions.length > 0 && (
              <DataTableFacetedFilter
                column={zoneNameColumn}
                title="Zone"
                options={zoneOptions}
              />
            )}
          </div>
        </div>

        {/* Show Chart toggle */}
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
            onClick={() => table.resetColumnFilters()}
            className="h-8 px-2 lg:px-3"
          >
            Reset
            <Cross2Icon className="ml-2 h-4 w-4" />
          </Button>
        )}

        {visibleRows.length > 0 && (
          <ExportDropdown
            job={exportJob}
            pageCount={visibleRows.length}
            totalCount={visibleRows.length}
            onSelect={runExport}
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
