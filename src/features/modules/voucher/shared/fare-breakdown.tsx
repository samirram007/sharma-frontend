import { useMemo } from 'react'
import { computeNetAdjustment } from './freight-fare'

/**
 * Structural subset of the dispatch-detail fields this component reads.
 * Deliberately NOT the full VoucherDispatchDetailForm so it also accepts the
 * `Record<string, unknown>` dispatch detail used by the freight print dialog.
 */
export type FareDispatchDetail = {
  freightCharges?: number | string | null
  discount?: number | string | null
  loadingCharges?: number | string | null
  unloadingCharges?: number | string | null
  packingCharges?: number | string | null
  insuranceCharges?: number | string | null
  otherCharges?: number | string | null
} | null

/**
 * Fare breakdown shared by every freight / delivery-note surface:
 * - freight print dialog (`freight/components/print-freight-dialog`)
 * - day_book + receipt print dialogs (`shared/print-content.tsx`)
 * - delivery note POS preview (`delivery_note/pos/components/pos-body.tsx`)
 *
 * Renders the bold "Total Fare" row at the top (mirroring the modal, where
 * the calculator leads with the total), then the other charge rows, the red
 * "Less: Discount" deduction (only when a discount exists) and finally the
 * base "Freight Charges" row. Layout differs per surface, so `variant`
 * picks the row classes while the row *content* stays identical.
 */

export type FareChargeRow = {
  label: string
  value: number
}

export const buildChargeRows = (
  dispatchDetail: FareDispatchDetail | undefined,
): { freightCharges: number; discount: number; rows: FareChargeRow[] } => {
  const freightCharges = Number(dispatchDetail?.freightCharges) || 0
  return {
    freightCharges,
    discount: Number(dispatchDetail?.discount) || 0,
    rows: [
      { label: 'Freight Charges', value: freightCharges },
      { label: 'Loading Charges', value: Number(dispatchDetail?.loadingCharges) || 0 },
      { label: 'Unloading Charges', value: Number(dispatchDetail?.unloadingCharges) || 0 },
      { label: 'Packing Charges', value: Number(dispatchDetail?.packingCharges) || 0 },
      { label: 'Insurance Charges', value: Number(dispatchDetail?.insuranceCharges) || 0 },
      { label: 'Other Charges', value: Number(dispatchDetail?.otherCharges) || 0 },
    ].filter((row) => row.value > 0),
  }
}

type FareBreakdownProps = {
  dispatchDetail: FareDispatchDetail | undefined
  /** Net fare — callers pass their authoritative source (voucher amount vs totalFare). */
  totalFare: number
  /** Row layout: flex (freight print), grid (legacy delivery-note prints), pos (POS preview). */
  variant?: 'flex' | 'grid' | 'pos'
  /** Optional currency prefix, e.g. '₹' for the freight dialog. */
  currencySymbol?: string
  /** Optional number formatter (defaults to fixed 2 decimals). */
  fmtFare?: (value: number) => string
  /** Optional extra classes applied to every row (flex variant only). */
  rowClassName?: string
  /** Replaces the Total Fare row's classes entirely (flex variant only). */
  totalRowClassName?: string
  /**
   * Show the 'Net Adjustment' row (total additional charges − discount),
   * matching the Freight Calculator's figure. Flex and grid variants only.
   */
  showNetAdjustment?: boolean
}

export const FareBreakdown = ({
  dispatchDetail,
  totalFare,
  variant = 'flex',
  currencySymbol = '',
  fmtFare = (value: number) => value.toFixed(2),
  rowClassName = '',
  totalRowClassName,
  showNetAdjustment = false,
}: FareBreakdownProps) => {
  const { discount, rows: chargeRows } = useMemo(
    () => buildChargeRows(dispatchDetail),
    [dispatchDetail],
  )

  // The base Freight Charges row prints at the END of the breakdown, mirroring
  // the modal where the calculator leads with the base fare and the additional
  // charges list totals up to the Total Fare row at the top.
  const freightRow = chargeRows.find((row) => row.label === 'Freight Charges')
  const otherRows = chargeRows.filter((row) => row.label !== 'Freight Charges')

  // Net adjustment = additional charges (everything except the base Freight
  // Charges row) − discount — the same figure the Freight Calculator shows.
  // See computeNetAdjustment in ./freight-fare for the exact math.
  const netAdjustment = useMemo(
    () => computeNetAdjustment(dispatchDetail),
    [dispatchDetail],
  )

  const fmt = (value: number) => `${currencySymbol}${fmtFare(value)}`

  if (variant === 'grid') {
    return (
      <>
        <div className="grid grid-cols-[1fr_150px_150px_150px] gap-2 border-b border-gray-900 text-sm font-bold">
          <div className="col-span-3 text-right pr-2">Total Fare</div>
          <div className="text-right">{fmt(totalFare)}</div>
        </div>
        {otherRows.map((row) => (
          <div key={row.label} className="grid grid-cols-[1fr_150px_150px_150px] gap-2 text-sm">
            <div className="col-span-3 text-right pr-2">{row.label}</div>
            <div className="text-right">{fmt(row.value)}</div>
          </div>
        ))}
        {discount > 0 && (
          <div className="grid grid-cols-[1fr_150px_150px_150px] gap-2 text-sm font-semibold text-red-600">
            <div className="col-span-3 text-right pr-2">Less: Discount</div>
            <div className="text-right">− {fmt(discount)}</div>
          </div>
        )}
        {showNetAdjustment && netAdjustment !== 0 && (
          <div className={`grid grid-cols-[1fr_150px_150px_150px] gap-2 text-sm font-semibold ${netAdjustment < 0 ? 'text-emerald-600' : ''}`}>
            <div className="col-span-3 text-right pr-2">Net Adjustment</div>
            <div className="text-right">{netAdjustment >= 0 ? `+ ${fmt(netAdjustment)}` : `− ${fmt(Math.abs(netAdjustment))}`}</div>
          </div>
        )}
        {freightRow && (
          <div className="grid grid-cols-[1fr_150px_150px_150px] gap-2 text-sm">
            <div className="col-span-3 text-right pr-2">{freightRow.label}</div>
            <div className="text-right">{fmt(freightRow.value)}</div>
          </div>
        )}
      </>
    )
  }

  if (variant === 'pos') {
    return (
      <>
        <div className="col-span-3 grid grid-cols-[1fr_200px_120px] gap-4 border-b-2 border-primary/30 pb-1">
          <div>Total Fare: </div>
          <div className="pr-4">{fmt(totalFare)}</div>
        </div>
        {otherRows.map((row) => (
          <div key={row.label} className="contents">
            <div>{row.label}: </div>
            <div className="pr-4">{fmt(row.value)}</div>
          </div>
        ))}
        {discount > 0 && (
          <div className="contents text-red-600">
            <div>Less: Discount: </div>
            <div className="pr-4">− {fmt(discount)}</div>
          </div>
        )}
        {freightRow && (
          <div className="contents">
            <div>{freightRow.label}: </div>
            <div className="pr-4">{fmt(freightRow.value)}</div>
          </div>
        )}
      </>
    )
  }

  // flex — the default, used by the freight print dialog
  return (
    <>
      <div className={totalRowClassName ?? `mb-1 flex items-baseline justify-between gap-4 border-b border-gray-900 pb-1 text-sm font-bold ${rowClassName}`}>
        <span>Total Fare</span>
        <span>{fmt(totalFare)}</span>
      </div>
      {otherRows.map((row) => (
        <div key={row.label} className={`flex items-baseline justify-between gap-4 py-0.5 text-sm ${rowClassName}`}>
          <span>{row.label}</span>
          <span>{fmt(row.value)}</span>
        </div>
      ))}
      {discount > 0 && (
        <div className={`flex items-baseline justify-between gap-4 py-0.5 text-sm font-semibold text-red-600 ${rowClassName}`}>
          <span>Less: Discount</span>
          <span>− {fmt(discount)}</span>
        </div>
      )}
      {showNetAdjustment && netAdjustment !== 0 && (
        <div className={`flex items-baseline justify-between gap-4 py-0.5 text-sm font-semibold ${netAdjustment < 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-700 dark:text-slate-300'} ${rowClassName}`}>
          <span>Net Adjustment</span>
          <span>{netAdjustment >= 0 ? `+ ${fmt(netAdjustment)}` : `− ${fmt(Math.abs(netAdjustment))}`}</span>
        </div>
      )}
      {freightRow && (
        <div className={`flex items-baseline justify-between gap-4 py-0.5 text-sm ${rowClassName}`}>
          <span>{freightRow.label}</span>
          <span>{fmt(freightRow.value)}</span>
        </div>
      )}
    </>
  )
}
