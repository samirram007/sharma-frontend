import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DataTableViewOptions } from '@/features/tasks/components/data-table-view-options'
// import { exportTableToPdf } from '@/utils/export-table-pdf'
import { Cross2Icon } from '@radix-ui/react-icons'
import type { Table } from '@tanstack/react-table'
// import { exportTableToExcel } from '../../../../utils/export-table-excel'
import { useMemo } from 'react'

// interface filteredRowTypes {
//   sourcePlace: string
//   destinationPlace: string
//   vehicleNumber: string
//   rate: number
//   transporter: { name: string }
// }
interface DataTableToolbarProps<TData> {
  table: Table<TData>
  placeHolder: string
  filteredRows: TData[]
  exportColumnsData: ExportColumn<TData>[]
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
  // console.log(filteredRows)

  const exportData = useMemo(() => {
    return (filteredRows as any[]).map((row) => ({
      transporter: row.transporter?.name ?? '',
      sourcePlace: row.sourcePlace?.name ?? '',
      destinationPlace: row.destinationPlace?.name ?? '',
      rate: row.rate ?? 0,
      vehicleNo: row.vehicleNo ?? '',
    }))
  }, [filteredRows])

  const filteredColumn = exportColumnsData.filter((col) => {
    return col.header !== 'actions' && col.header !== 'select'
  })
  // console.log(filteredColumn)

  const isFiltered =
    table.getState().columnFilters.length > 0 || !!table.getState().globalFilter

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 flex-col-reverse items-start gap-y-2 sm:flex-row sm:items-center sm:space-x-2">
        <Input
          placeholder={placeHolder ?? 'Filter records...'}
          value={table.getState().globalFilter ?? ''}
          onChange={(e) => table.setGlobalFilter(e.target.value)}
          className="h-8 w-[150px] lg:w-[250px]"
        />
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => {
              table.resetColumnFilters()
              table.resetGlobalFilter()
            }}
            className="h-8 px-2 lg:px-3"
          >
            Reset
            <Cross2Icon className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
      <Button
        variant="link"
        className="h-8 px-2 lg:px-3"
        onClick={async () => {
          const { default: exportTableToPdf } = await import('@/utils/export-table-pdf')
          exportTableToPdf({
            title: 'Delivery Routes',
            columnData: filteredColumn as any,
            data: exportData,
            fileName: 'delivery-route-table.pdf',
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
            title: 'Delivery Routes',
            columnData: filteredColumn as any,
            data: exportData,
            fileName: 'delivery-route-table.xlsx',
          })
        }}
      >
        Export EXCEL
      </Button>
      <DataTableViewOptions table={table} />
    </div>
  )
}