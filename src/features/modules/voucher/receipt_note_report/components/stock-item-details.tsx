import { Badge } from '@/components/ui/badge'
import type { StockJournalEntryForm, StockJournalGodownEntryForm, VoucherDispatchDetailForm } from '../../data-schema/voucher-schema'
import { format } from 'date-fns'
import { Truck, Package } from 'lucide-react'
import { formatLocale } from '@/utils/format-num'

interface StockItemDetailsProps {
  stockJournalEntries?: (StockJournalEntryForm | null)[]
  voucherDispatchDetail?: VoucherDispatchDetailForm | null
}

function formatDate(value: string | Date | null | undefined) {
  if (!value) return '—'
  const date = new Date(value)
  if (isNaN(date.getTime())) return '—'
  return format(date, 'dd-MMM-yyyy')
}

const formatQty = formatLocale
const formatAmt = formatLocale

function GodownBatchRow({ entry }: { entry: StockJournalGodownEntryForm }) {
  return (
    <tr className='border-b border-slate-100 dark:border-slate-800 last:border-0 hover:bg-slate-50/50 dark:hover:bg-slate-800/30'>
      <td className='py-2 pl-10 pr-2 text-xs text-muted-foreground'>
        {entry.godown?.name ?? <span className='italic'>—</span>}
      </td>
      <td className='py-2 px-2 text-xs'>
        {entry.batchNo ? <Badge variant='outline' className='text-[10px] px-1.5 py-0 font-mono bg-blue-50 dark:bg-blue-950/30'>{entry.batchNo}</Badge> : <span className='text-muted-foreground italic'>—</span>}
      </td>
      <td className='py-2 px-2 text-xs tabular-nums text-right'>{formatDate(entry.mfgDate)}</td>
      <td className='py-2 px-2 text-xs tabular-nums text-right'>{formatDate(entry.expiryDate)}</td>
      <td className='py-2 px-2 text-xs tabular-nums text-right font-medium'>{formatQty(entry.actualQuantity)}</td>
      <td className='py-2 px-2 text-xs tabular-nums text-right'>{formatQty(entry.billingQuantity)}</td>
      <td className='py-2 px-2 text-xs tabular-nums text-right'>{formatQty(entry.rate)}</td>
      <td className='py-2 pl-2 pr-4 text-xs tabular-nums text-right font-semibold'>{formatAmt(entry.amount)}</td>
    </tr>
  )
}

export function StockItemDetails({ stockJournalEntries, voucherDispatchDetail }: StockItemDetailsProps) {
  if (!stockJournalEntries || stockJournalEntries.length === 0) {
    return (
      <div className='px-4 py-3 text-sm text-muted-foreground italic'>
        No stock items found for this receipt note.
      </div>
    )
  }

  return (
    <div className='px-4 py-3 space-y-4'>
      {/* Stock Items with Godown Batches */}
      <div>
        <h4 className='flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2'>
          <Package className='h-3.5 w-3.5' />
          Stock Items & Godown Batches
        </h4>

        {stockJournalEntries.map((entry, ei) => {
          if (!entry) return null
          const godownEntries = entry.stockJournalGodownEntries?.filter(Boolean) as StockJournalGodownEntryForm[] | undefined

          return (
            <div key={entry.id ?? ei} className='mb-3 rounded-lg border border-slate-200/70 dark:border-slate-700/50 bg-white/60 dark:bg-slate-900/40 overflow-hidden'>
              {/* Item Header */}
              <div className='flex items-center justify-between px-4 py-2 bg-slate-50/80 dark:bg-slate-800/50 border-b border-slate-200/50 dark:border-slate-700/30'>
                <div className='flex items-center gap-3'>
                  <span className='text-sm font-medium text-slate-800 dark:text-slate-200'>
                    {entry.stockItem?.name ?? `Item #${entry.stockItemId}`}
                  </span>
                  {entry.stockItem?.code && (
                    <Badge variant='secondary' className='text-[10px] px-1.5 py-0 font-mono'>
                      {entry.stockItem.code}
                    </Badge>
                  )}
                </div>
                <div className='flex items-center gap-4 text-xs text-muted-foreground'>
                  <span>Qty: <strong className='text-slate-700 dark:text-slate-300'>{formatQty(entry.actualQuantity)}</strong></span>
                  <span>Rate: <strong className='text-slate-700 dark:text-slate-300'>{formatQty(entry.rate)}</strong></span>
                  <span>Amount: <strong className='text-slate-700 dark:text-slate-300'>{formatAmt(entry.amount)}</strong></span>
                </div>
              </div>

              {/* Godown Batches Table */}
              {godownEntries && godownEntries.length > 0 ? (
                <div className='overflow-x-auto'>
                  <table className='w-full text-xs'>
                    <thead>
                      <tr className='border-b border-slate-100 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/20'>
                        <th className='py-1.5 pl-10 pr-2 text-left font-medium text-muted-foreground'>Godown</th>
                        <th className='py-1.5 px-2 text-left font-medium text-muted-foreground'>Batch No</th>
                        <th className='py-1.5 px-2 text-right font-medium text-muted-foreground'>Mfg Date</th>
                        <th className='py-1.5 px-2 text-right font-medium text-muted-foreground'>Expiry Date</th>
                        <th className='py-1.5 px-2 text-right font-medium text-muted-foreground'>Act. Qty</th>
                        <th className='py-1.5 px-2 text-right font-medium text-muted-foreground'>Bill. Qty</th>
                        <th className='py-1.5 px-2 text-right font-medium text-muted-foreground'>Rate</th>
                        <th className='py-1.5 pl-2 pr-4 text-right font-medium text-muted-foreground'>Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {godownEntries.map((ge, gi) => (
                        <GodownBatchRow key={ge.id ?? gi} entry={ge} />
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className='px-4 py-2 text-xs text-muted-foreground italic'>
                  No godown/batch details for this item.
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Dispatch Details */}
      {voucherDispatchDetail && (
        <div>
          <h4 className='flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2'>
            <Truck className='h-3.5 w-3.5' />
            Dispatch Details
          </h4>
          <div className='grid grid-cols-2 md:grid-cols-4 gap-3 rounded-lg border border-slate-200/70 dark:border-slate-700/50 bg-white/60 dark:bg-slate-900/40 p-4'>
            {voucherDispatchDetail.dispatchedThrough && (
              <div>
                <span className='text-[10px] uppercase tracking-wider text-muted-foreground'>Dispatched Through</span>
                <p className='text-sm font-medium'>{voucherDispatchDetail.dispatchedThrough}</p>
              </div>
            )}
            {voucherDispatchDetail.carrierName && (
              <div>
                <span className='text-[10px] uppercase tracking-wider text-muted-foreground'>Carrier</span>
                <p className='text-sm font-medium'>{voucherDispatchDetail.carrierName}</p>
              </div>
            )}
            {voucherDispatchDetail.motorVehicleNo && (
              <div>
                <span className='text-[10px] uppercase tracking-wider text-muted-foreground'>Vehicle No</span>
                <p className='text-sm font-medium font-mono'>{voucherDispatchDetail.motorVehicleNo}</p>
              </div>
            )}
            {voucherDispatchDetail.billOfLadingNo && (
              <div>
                <span className='text-[10px] uppercase tracking-wider text-muted-foreground'>Bill of Lading</span>
                <p className='text-sm font-medium font-mono'>
                  {voucherDispatchDetail.billOfLadingNo}
                  {voucherDispatchDetail.billOfLadingDate && (
                    <span className='text-muted-foreground ml-1'>({formatDate(voucherDispatchDetail.billOfLadingDate)})</span>
                  )}
                </p>
              </div>
            )}
            {voucherDispatchDetail.orderNumber && (
              <div>
                <span className='text-[10px] uppercase tracking-wider text-muted-foreground'>Order No</span>
                <p className='text-sm font-medium'>{voucherDispatchDetail.orderNumber}</p>
              </div>
            )}
            {voucherDispatchDetail.destination && (
              <div>
                <span className='text-[10px] uppercase tracking-wider text-muted-foreground'>Destination</span>
                <p className='text-sm font-medium'>{voucherDispatchDetail.destination}</p>
              </div>
            )}
            {voucherDispatchDetail.source && (
              <div>
                <span className='text-[10px] uppercase tracking-wider text-muted-foreground'>Source</span>
                <p className='text-sm font-medium'>{voucherDispatchDetail.source}</p>
              </div>
            )}
            {voucherDispatchDetail.paymentTerms && (
              <div>
                <span className='text-[10px] uppercase tracking-wider text-muted-foreground'>Payment Terms</span>
                <p className='text-sm font-medium'>{voucherDispatchDetail.paymentTerms}</p>
              </div>
            )}
            {voucherDispatchDetail.billingPreference && (
              <div>
                <span className='text-[10px] uppercase tracking-wider text-muted-foreground'>Billing</span>
                <Badge variant='outline' className='capitalize mt-0.5 text-xs'>
                  {voucherDispatchDetail.billingPreference}
                </Badge>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer note when no dispatch details */}
      {!voucherDispatchDetail && (
        <div className='text-xs text-muted-foreground italic flex items-center gap-2'>
          <Truck className='h-3 w-3' />
          No dispatch details available for this receipt note.
        </div>
      )}
    </div>
  )
}
