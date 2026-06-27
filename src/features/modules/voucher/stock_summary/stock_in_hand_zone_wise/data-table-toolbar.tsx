import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Cross2Icon } from '@radix-ui/react-icons'
import type { Table } from '@tanstack/react-table'



import { IconFilter } from '@tabler/icons-react'
import ReportingPeriod from '@/features/global/components/reporting-period'
import { useMemo } from 'react'
import { DataTableFacetedFilter } from '@/features/global/components/data-table/data-table-faceted-filter'


// import { DataTableViewOptions } from './data-table-view-options'



interface DataTableToolbarProps<TData> {
  table: Table<TData>
  placeHolder: string
  filteredRows: TData[]
  exportColumnsData?: ExportColumn<TData>[]
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
  const exportData = useMemo(() => {
    return (filteredRows as any[]).map((row) => ({
      zoneId: row.zoneId ?? '',
      zoneName: row.zoneName ?? '',
    }))
  }, [filteredRows])

  const filteredColumn = exportColumnsData?.filter((col) => {
    return col.header !== 'actions' && col.header !== 'select'
  }) ?? []

  // Compute zone options from the raw (unfiltered) data so they remain static
  // regardless of the current column filter state (avoids circular dependency).
  const zoneOptions = useMemo(() => {
    const uniqueZones = new Set<string>()
    ;(filteredRows as any[]).forEach((row) => {
      if (row.zoneName) uniqueZones.add(row.zoneName)
    })
    return Array.from(uniqueZones).map((value) => ({ value, label: value }))
  }, [filteredRows])

  const zoneNameColumn = table.getColumn('zoneName')
  const isFiltered = table.getState().columnFilters.length > 0
  return (
    <div className='flex items-center justify-end'>
      <div className='flex flex-1 flex-col-reverse gap-x-8  pr-8 items-start gap-y-2 sm:flex-row sm:items-center sm:space-x-2'>
        <Input
          placeholder={placeHolder ?? 'Filter records...'}
          value={table.getState().globalFilter ?? ''}
          onChange={(e) => table.setGlobalFilter(e.target.value)}
          className="hidden h-8 w-[150px] lg:w-[250px]"
        />

        <ReportingPeriod disableHotkey />

        <div className='flex flex-row items-center gap-2'>


          <div><IconFilter className='h-6 w-6 text-blue-600' /></div>
          <div className='flex gap-x-2'>
            {/* {partyLedger.name} */}


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
              title: 'Stock In Hand (Zone Wise)',
              columnData: filteredColumn as any,
              data: exportData,
              fileName: 'stock-in-hand-zone-wise.pdf',
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
              title: 'Stock In Hand (Zone Wise)',
              columnData: filteredColumn as any,
              data: exportData,
              fileName: 'stock-in-hand-zone-wise.xlsx',
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
