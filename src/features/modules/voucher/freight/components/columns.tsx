import BillCell from './bill-cell'
import VoucherNoSummaryDialog from '../../day_book/components/voucher-no-summary-dialog'
import { EstimatedHint } from '../../shared/EstimatedHint'
import { resolveDispatchWeight } from '../../shared/dispatch-defaults'
import type { ColumnDef } from '@tanstack/react-table'
import type { VoucherSchema } from '../../data-schema/voucher-schema'
import { cn } from '@/lib/utils'
import { date_format } from '@/utils/removeEmptyStrings'

/**
 * Format a stock-journal entry quantity for the Items column and exports:
 * "1,000" / "10.500 MT" / "-" — uses the stock unit's decimal places (same
 * convention as the Weight column's weightUnit.noOfDecimalPlaces).
 */
export function formatItemQuantity(
  quantity: number | null | undefined,
  unitCode?: string | null,
  noOfDecimalPlaces?: number | null,
): string {
  const qty = Number(quantity || 0)
  if (!qty) {
    return '-'
  }
  const dp = noOfDecimalPlaces ?? 2
  return `${qty.toLocaleString('en-IN', {
    minimumFractionDigits: dp,
    maximumFractionDigits: dp,
  })}${unitCode ? ` ${unitCode}` : ''}`
}

export const columns: Array<ColumnDef<VoucherSchema>> = [
  {
    id: 'slNo',
    header: () => <div className="text-center">Sl. No.</div>,
    cell: ({ row }) => (
      <div className="text-center text-slate-600 dark:text-slate-400">
        {row.index + 1}
      </div>
    ),
    size: 60,
    meta: { className: cn('w-[60px] text-center') },
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'voucherDate',
    header: () => <div>Date</div>,
    cell: ({ row }) => {
      const date = row.getValue('voucherDate') as Date | string | undefined
      return (
        <div className="text-muted-foreground">
          {date ? date_format(date) : '-'}
        </div>
      )
    },
    size: 120,
    meta: { className: cn('w-[120px]') },
    enableSorting: true,
  },
  {
    accessorKey: 'voucherNo',
    header: () => <div>Dl. No.</div>,
    // Delivery no: first click shows the delivery note summary dialog; clicking
    // the no again from the dialog opens the delivery note edit page.
    cell: ({ row }) => <VoucherNoSummaryDialog data={row.original} />,
    size: 100,
    meta: { className: cn('w-[100px]') },
    enableSorting: false,
  },
  {
    id: 'partyName',
    header: () => <div>Distributor</div>,
    cell: ({ row }) => {
      const party = row.original.party
      return (
        <div className="font-medium text-foreground">{party?.name ?? '-'}</div>
      )
    },
    minSize: 140,
    size: 160,
    meta: { className: cn('min-w-[140px]') },
    enableSorting: false,
  },
  {
    id: 'dispatch',
    header: () => <div>Dispatch</div>,
    cell: ({ row }) => {
      const d = row.original.voucherDispatchDetail
      const dispatchNo = d?.billOfLadingNo
      const route = [d?.source, d?.destination].filter(Boolean).join(' → ')
      const carrier = [d?.carrierName, d?.motorVehicleNo]
        .filter(Boolean)
        .join(' · ')

      if (!dispatchNo && !route && !carrier) {
        return <div className="text-muted-foreground">-</div>
      }

      return (
        <div className="flex min-w-[180px] flex-col gap-0.5">
          {dispatchNo && (
            <div
              className="truncate font-medium text-foreground"
              title={dispatchNo}
            >
              {dispatchNo}
            </div>
          )}
          {route && (
            <div
              className="truncate text-xs text-muted-foreground"
              title={route}
            >
              {route}
            </div>
          )}
          {carrier && (
            <div
              className="truncate text-xs text-muted-foreground"
              title={carrier}
            >
              {carrier}
            </div>
          )}
        </div>
      )
    },
    minSize: 180,
    size: 220,
    meta: { className: cn('min-w-[180px]') },
    enableSorting: false,
  },
  {
    id: 'items',
    header: () => <div>Items</div>,
    cell: ({ row }) => {
      const entries =
        row.original.stockJournal?.stockJournalEntries?.filter(Boolean) ?? []
      if (entries.length === 0) {
        return <div className="text-muted-foreground">-</div>
      }
      return (
        <div className="flex min-w-[180px] flex-col gap-1.5 py-0.5">
          {entries.map((entry, index) => {
            const item = entry?.stockItem
            const unit = entry?.stockUnit
            const godowns =
              entry?.stockJournalGodownEntries?.filter(Boolean) ?? []
            return (
              <div key={index} className="flex flex-col gap-0.5">
                <div className="flex items-center gap-1.5 text-xs">
                  <span
                    className="min-w-0 flex-1 truncate font-medium text-foreground/90"
                    title={item?.name ?? ''}
                  >
                    {item?.name ?? `Item #${entry?.stockItemId ?? '?'}`}
                  </span>
                  <span className="shrink-0 tabular-nums text-muted-foreground">
                    {formatItemQuantity(
                      entry?.actualQuantity || entry?.billingQuantity,
                      unit?.code,
                      unit?.noOfDecimalPlaces,
                    )}
                  </span>
                </div>

                {/* Godowns this item moved through, with per-godown quantity */}
                {godowns.length > 0 && (
                  <div className="flex flex-wrap gap-1 pl-3">
                    {godowns.map((godownEntry, gdIndex) => {
                      const godownQty = formatItemQuantity(
                        godownEntry?.actualQuantity ||
                          godownEntry?.billingQuantity,
                        unit?.code,
                        unit?.noOfDecimalPlaces,
                      )
                      return (
                        <span
                          key={gdIndex}
                          className="inline-flex items-center gap-1 rounded-full bg-muted/60 px-1.5 py-0.5 text-[10px] leading-none text-muted-foreground dark:bg-muted/40"
                        >
                          {godownEntry?.godown?.name ??
                            `Godown #${godownEntry?.godownId ?? '?'}`}
                          {godownQty !== '-' && (
                            <>
                              <span className="opacity-50">·</span>
                              <span className="tabular-nums">{godownQty}</span>
                            </>
                          )}
                        </span>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )
    },
    minSize: 180,
    size: 220,
    meta: { className: cn('min-w-[180px]') },
    enableSorting: false,
  },
  {
    id: 'weight',
    header: () => <div className="text-right pr-4">Weight (Mt)</div>,
    cell: ({ row }) => {
      const d = row.original.voucherDispatchDetail

      const savedWeight = Number(d?.weight) > 0 ? Number(d?.weight) : 0
      // Rows without a saved weight show the calculated weight (sum of the
      // stock-journal quantities) marked "estimated" — same defaulting the
      // dispatch-detail editors and the summary card use.
      const weight =
        savedWeight > 0 ? savedWeight : resolveDispatchWeight(row.original)
      return (
        <div className="px-4 text-right text-foreground/80 font-medium">
          {weight > 0 ? (
            <>
              {Number(weight).toFixed(d?.weightUnit?.noOfDecimalPlaces ?? 2)}
              {!savedWeight && <EstimatedHint className="ml-1 align-middle" />}
            </>
          ) : (
            '-'
          )}
        </div>
      )
    },
    size: 110,
    meta: { className: cn('w-[110px] hidden md:table-cell') },
    enableSorting: false,
  },
  {
    id: 'rate',
    header: () => <div className="text-right pr-4">Rate (Per Mt)</div>,
    cell: ({ row }) => {
      const d = row.original.voucherDispatchDetail
      const rate = d?.rate ? Number(d.rate).toFixed(2) : '-'
      return (
        <div className="pr-4 text-right text-foreground/80 font-medium">
          {rate}
        </div>
      )
    },
    size: 120,
    meta: { className: cn('w-[120px] hidden md:table-cell') },
    enableSorting: false,
  },
  {
    id: 'totalFare',
    header: () => <div className="text-right pr-4">Total Fare</div>,
    cell: ({ row }) => {
      const d = row.original.voucherDispatchDetail
      const fare = d?.totalFare ? Number(d.totalFare).toFixed(2) : '-'
      return (
        <div className="text-right pr-4 font-semibold text-foreground">
          {fare}
        </div>
      )
    },
    size: 110,
    meta: { className: cn('w-[110px]') },
    enableSorting: false,
  },
  {
    id: 'actions',
    header: () => <div className="flex justify-center">Bill</div>,
    cell: BillCell,
    minSize: 280,
    size: 320,
    meta: { className: cn('min-w-[280px]') },
    enableSorting: false,
    enableHiding: false,
  },
]
