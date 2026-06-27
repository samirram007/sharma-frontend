import { Cross2Icon, BarChartIcon } from '@radix-ui/react-icons'
import { IconFilter } from '@tabler/icons-react'
import { useMemo } from 'react'
import type { Table } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

import ReportingPeriod from '@/features/global/components/reporting-period'

import { DataTableFacetedFilter } from '@/features/global/components/data-table/data-table-faceted-filter'
import { buildDispatchLabel } from '../shared/utils'

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

  const zoneNameColumn = table.getColumn('zoneName')
  const isFiltered = table.getState().columnFilters.length > 0

  return (
    <div className='flex items-center justify-end'>
      <div className='flex flex-1 flex-col-reverse gap-x-8 pr-8 items-start gap-y-2 sm:flex-row sm:items-center sm:space-x-2'>
        <Input
          placeholder={placeHolder}
          value={table.getState().globalFilter ?? ''}
          onChange={(e) => table.setGlobalFilter(e.target.value)}
          className="h-8 w-[150px] lg:w-[250px]"
        />

        <ReportingPeriod disableHotkey />

        <div className='flex flex-row items-center gap-2'>
          <div><IconFilter className='h-6 w-6 text-blue-600' /></div>
          <div className='flex gap-x-2'>
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
            size='sm'
            className='h-8 text-xs gap-1'
            onClick={onToggleChart}
          >
            <BarChartIcon className='h-4 w-4' />
            {showChart ? 'Hide Chart' : 'Chart'}
          </Button>
        )}

        {isFiltered && (
          <Button
            variant='ghost'
            onClick={() => table.resetColumnFilters()}
            className='h-8 px-2 lg:px-3'
          >
            Reset
            <Cross2Icon className='ml-2 h-4 w-4' />
          </Button>
        )}

        <Button
          variant="link"
          className="h-8 px-2 lg:px-3"
          onClick={async () => {
            const { default: exportTableToPdf } = await import('@/utils/export-table-pdf')
            
            // Apply detailed section breakdown to both Freight and Delivery Note reports
            const isDetailedReport = title === 'Delivery Note (Zone Wise)' || title === 'Freight (Zone Wise)'

            if (isDetailedReport) {
              const sections = (filteredRows as Array<any>).map((zone) => ({
                title: zone.zoneName || 'Unknown Zone',
                columnData: [
                  { header: 'Voucher No', accessor: 'voucherNo' },
                  { header: 'Date', accessor: 'voucherDate' },
                  { header: 'Party', accessor: 'partyName' },
                  { header: 'Item', accessor: 'itemName' },
                  { header: 'Godown', accessor: 'godownName' },
                  { header: 'Dispatch', accessor: 'dispatch' },
                  { header: 'Qty', accessor: 'actualQuantity' },
                  { header: 'Amount', accessor: 'amount' },
                  { header: 'Status', accessor: 'paymentStatus' },
                ],
                data: (zone.godownDetails || []).map((detail: any) => ({
                  ...detail,
                  dispatch: buildDispatchLabel(detail),
                })),
                chart: {
                  labels: (zone.godownDetails || []).map((d: any) => d.voucherNo),
                  datasets: [{
                    label: `Actual Quantity - ${zone.zoneName}`,
                    data: (zone.godownDetails || []).map((d: any) => d.actualQuantity),
                  }]
                }
              }))

              // Add a summary section at the beginning
              sections.unshift({
                title: 'Summary',
                columnData: [
                  { header: 'Zone', accessor: 'zoneName' },
                  { header: 'Total Entries', accessor: 'totalEntries' },
                  { header: 'Inward Qty', accessor: 'totalInwardQuantity' },
                  { header: 'Outward Qty', accessor: 'totalOutwardQuantity' },
                  { header: 'Closing Qty', accessor: 'totalClosingQuantity' },
                  { header: 'Inward Billing Qty', accessor: 'totalInwardBillingQuantity' },
                  { header: 'Outward Billing Qty', accessor: 'totalOutwardBillingQuantity' },
                  { header: 'Closing Billing Qty', accessor: 'totalBillingClosingQuantity' },
                  { header: 'Total Amount', accessor: 'totalAmount' },
                ],
                data: (filteredRows as Array<any>).map((row) => ({
                  zoneName: row.zoneName ?? '',
                  totalEntries: row.totalEntries ?? '',
                  totalInwardQuantity: row.totalInwardQuantity ?? '',
                  totalOutwardQuantity: row.totalOutwardQuantity ?? '',
                  totalClosingQuantity: row.totalClosingQuantity ?? '',
                  totalInwardBillingQuantity: row.totalInwardBillingQuantity ?? '',
                  totalOutwardBillingQuantity: row.totalOutwardBillingQuantity ?? '',
                  totalBillingClosingQuantity: row.totalBillingClosingQuantity ?? '',
                  totalAmount: row.totalAmount ?? '',
                })),
                chart: {
                  labels: (filteredRows as Array<any>).map((row) => row.zoneName),
                  datasets: [{
                    label: 'Total Amount per Zone',
                    data: (filteredRows as Array<any>).map((row) => row.totalAmount),
                  }]
                }
              })

              exportTableToPdf({
                fileName: `${title.toLowerCase().replace(/\s+/g, '-')}.pdf`,
                sections,
                orientation: 'landscape',
              })
            } else {
              exportTableToPdf({
                title: title,
                fileName: `${title.toLowerCase().replace(/\s+/g, '-')}.pdf`,
                sections: [
                  {
                    title: 'Summary Report',
                    columnData: [
                      { header: 'Zone', accessor: 'zoneName' },
                      { header: 'Total Entries', accessor: 'totalEntries' },
                      { header: 'Inward Qty', accessor: 'totalInwardQuantity' },
                      { header: 'Outward Qty', accessor: 'totalOutwardQuantity' },
                      { header: 'Closing Qty', accessor: 'totalClosingQuantity' },
                      { header: 'Inward Billing Qty', accessor: 'totalInwardBillingQuantity' },
                      { header: 'Outward Billing Qty', accessor: 'totalOutwardBillingQuantity' },
                      { header: 'Closing Billing Qty', accessor: 'totalBillingClosingQuantity' },
                      { header: 'Total Amount', accessor: 'totalAmount' },
                    ],
                    data: (filteredRows as Array<any>).map((row) => ({
                      zoneName: row.zoneName ?? '',
                      totalEntries: row.totalEntries ?? '',
                      totalInwardQuantity: row.totalInwardQuantity ?? '',
                      totalOutwardQuantity: row.totalOutwardQuantity ?? '',
                      totalClosingQuantity: row.totalClosingQuantity ?? '',
                      totalInwardBillingQuantity: row.totalInwardBillingQuantity ?? '',
                      totalOutwardBillingQuantity: row.totalOutwardBillingQuantity ?? '',
                      totalBillingClosingQuantity: row.totalBillingClosingQuantity ?? '',
                      totalAmount: row.totalAmount ?? '',
                    })),
                    chart: {
                      labels: (filteredRows as Array<any>).map((row) => row.zoneName),
                      datasets: [{
                        label: 'Total Amount per Zone',
                        data: (filteredRows as Array<any>).map((row) => row.totalAmount),
                      }]
                    }
                  }
                ],
                orientation: 'landscape', // Landscape is better for more columns
              })
            }
          }}
        >
          Export PDF
        </Button>
        <Button
          variant="link"
          className="h-8 px-2 lg:px-3"
          onClick={async () => {
            const { default: exportTableToExcel } = await import('@/utils/export-table-excel')
            
            // Apply detailed sheet breakdown to both Freight and Delivery Note reports
            const isDetailedReport = title === 'Delivery Note (Zone Wise)' || title === 'Freight (Zone Wise)'

            if (isDetailedReport) {
              const sheets = (filteredRows as Array<any>).map((zone) => ({
                // Excel worksheet names cannot exceed 31 chars and cannot contain: * ? : / \ [ ]
                title: (zone.zoneName || 'Unknown Zone').replace(/[\\/*?:[\]]/g, '').substring(0, 31),
                columnData: [
                  { header: 'Voucher No', accessor: 'voucherNo' },
                  { header: 'Date', accessor: 'voucherDate' },
                  { header: 'Party', accessor: 'partyName' },
                  { header: 'Item', accessor: 'itemName' },
                  { header: 'Godown', accessor: 'godownName' },
                  { header: 'Dispatch', accessor: 'dispatch' },
                  { header: 'Qty', accessor: 'actualQuantity' },
                  { header: 'Amount', accessor: 'amount' },
                  { header: 'Status', accessor: 'paymentStatus' },
                ],
                data: (zone.godownDetails || []).map((detail: any) => ({
                  ...detail,
                  dispatch: buildDispatchLabel(detail),
                })),
                chart: {
                  type: 'bar' as const,
                  labels: (zone.godownDetails || []).map((d: any) => d.voucherNo),
                  datasets: [{
                    label: `Actual Quantity - ${zone.zoneName}`,
                    data: (zone.godownDetails || []).map((d: any) => d.actualQuantity),
                  }]
                }
              }))

              // Add a summary sheet at the beginning
              sheets.unshift({
                title: 'Summary',
                columnData: [
                  { header: 'Zone', accessor: 'zoneName' },
                  { header: 'Total Entries', accessor: 'totalEntries' },
                  { header: 'Inward Qty', accessor: 'totalInwardQuantity' },
                  { header: 'Outward Qty', accessor: 'totalOutwardQuantity' },
                  { header: 'Closing Qty', accessor: 'totalClosingQuantity' },
                  { header: 'Inward Billing Qty', accessor: 'totalInwardBillingQuantity' },
                  { header: 'Outward Billing Qty', accessor: 'totalOutwardBillingQuantity' },
                  { header: 'Closing Billing Qty', accessor: 'totalBillingClosingQuantity' },
                  { header: 'Total Amount', accessor: 'totalAmount' },
                ],
                data: (filteredRows as Array<any>).map((row) => ({
                  zoneName: row.zoneName ?? '',
                  totalEntries: row.totalEntries ?? '',
                  totalInwardQuantity: row.totalInwardQuantity ?? '',
                  totalOutwardQuantity: row.totalOutwardQuantity ?? '',
                  totalClosingQuantity: row.totalClosingQuantity ?? '',
                  totalInwardBillingQuantity: row.totalInwardBillingQuantity ?? '',
                  totalOutwardBillingQuantity: row.totalOutwardBillingQuantity ?? '',
                  totalBillingClosingQuantity: row.totalBillingClosingQuantity ?? '',
                  totalAmount: row.totalAmount ?? '',
                })),
                chart: {
                  type: 'bar' as const,
                  labels: (filteredRows as Array<any>).map((row) => row.zoneName),
                  datasets: [{
                    label: 'Total Amount per Zone',
                    data: (filteredRows as Array<any>).map((row) => row.totalAmount),
                  }]
                }
              })

              exportTableToExcel({
                fileName: `${title.toLowerCase().replace(/\s+/g, '-')}.xlsx`,
                sheets: sheets as any,
              })
            } else {
              exportTableToExcel({
                title: title,
                columnData: [
                  { header: 'Zone', accessor: 'zoneName' },
                  { header: 'Total Entries', accessor: 'totalEntries' },
                  { header: 'Inward Qty', accessor: 'totalInwardQuantity' },
                  { header: 'Outward Qty', accessor: 'totalOutwardQuantity' },
                  { header: 'Closing Qty', accessor: 'totalClosingQuantity' },
                  { header: 'Inward Billing Qty', accessor: 'totalInwardBillingQuantity' },
                  { header: 'Outward Billing Qty', accessor: 'totalOutwardBillingQuantity' },
                  { header: 'Closing Billing Qty', accessor: 'totalBillingClosingQuantity' },
                  { header: 'Total Amount', accessor: 'totalAmount' },
                ],
                data: (filteredRows as Array<any>).map((row) => ({
                  zoneName: row.zoneName ?? '',
                  totalEntries: row.totalEntries ?? '',
                  totalInwardQuantity: row.totalInwardQuantity ?? '',
                  totalOutwardQuantity: row.totalOutwardQuantity ?? '',
                  totalClosingQuantity: row.totalClosingQuantity ?? '',
                  totalInwardBillingQuantity: row.totalInwardBillingQuantity ?? '',
                  totalOutwardBillingQuantity: row.totalOutwardBillingQuantity ?? '',
                  totalBillingClosingQuantity: row.totalBillingClosingQuantity ?? '',
                  totalAmount: row.totalAmount ?? '',
                })),
                fileName: `${title.toLowerCase().replace(/\s+/g, '-')}.xlsx`,
                sheets: [
                  {
                    title: 'Report',
                    columnData: [
                      { header: 'Zone', accessor: 'zoneName' },
                      { header: 'Total Entries', accessor: 'totalEntries' },
                      { header: 'Inward Qty', accessor: 'totalInwardQuantity' },
                      { header: 'Outward Qty', accessor: 'totalOutwardQuantity' },
                      { header: 'Closing Qty', accessor: 'totalClosingQuantity' },
                      { header: 'Inward Billing Qty', accessor: 'totalInwardBillingQuantity' },
                      { header: 'Outward Billing Qty', accessor: 'totalOutwardBillingQuantity' },
                      { header: 'Closing Billing Qty', accessor: 'totalBillingClosingQuantity' },
                      { header: 'Total Amount', accessor: 'totalAmount' },
                    ],
                    data: (filteredRows as Array<any>).map((row) => ({
                      zoneName: row.zoneName ?? '',
                      totalEntries: row.totalEntries ?? '',
                      totalInwardQuantity: row.totalInwardQuantity ?? '',
                      totalOutwardQuantity: row.totalOutwardQuantity ?? '',
                      totalClosingQuantity: row.totalClosingQuantity ?? '',
                      totalInwardBillingQuantity: row.totalInwardBillingQuantity ?? '',
                      totalOutwardBillingQuantity: row.totalOutwardBillingQuantity ?? '',
                      totalBillingClosingQuantity: row.totalBillingClosingQuantity ?? '',
                      totalAmount: row.totalAmount ?? '',
                    })),
                    chart: {
                      type: 'bar' as const,
                      labels: (filteredRows as Array<any>).map((row) => row.zoneName),
                      datasets: [{
                        label: 'Total Amount per Zone',
                        data: (filteredRows as Array<any>).map((row) => row.totalAmount),
                      }]
                    }
                  }
                ] as any
              })
            }
          }}
        >
          Export EXCEL
        </Button>
      </div>
    </div>
  )
}
