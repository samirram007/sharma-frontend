import { useMemo, useState, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'

import {
  ChevronLeftIcon,
  ChevronRightIcon,
  DoubleArrowLeftIcon,
  DoubleArrowRightIcon,
} from '@radix-ui/react-icons'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { buildDispatchLabel, VoucherPaymentAction } from '../shared/utils'
import { deliveryNoteGodownWiseQueryOptions } from './data/queryOptions'
import type { GodownWiseReportItem } from './data/schema'
import type { GodownList } from '@/features/modules/godown/data/schema'

interface DeliveryNoteGodownWiseProps {
  zones: GodownList
  godowns: GodownList
}

export default function DeliveryNoteGodownWise({ zones, godowns }: DeliveryNoteGodownWiseProps) {
  const [selectedZoneId, setSelectedZoneId] = useState<number | ''>('')
  const [selectedGodownId, setSelectedGodownId] = useState<number | ''>('')

  const { data: reportResponse, isLoading, isFetching } = useQuery(
    deliveryNoteGodownWiseQueryOptions(
      selectedZoneId || undefined,
      selectedGodownId || undefined
    )
  )

  const reportData: Array<GodownWiseReportItem> = reportResponse?.data ?? []

  // Godowns belonging to the selected zone
  const zoneGodowns = useMemo(() => {
    if (!selectedZoneId) return []
    return godowns.filter(
      (g) =>
        g.storageUnitType !== 'ZONE' &&
        (g.parentId === selectedZoneId || g.id === selectedZoneId)
    )
  }, [selectedZoneId, godowns])

  const selectedZone = useMemo(() => {
    if (!selectedZoneId) return null
    return zones.find((z) => z.id === selectedZoneId) ?? null
  }, [selectedZoneId, zones])

  const handleZoneChange = useCallback((value: string) => {
    setSelectedZoneId(value ? Number(value) : '')
    setSelectedGodownId('') // Reset godown when zone changes
  }, [])

  const handleGodownChange = useCallback((value: string) => {
    setSelectedGodownId(value ? Number(value) : '')
  }, [])

  const headerLabel = useMemo(() => {
    if (selectedGodownId) {
      const g = godowns.find((g) => g.id === selectedGodownId)
      return g?.name ?? ''
    }
    return selectedZone?.name ?? ''
  }, [selectedGodownId, selectedZone, godowns])

  return (
    <div className='w-full min-h-full grid grid-rows-[auto_auto_1fr] gap-2'>
      {/* ── Zone & Godown selectors ── */}
      <div className='flex items-center gap-3 px-2 py-2 bg-white border-b flex-wrap'>
        <label className='text-sm font-semibold text-gray-700 whitespace-nowrap'>Zone:</label>
        <Select
          value={selectedZoneId ? String(selectedZoneId) : ''}
          onValueChange={handleZoneChange}
        >
          <SelectTrigger className='w-[220px]'>
            <SelectValue placeholder='Select zone...' />
          </SelectTrigger>
          <SelectContent>
            {zones.map((zone) => (
              <SelectItem key={zone.id} value={String(zone.id)}>
                <span className='font-medium'>{zone.name}</span>
                {zone.code && <span className='text-gray-400 ml-2'>({zone.code})</span>}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {selectedZoneId && (
          <>
            <span className='text-xs text-gray-400'>→</span>
            <label className='text-sm font-semibold text-gray-700 whitespace-nowrap'>Godown:</label>
            <Select
              value={selectedGodownId ? String(selectedGodownId) : ''}
              onValueChange={handleGodownChange}
            >
              <SelectTrigger className='w-[220px]'>
                <SelectValue placeholder='All godowns in zone...' />
              </SelectTrigger>
              <SelectContent>
                {zoneGodowns.map((g) => (
                  <SelectItem key={g.id} value={String(g.id)}>
                    <span>{g.name}</span>
                    {g.code && <span className='text-gray-400 ml-2'>({g.code})</span>}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </>
        )}

        {selectedZone && (
          <div className='flex items-center gap-1 text-xs text-gray-500'>
            <span className='inline-block w-2 h-2 rounded-full bg-blue-500' />
            {selectedGodownId
              ? `Godown: ${godowns.find(g => g.id === selectedGodownId)?.name}`
              : `Zone: ${selectedZone.name}`}
          </div>
        )}

        {isFetching && selectedZoneId && (
          <div className='flex items-center gap-1 text-xs text-blue-500 ml-auto'>
            <span className='inline-block w-2 h-2 rounded-full bg-blue-400 animate-pulse' />
            Loading...
          </div>
        )}
      </div>

      {/* ── Content area ── */}
      {!selectedZoneId ? (
        <div className='flex flex-col items-center justify-center py-16 text-gray-400'>
          <svg className='w-12 h-12 mb-3 text-gray-300' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.5} d='M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z' />
          </svg>
          <p className='text-base font-medium'>Select a zone to view delivery note details</p>
          <p className='text-sm mt-1'>Choose a zone from the dropdown above to see godown-wise delivery notes.</p>
        </div>
      ) : isLoading ? (
        <div className='flex items-center justify-center py-16 text-gray-400'>
          <div className='flex flex-col items-center gap-2'>
            <div className='w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin' />
            <p className='text-sm'>Loading delivery notes...</p>
          </div>
        </div>
      ) : reportData.length === 0 ? (
        <div className='flex flex-col items-center justify-center py-16 text-gray-400'>
          <svg className='w-12 h-12 mb-2 text-gray-300' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.5} d='M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4' />
          </svg>
          <p className='text-base font-medium'>No delivery notes found</p>
          <p className='text-sm mt-1'>No delivery note data available for{' '}
            {selectedGodownId ? 'the selected godown' : 'the selected zone'}.
          </p>
        </div>
      ) : (
        <ReportView data={reportData} zoneName={headerLabel} />
      )}
    </div>
  )
}

const ReportView = ({ data, zoneName }: { data: Array<GodownWiseReportItem>; zoneName?: string }) => {
  // ── Grand total across all godowns ──
  const grandTotal = useMemo(() => {
    return data.reduce(
      (acc, gd) => ({
        totalEntries: acc.totalEntries + (gd.totalEntries ?? 0),
        totalInwardQuantity: acc.totalInwardQuantity + (gd.totalInwardQuantity ?? 0),
        totalOutwardQuantity: acc.totalOutwardQuantity + (gd.totalOutwardQuantity ?? 0),
        totalClosingQuantity: acc.totalClosingQuantity + (gd.totalClosingQuantity ?? 0),
        totalAmount: acc.totalAmount + (gd.totalAmount ?? 0),
      }),
      { totalEntries: 0, totalInwardQuantity: 0, totalOutwardQuantity: 0, totalClosingQuantity: 0, totalAmount: 0 }
    )
  }, [data])

  return (
    <div className='w-full min-h-full grid grid-rows-[auto_1fr]'>
      <div className='border-2 min-h-full overflow-auto divide-y-4 divide-gray-100'>
        {data.map((godown) => (
          <GodownSection key={godown.godownId} godown={godown} />
        ))}

        {/* ── Grand total footer ── */}
        <div className='bg-gray-800 text-white border-t-2 border-gray-900'>
          <div className='flex items-center justify-between px-3 py-1.5 text-[12px] font-bold'>
            <span className='tracking-wide'>GRAND TOTAL — {zoneName ?? ''}</span>
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

const GodownSection = ({ godown }: { godown: GodownWiseReportItem }) => {
  const [voucherPage, setVoucherPage] = useState(0)
  const [voucherPageSize, setVoucherPageSize] = useState(5)
  const details = godown.voucherDetails ?? []
  const totalVoucherPages = Math.max(1, Math.ceil(details.length / voucherPageSize))
  const safePage = Math.min(voucherPage, totalVoucherPages - 1)
  const pageDetails = details.slice(safePage * voucherPageSize, (safePage + 1) * voucherPageSize)

  const handleVoucherPageSizeChange = (size: number) => {
    setVoucherPageSize(size)
    setVoucherPage(0)
  }

  return (
    <div className='grid grid-rows-1 gap-0'>
      {/* Godown summary row */}
      <div className='grid grid-cols-[1.5fr_1.5fr] text-center font-semibold bg-gray-300 shadow-md'>
        <div className='text-left pl-2 flex items-center gap-2'>
          <span>{godown.godownName || 'Unknown Godown'}</span>
          {godown.godownCode && (
            <span className='text-xs text-gray-500 font-normal'>({godown.godownCode})</span>
          )}
          <span className='text-xs text-gray-600 font-normal ml-auto mr-2'>
            {godown.totalEntries ?? '-'} entr{godown.totalEntries !== 1 ? 'ies' : 'y'}
          </span>
        </div>
        <div className='flex items-center justify-end gap-2 border-l-2 px-2'>
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
          {/* Column header */}
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
                <div className='pl-1 text-left font-mono font-semibold text-gray-700 truncate' title={detail.voucherNo}>
                  {detail.voucherNo ?? '-'}
                </div>
                <div className='text-left text-gray-400 truncate'>
                  {detail.voucherDate ?? '-'}
                </div>
                <div className='pl-1 text-gray-600 truncate' title={detail.partyName ?? ''}>
                  {detail.partyName ?? '-'}
                </div>
                <div className='pl-1 truncate' title={`${detail.itemName ?? ''} / ${detail.godownName ?? ''}`}>
                  <span className='text-gray-700'>{detail.itemName ?? '-'}</span>
                  <span className='text-gray-400 ml-0.5'>/</span>
                  <span className='text-gray-400 text-[10px] ml-0.5'>{detail.godownName ?? ''}</span>
                </div>
                <div className='pl-1 text-[10px] text-muted-foreground truncate' title={buildDispatchLabel(detail)}>
                  {buildDispatchLabel(detail)}
                </div>
                <div className='text-center text-gray-700 font-medium'>
                  {detail.actualQuantity?.toFixed(detail.noOfDecimalPlaces ?? 2) ?? '-'}
                </div>
                <div className='text-right pr-1 text-gray-700 font-medium'>
                  ₹{detail.amount?.toFixed(2) ?? '-'}
                </div>
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
                    <span className='inline-block px-1.5 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-400 leading-none'>-</span>
                  )}
                </div>
                <div className='flex justify-center py-0.5'>
                  <VoucherPaymentAction detail={detail} />
                </div>
              </div>
            </div>
          ))}

          {/* Godown summary footer */}
          <div className='bg-blue-50 border-t-2 border-blue-300'>
            <div className='flex items-center justify-between px-3 py-1 text-[11px] font-semibold text-blue-800'>
              <span className='tracking-wide'>Godown Summary</span>
              <span className='text-blue-600'>
                In: {(godown.totalInwardQuantity ?? 0).toFixed(2)} |{' '}
                Out: {(godown.totalOutwardQuantity ?? 0).toFixed(2)} |{' '}
                Cls: {(godown.totalClosingQuantity ?? 0).toFixed(2)}
              </span>
              <span>{godown.totalEntries ?? 0} entr{godown.totalEntries !== 1 ? 'ies' : 'y'}</span>
              <span>₹{(godown.totalAmount ?? 0).toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
