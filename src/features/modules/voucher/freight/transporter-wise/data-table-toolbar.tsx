import { Cross2Icon } from '@radix-ui/react-icons'
import { IconFilter } from '@tabler/icons-react'
import { useMemo } from 'react'
import { DataTableFacetedFilter } from './data-table-faceted-filter'
import type { Table } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'


import ReportingPeriod from '@/features/global/components/reporting-period'
import { date_format, toSentenceCase } from '@/utils/removeEmptyStrings'
// import { DataTableViewOptions } from './data-table-view-options'



interface DataTableToolbarProps<TData> {
  table: Table<TData>
  placeHolder: string
  filteredRows: Array<TData>
  exportColumnsData: Array<ExportColumn<TData>>
}
export interface ExportColumn<T> {
  header: string
  accessor: keyof T
}

export function DataTableToolbar<TData>({
  table,
  placeHolder,
  filteredRows,
  exportColumnsData,
}: DataTableToolbarProps<TData>) {
  console.log("filteredData", filteredRows)

  const exportData = useMemo(() => {
    return (filteredRows as Array<any>).map((row) => ({
      voucherDate: date_format(row.voucherDate) ?? '',
      transporterName: row.transporterName ?? '',
      vehicleNumber: row.vehicleNumber ?? '',
      partyLedger: row.partyLedger?.name ?? '',
      voucherType: toSentenceCase(row.module ?? row.voucherType?.name ?? '') ?? '',
      voucherNo: row.voucherNo ?? '',
      amount: row.amount ?? '',
      paymentStatus: row.paymentStatus ?? '',
    }))
  }, [filteredRows])

  const filteredColumn = exportColumnsData.filter((col) => {
    return col.header !== 'actions' && col.header !== 'select'
  })
  const isFiltered = table.getState().columnFilters.length > 0


  return (
    <div className='flex items-center justify-end'>
      <div className='flex flex-1 flex-col-reverse gap-x-8  pr-8 items-start gap-y-2 sm:flex-row sm:items-center sm:space-x-2'>
        <Input
          placeholder={placeHolder ?? 'Filter records...'}
          value={table.getState().globalFilter ?? ''}
          onChange={(e) => table.setGlobalFilter(e.target.value)}
          className="h-8 w-[150px] lg:w-[250px]"
        />

        <ReportingPeriod disableHotkey />

        <div className='flex flex-row items-center gap-2'>


          <div><IconFilter className='h-6 w-6 text-blue-600' /></div>
          <div className='flex gap-x-2'>
            {table.getColumn('transporterName') && (
              <DataTableFacetedFilter
                column={table.getColumn('transporterName')}
                title="Transporter"
                options={Array.from(table.getColumn('transporterName')?.getFacetedUniqueValues().keys() ?? [])
                  .map((value) => ({
                    value: value as string,
                    label: value as string,
                  }))}
              />
            )}



          </div>
        </div>
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
            exportTableToPdf({
              title: 'Freight(Transporter Wise)',
              columnData: filteredColumn as any,
              data: exportData,
              fileName: 'freight-transporter-wise-table.pdf',
            })
          }}
        >
          Export PDF
        </Button>
        <Button
          variant="link"
          className="h-8 px-2 lg:px-3"
          onClick={async () => {
            const { default: exportTableToExcel } = await import('@/utils/export-table-excel')
            exportTableToExcel({
              title: 'Freight(Transporter Wise)',
              columnData: filteredColumn as any,
              data: exportData,
              fileName: 'freight-transporter-wise-table.xlsx',
            })
          }}
        >
          Export EXCEL
        </Button>
      </div>
      {/* <DataTableViewOptions table={table} /> */}
    </div>
  )
}
