import BillCell from './bill-cell'
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
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue('voucherNo')}</div>
    ),
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
    id: 'dispatchNo',
    header: () => <div>Dispatch No.</div>,
    cell: ({ row }) => {
      const d = row.original.voucherDispatchDetail
      return (
        <div className="text-muted-foreground">{d?.billOfLadingNo ?? '-'}</div>
      )
    },
    minSize: 100,
    size: 120,
    meta: { className: cn('min-w-[100px] hidden lg:table-cell') },
    enableSorting: false,
  },
  {
    id: 'source',
    header: () => <div>Source</div>,
    cell: ({ row }) => {
      const d = row.original.voucherDispatchDetail
      return <div className="text-muted-foreground">{d?.source ?? '-'}</div>
    },
    minSize: 120,
    size: 130,
    meta: { className: cn('min-w-[120px] hidden lg:table-cell') },
    enableSorting: false,
  },
  {
    id: 'destination',
    header: () => <div>Destination</div>,
    cell: ({ row }) => {
      const d = row.original.voucherDispatchDetail
      const dest = [d?.destination, d?.destinationSecondary]
        .filter(Boolean)
        .join(', ')
      return <div className="text-xs text-muted-foreground">{dest || '-'}</div>
    },
    minSize: 120,
    size: 140,
    meta: { className: cn('min-w-[120px] hidden lg:table-cell') },
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
    id: 'carrier',
    header: () => <div>Carrier Name</div>,
    cell: ({ row }) => {
      const d = row.original.voucherDispatchDetail
      return <div className="text-foreground/80">{d?.carrierName ?? '-'}</div>
    },
    minSize: 130,
    size: 145,
    meta: { className: cn('min-w-[130px] hidden lg:table-cell') },
    enableSorting: false,
  },
  {
    id: 'vehicleNo',
    header: () => <div>Vehicle No.</div>,
    cell: ({ row }) => {
      const d = row.original.voucherDispatchDetail
      return (
        <div className="text-xs text-muted-foreground">
          {d?.motorVehicleNo ?? '-'}
        </div>
      )
    },
    minSize: 100,
    size: 115,
    meta: { className: cn('min-w-[100px] hidden lg:table-cell') },
    enableSorting: false,
  },
  {
    id: 'weight',
    header: () => <div className="text-right pr-4">Weight (Mt)</div>,
    cell: ({ row }) => {
      const d = row.original.voucherDispatchDetail

      const weight = d?.weight
        ? Number(d.weight).toFixed(d.weightUnit?.noOfDecimalPlaces ?? 2)
        : '-'
      return (
        <div className="px-4 text-right text-foreground/80 font-medium">
          {weight}
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
