import { Cross2Icon } from '@radix-ui/react-icons'
import { IconFilter } from '@tabler/icons-react'
import { DataTableFacetedFilter } from './data-table-faceted-filter'
import type { Table } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

import ReportingPeriod from '@/features/global/components/reporting-period'
import { date_format, toSentenceCase } from '@/utils/removeEmptyStrings'
import { ExportDropdown, ExportOverlay } from '../shared/export-controls'
import { useExportJob } from '../shared/export-job'

interface DataTableToolbarProps<TData> {
  table: Table<TData>
  placeHolder: string
  exportColumnsData: Array<ExportColumn<TData>>
}
export interface ExportColumn<T> {
  header: string
  accessor: keyof T
}

export function DataTableToolbar<TData>({
  table,
  placeHolder,
  exportColumnsData,
}: DataTableToolbarProps<TData>) {
  // The grid renders the full (client-side filtered) dataset on one page, so
  // "This page" and "All records (filtered)" share the same rows.
  const filteredRows = table
    .getFilteredRowModel()
    .rows.map((row) => row.original)

  const {
    exportJob,
    eta,
    progress,
    runExport,
    handleRunInBackground,
    cancelExport,
  } = useExportJob<TData>({
    getPageRows: () =>
      table.getFilteredRowModel().rows.map((row) => row.original),
    getFilteredRows: () =>
      table.getFilteredRowModel().rows.map((row) => row.original),
    generate: async (action, rows) => {
      const exportData = (rows as Array<any>).map((row) => ({
        voucherDate: date_format(row.voucherDate) ?? '',
        partyName: row.partyName ?? '',
        voucherType:
          toSentenceCase(row.module ?? row.voucherType?.name ?? '') ?? '',
        voucherNo: row.voucherNo ?? '',
        amount: row.amount ?? '',
        paymentStatus: row.paymentStatus ?? '',
      }))
      const filteredColumn = exportColumnsData.filter(
        (col) => col.header !== 'actions' && col.header !== 'select',
      )
      if (action === 'pdf') {
        const { default: exportTableToPdf } =
          await import('@/utils/export-table-pdf')
        exportTableToPdf({
          title: 'Freight(Voucher Wise)',
          columnData: filteredColumn as any,
          data: exportData,
          fileName: 'freight-voucher-wise-table.pdf',
        })
      } else {
        const { default: exportTableToExcel } =
          await import('@/utils/export-table-excel')
        exportTableToExcel({
          title: 'Freight(Voucher Wise)',
          columnData: filteredColumn as any,
          data: exportData,
          fileName: 'freight-voucher-wise-table.xlsx',
        })
      }
    },
    successLabel: 'record',
  })

  const isFiltered = table.getState().columnFilters.length > 0
  const partyColumn = table.getColumn('partyName')
  return (
    <div className="flex items-center justify-end">
      <div className="flex flex-1 flex-col-reverse gap-x-8  pr-8 items-start gap-y-2 sm:flex-row sm:items-center sm:space-x-2">
        <Input
          placeholder={placeHolder ?? 'Filter records...'}
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
            <div className="flex gap-x-2">
              {partyColumn && (
                <DataTableFacetedFilter
                  column={partyColumn}
                  title="Freight(Voucher Wise) "
                  options={Array.from(
                    partyColumn.getFacetedUniqueValues().keys(),
                  ).map((value) => ({
                    value: value as string,
                    label: value as string,
                  }))}
                />
              )}
            </div>
          </div>
        </div>
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
        {filteredRows.length > 0 && (
          <ExportDropdown
            job={exportJob}
            pageCount={filteredRows.length}
            totalCount={filteredRows.length}
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
