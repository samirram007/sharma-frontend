import { Badge } from '@/components/ui/badge'
import type {
  StockJournalEntryForm,
  StockJournalGodownEntryForm,
} from '../../data-schema/voucher-schema'
import { format } from 'date-fns'
import { Package, ArrowDownCircle, ArrowUpCircle } from 'lucide-react'
import { formatLocale } from '@/utils/format-num'
import { isProductionEntry } from './columns'

interface MovementDetailsProps {
  stockJournalEntries?: (StockJournalEntryForm | null)[]
}

function formatDate(value: string | Date | null | undefined) {
  if (!value) return '—'
  const date = new Date(value)
  if (isNaN(date.getTime())) return '—'
  return format(date, 'dd-MMM-yyyy')
}

const formatQty = formatLocale
const formatAmt = formatLocale

function MovementBadge({ entry }: { entry: { movementType?: string | null } }) {
  const isIn = isProductionEntry(entry as StockJournalEntryForm)
  return isIn ? (
    <Badge className="gap-1 bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900">
      <ArrowDownCircle className="h-3 w-3" /> IN · Produced
    </Badge>
  ) : (
    <Badge className="gap-1 bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-900">
      <ArrowUpCircle className="h-3 w-3" /> OUT · Consumed
    </Badge>
  )
}

function GodownBatchRow({ entry }: { entry: StockJournalGodownEntryForm }) {
  return (
    <tr className="border-b border-slate-100 dark:border-slate-800 last:border-0 hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
      <td className="py-2 pl-10 pr-2 text-xs">
        <div className="flex items-center gap-2">
          <MovementBadge entry={entry} />
        </div>
      </td>
      <td className="py-2 px-2 text-xs text-muted-foreground">
        {entry.godown?.name ?? <span className="italic">—</span>}
      </td>
      <td className="py-2 px-2 text-xs">
        {entry.batchNo ? (
          <Badge
            variant="outline"
            className="text-[10px] px-1.5 py-0 font-mono bg-blue-50 dark:bg-blue-950/30"
          >
            {entry.batchNo}
          </Badge>
        ) : (
          <span className="text-muted-foreground italic">—</span>
        )}
      </td>
      <td className="py-2 px-2 text-xs tabular-nums text-right">
        {formatDate(entry.mfgDate)}
      </td>
      <td className="py-2 px-2 text-xs tabular-nums text-right">
        {formatDate(entry.expiryDate)}
      </td>
      <td className="py-2 px-2 text-xs tabular-nums text-right font-medium">
        {formatQty(entry.actualQuantity)}
      </td>
      <td className="py-2 px-2 text-xs tabular-nums text-right">
        {formatQty(entry.billingQuantity)}
      </td>
      <td className="py-2 px-2 text-xs tabular-nums text-right">
        {formatQty(entry.rate)}
      </td>
      <td className="py-2 pl-2 pr-4 text-xs tabular-nums text-right font-semibold">
        {formatAmt(entry.amount)}
      </td>
    </tr>
  )
}

export function MovementDetails({ stockJournalEntries }: MovementDetailsProps) {
  if (!stockJournalEntries || stockJournalEntries.length === 0) {
    return (
      <div className="px-4 py-3 text-sm text-muted-foreground italic">
        No stock items found for this conversion journal.
      </div>
    )
  }

  return (
    <div className="px-4 py-3 space-y-4">
      <div>
        <h4 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
          <Package className="h-3.5 w-3.5" />
          Consumption (OUT) &amp; Production (IN) Lines
        </h4>

        {stockJournalEntries.map((entry, ei) => {
          if (!entry) return null
          const godownEntries = entry.stockJournalGodownEntries?.filter(
            Boolean,
          ) as StockJournalGodownEntryForm[] | undefined

          return (
            <div
              key={entry.id ?? ei}
              className="mb-3 rounded-lg border border-slate-200/70 dark:border-slate-700/50 bg-white/60 dark:bg-slate-900/40 overflow-hidden"
            >
              {/* Item Header */}
              <div className="flex items-center justify-between px-4 py-2 bg-slate-50/80 dark:bg-slate-800/50 border-b border-slate-200/50 dark:border-slate-700/30">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
                    {entry.stockItem?.name ?? `Item #${entry.stockItemId}`}
                  </span>
                  {entry.stockItem?.code && (
                    <Badge
                      variant="secondary"
                      className="text-[10px] px-1.5 py-0 font-mono"
                    >
                      {entry.stockItem.code}
                    </Badge>
                  )}
                  <MovementBadge entry={entry} />
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>
                    Qty:{' '}
                    <strong className="text-slate-700 dark:text-slate-300">
                      {formatQty(entry.actualQuantity)}
                    </strong>
                  </span>
                  <span>
                    Rate:{' '}
                    <strong className="text-slate-700 dark:text-slate-300">
                      {formatQty(entry.rate)}
                    </strong>
                  </span>
                  <span>
                    Amount:{' '}
                    <strong className="text-slate-700 dark:text-slate-300">
                      {formatAmt(entry.amount)}
                    </strong>
                  </span>
                </div>
              </div>

              {/* Godown Batches Table */}
              {godownEntries && godownEntries.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/20">
                        <th className="py-1.5 pl-10 pr-2 text-left font-medium text-muted-foreground">
                          Movement
                        </th>
                        <th className="py-1.5 px-2 text-left font-medium text-muted-foreground">
                          Godown
                        </th>
                        <th className="py-1.5 px-2 text-left font-medium text-muted-foreground">
                          Batch No
                        </th>
                        <th className="py-1.5 px-2 text-right font-medium text-muted-foreground">
                          Mfg Date
                        </th>
                        <th className="py-1.5 px-2 text-right font-medium text-muted-foreground">
                          Expiry Date
                        </th>
                        <th className="py-1.5 px-2 text-right font-medium text-muted-foreground">
                          Act. Qty
                        </th>
                        <th className="py-1.5 px-2 text-right font-medium text-muted-foreground">
                          Bill. Qty
                        </th>
                        <th className="py-1.5 px-2 text-right font-medium text-muted-foreground">
                          Rate
                        </th>
                        <th className="py-1.5 pl-2 pr-4 text-right font-medium text-muted-foreground">
                          Amount
                        </th>
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
                <div className="px-4 py-2 text-xs text-muted-foreground italic">
                  No godown/batch details for this item.
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
