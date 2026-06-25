import { useMemo, useState } from 'react'

import {
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  DoubleArrowLeftIcon,
  DoubleArrowRightIcon,
} from '@radix-ui/react-icons'
import { DataTableToolbar } from './data-table-toolbar'
import VoucherChart from './components/voucher-chart'
import { buildDispatchLabel, VoucherPaymentAction } from '../shared/utils'
import type {ColumnDef, ColumnFiltersState, RowData, SortingState, VisibilityState} from '@tanstack/react-table';
import type { ZoneWiseReportItem } from './data/schema'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn } from '@/lib/utils'

declare module '@tanstack/react-table' {
   
  interface ColumnMeta<TData extends RowData, TValue> {
    className: string
  }
}

interface ZoneWiseProps {
  data: Array<ZoneWiseReportItem>
  chartTitle?: string
  title?: string
}

export default function FreightZoneWise({ data, chartTitle, title = 'Freight (Zone Wise)' }: ZoneWiseProps) {
  return (
    <>
      {!data || data.length === 0 ? (
        <div className='text-center text-gray-500 py-8'>No data available.</div>
      ) : (
        <ReportView data={data} chartTitle={chartTitle} title={title} />
      )}
    </>
  )
}

const ReportView = ({ data, chartTitle, title }: { data: Array<ZoneWiseReportItem>; chartTitle?: string; title: string }) => {
  const [rowSelection, setRowSelection] = useState({})
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [sorting, setSorting] = useState<SortingState>([])
  const [showChart, setShowChart] = useState(false)

  const columns = useMemo<Array<ColumnDef<ZoneWiseReportItem>>>(
    () => [
      {
        id: 'zoneName',
        accessorKey: 'zoneName',
        header: 'Zone',
        filterFn: (row, id, value: Array<string>) => {
          if (!Array.isArray(value) || value.length === 0) return true
          return value.includes(String(row.getValue(id)))
        },
      },
    ],
    []
  )

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
    },
    filterFns: {
      fuzzy: (row, columnId, value) => {
        const columnValue = row.getValue(columnId)
        return columnValue && typeof columnValue === 'string'
          ? columnValue.toLowerCase().includes(value.toLowerCase())
          : false
      },
    },
    enableRowSelection: false,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  })

  const pageData = table.getRowModel().rows.map((r) => r.original)

  // ── Grand total across all zones (respects filtering) ──
  const grandTotal = useMemo(() => {
    return pageData.reduce(
      (acc, zone) => ({
        totalEntries: acc.totalEntries + (zone.totalEntries ?? 0),
        totalInwardQuantity: acc.totalInwardQuantity + (zone.totalInwardQuantity ?? 0),
        totalOutwardQuantity: acc.totalOutwardQuantity + (zone.totalOutwardQuantity ?? 0),
        totalClosingQuantity: acc.totalClosingQuantity + (zone.totalClosingQuantity ?? 0),
        totalAmount: acc.totalAmount + (zone.totalAmount ?? 0),
      }),
      { totalEntries: 0, totalInwardQuantity: 0, totalOutwardQuantity: 0, totalClosingQuantity: 0, totalAmount: 0 }
    )
  }, [pageData])

  return (
    <div className='w-full min-h-full grid grid-rows-[auto_auto_1fr]'>
      <DataTableToolbar
        table={table}
        placeHolder='Filter records...'
        filteredRows={data}
        showChart={showChart}
        onToggleChart={() => setShowChart((v) => !v)}
        title={title}
      />

      {/* Chart section */}
      <div>
        {showChart && (
          <div className='px-2 py-3 border-b'>
            <VoucherChart data={data} chartTitle={chartTitle} />
          </div>
        )}
      </div>

      <div className='border-2 min-h-full overflow-auto divide-y-4 divide-gray-100'>
        {pageData.map((zone, index) => (
          <ZoneSection key={zone.zoneId ?? index} zone={zone} index={index} />
        ))}

        {/* ── Grand total footer ── */}
        <div className='bg-gray-800 text-white border-t-2 border-gray-900'>
          <div className='flex items-center justify-between px-3 py-1.5 text-[12px] font-bold'>
            <span className='tracking-wide'>GRAND TOTAL</span>
            <span className='text-gray-300'>
              In: {(grandTotal.totalInwardQuantity ?? 0).toFixed(2)} |{' '}
              Out: {(grandTotal.totalOutwardQuantity ?? 0).toFixed(2)} |{' '}
              Cls: {(grandTotal.totalClosingQuantity ?? 0).toFixed(2)}
            </span>
            <span>{grandTotal.totalEntries ?? 0} entr{grandTotal.totalEntries !== 1 ? 'ies' : 'y'}</span>
            <span>₹{(grandTotal.totalAmount ?? 0).toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

const VOUCHER_PAGE_SIZES = [5, 10, 20, 30, 50]

const ZoneSection = ({ zone }: { zone: ZoneWiseReportItem; index: number }) => {
  const [voucherPage, setVoucherPage] = useState(0)
  const [voucherPageSize, setVoucherPageSize] = useState(5)
  const details = zone.godownDetails ?? []
  const totalVoucherPages = Math.max(1, Math.ceil(details.length / voucherPageSize))
  const safePage = Math.min(voucherPage, totalVoucherPages - 1)
  const pageDetails = details.slice(safePage * voucherPageSize, (safePage + 1) * voucherPageSize)

  const handleVoucherPageSizeChange = (size: number) => {
    setVoucherPageSize(size)
    setVoucherPage(0)
  }

  return (
    <div className='grid grid-rows-1 gap-0'>
      {/* Zone summary row — zone name on left, pagination controls on right */}
      <div
        className={cn(
          'grid grid-cols-[1.5fr_1.5fr] text-center font-semibold bg-gray-300 shadow-md',
        )}
      >
        <div className='text-left pl-2 flex items-center gap-2'>
          <span>{zone.zoneName || 'Unknown Zone'}</span>
          {zone.zoneCode && (
            <span className='text-xs text-gray-500 font-normal'>({zone.zoneCode})</span>
          )}
          <span className='text-xs text-gray-600 font-normal ml-auto mr-2'>
            {zone.totalEntries ?? '-'} entr{zone.totalEntries !== 1 ? 'ies' : 'y'}
          </span>
        </div>
        <div className='flex items-center justify-end gap-2 border-l-2 px-2'>
          {/* Page size selector */}
          {details.length > 0 && (
            <div className='flex items-center gap-1'>
              <span className='text-[10px] text-gray-600'>Show</span>
              <Select
                value={`${voucherPageSize}`}
                onValueChange={(value) => handleVoucherPageSizeChange(Number(value))}
              >
                <SelectTrigger className='h-5 w-[52px] text-[10px]'>
                  <SelectValue placeholder={voucherPageSize} />
                </SelectTrigger>
                <SelectContent side='bottom'>
                  {VOUCHER_PAGE_SIZES.map((size) => (
                    <SelectItem key={size} value={`${size}`} className='text-[10px]'>{size}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Page nav buttons */}
          {totalVoucherPages > 1 && (
            <div className='flex items-center gap-0.5'>
              <Button
                variant='ghost'
                className='h-5 w-5 p-0 text-gray-600 hover:text-gray-900'
                onClick={() => setVoucherPage(0)}
                disabled={safePage === 0}
              >
                <DoubleArrowLeftIcon className='h-3 w-3' />
              </Button>
              <Button
                variant='ghost'
                className='h-5 w-5 p-0 text-gray-600 hover:text-gray-900'
                onClick={() => setVoucherPage((p) => Math.max(0, p - 1))}
                disabled={safePage === 0}
              >
                <ChevronLeftIcon className='h-3 w-3' />
              </Button>
              <span className='text-[10px] text-gray-600 min-w-[3rem] text-center'>
                {safePage + 1}/{totalVoucherPages}
              </span>
              <Button
                variant='ghost'
                className='h-5 w-5 p-0 text-gray-600 hover:text-gray-900'
                onClick={() => setVoucherPage((p) => Math.min(totalVoucherPages - 1, p + 1))}
                disabled={safePage >= totalVoucherPages - 1}
              >
                <ChevronRightIcon className='h-3 w-3' />
              </Button>
              <Button
                variant='ghost'
                className='h-5 w-5 p-0 text-gray-600 hover:text-gray-900'
                onClick={() => setVoucherPage(totalVoucherPages - 1)}
                disabled={safePage >= totalVoucherPages - 1}
              >
                <DoubleArrowRightIcon className='h-3 w-3' />
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Voucher detail rows */}
      {details.length > 0 && (
        <div className='bg-gray-50'>
          {/* Column header for detail rows */}
          <div className='grid grid-cols-[0.7fr_0.7fr_0.8fr_0.8fr_1.1fr_0.5fr_0.65fr_0.55fr_auto] text-[10px] font-semibold bg-gray-200 border-b border-gray-300'>
            <div className='pl-1 text-left py-0.5'>Vch No</div>
            <div className='text-left py-0.5'>Date</div>
            <div className='border-l py-0.5 pl-1'>Party</div>
            <div className='border-l py-0.5 pl-1'>Item</div>
            <div className='border-l py-0.5 pl-1'>Dispatch</div>
            <div className='border-l py-0.5 text-center'>Qty</div>
            <div className='border-l py-0.5 text-right pr-1'>Amount</div>
            <div className='border-l py-0.5 text-center'>Status</div>
            <div className='border-l py-0.5 text-center'>Action</div>
          </div>

          {pageDetails.map((detail, detailIndex) => (
            <div
              key={detailIndex}
              className={cn(
                'border-b border-gray-200 last:border-b-0',
                detailIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
              )}
            >
              <div className='grid grid-cols-[0.7fr_0.7fr_0.8fr_0.8fr_1.1fr_0.5fr_0.65fr_0.55fr_auto] text-[11px] items-center'>
                {/* Vch No */}
                <div className='pl-1 text-left font-mono font-semibold text-gray-700 truncate' title={detail.voucherNo}>
                  {detail.voucherNo ?? '-'}
                </div>
                {/* Date */}
                <div className='text-left text-gray-400 truncate'>
                  {detail.voucherDate ?? '-'}
                </div>
                {/* Party */}
                <div className='pl-1 text-gray-600 truncate' title={detail.partyName ?? ''}>
                  {detail.partyName ?? '-'}
                </div>
                {/* Item + Godown */}
                <div className='pl-1 truncate' title={`${detail.itemName ?? ''} / ${detail.godownName ?? ''}`}>
                  <span className='text-gray-700'>{detail.itemName ?? '-'}</span>
                  <span className='text-gray-400 ml-0.5'>/</span>
                  <span className='text-gray-400 text-[10px] ml-0.5'>{detail.godownName ?? ''}</span>
                </div>
                {/* Dispatch (compact summary) */}
                <div className='pl-1 text-[10px] text-muted-foreground truncate' title={buildDispatchLabel(detail)}>
                  {buildDispatchLabel(detail)}
                </div>
                {/* Qty */}
                <div className='text-center text-gray-700 font-medium'>
                  {detail.actualQuantity?.toFixed(detail.noOfDecimalPlaces ?? 2) ?? '-'}
                </div>
                {/* Amount */}
                <div className='text-right pr-1 text-gray-700 font-medium'>
                  ₹{detail.amount?.toFixed(2) ?? '-'}
                </div>
                {/* Status badge */}
                <div className='flex justify-center'>
                  {detail.paymentStatus ? (
                    <span className={cn(
                      'inline-block px-1.5 py-0.5 rounded text-[10px] font-medium leading-none',
                      detail.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' :
                      detail.paymentStatus === 'partially_paid' ? 'bg-blue-100 text-blue-700' :
                      'bg-amber-100 text-amber-700'
                    )}>
                      {detail.paymentStatus === 'paid' ? 'Paid' :
                       detail.paymentStatus === 'partially_paid' ? 'Partial' : 'Unpaid'}
                    </span>
                  ) : (
                    <span className='inline-block px-1.5 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-400 leading-none'>
                      -
                    </span>
                  )}
                </div>
                {/* Action: payment receipt button */}
                <div className='flex justify-center py-0.5'>
                  <VoucherPaymentAction detail={detail} />
                </div>
              </div>
            </div>
          ))}

          {/* ── Zone summary footer ── */}
          <div className='bg-blue-50 border-t-2 border-blue-300'>
            <div className='flex items-center justify-between px-3 py-1 text-[11px] font-semibold text-blue-800'>
              <span className='tracking-wide'>Zone Summary</span>
              <span className='text-blue-600'>
                In: {(zone.totalInwardQuantity ?? 0).toFixed(2)} |{' '}
                Out: {(zone.totalOutwardQuantity ?? 0).toFixed(2)} |{' '}
                Cls: {(zone.totalClosingQuantity ?? 0).toFixed(2)}
              </span>
              <span>{zone.totalEntries ?? 0} entr{zone.totalEntries !== 1 ? 'ies' : 'y'}</span>
              <span>₹{(zone.totalAmount ?? 0).toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


