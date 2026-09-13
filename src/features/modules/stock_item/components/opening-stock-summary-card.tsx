import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/features/auth/contexts/AuthContext'
import {
  OpeningStockVoucherQueryOptions,
  OpeningStockQueryOptions,
  openingStockVoucherTypeQueryOptions,
} from '@/features/modules/voucher/opening_stock/data/queryOptions'
import type { OpeningStockVoucher } from '@/features/modules/voucher/opening_stock/data/schema'
import { formatQty } from '@/utils/format-num'
import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import {
  Archive,
  ArrowRight,
  Boxes,
  CalendarDays,
  Loader2,
  MapPin,
} from 'lucide-react'

const OPENING_STOCK_ROUTE = '/transactions/vouchers/opening_stock'
const OPENING_STOCK_VOUCHER_ROUTE = '/transactions/vouchers/opening_stock/$id'

type OpeningStockRow = {
  quantity: number
  rate: number
  amount: number
  godownName: string
  batchNo?: string | null
}

/**
 * Flattens the OPNSK voucher's stock journal into per-godown rows for one
 * item. Only 'in' rows count (opening stock is always a stock-in journal;
 * normalizeStockJournalMovementType guards legacy 'out' rows at save time,
 * but defensive filtering here keeps stray OUT rows out of the totals).
 */
function extractOpeningStockRows(
  voucher: OpeningStockVoucher | undefined,
  itemId: number,
): OpeningStockRow[] {
  if (!voucher?.stockJournal?.stockJournalEntries) return []

  const rows: OpeningStockRow[] = []
  for (const entry of voucher.stockJournal.stockJournalEntries) {
    if (!entry || entry.stockItemId !== itemId) continue
    if (entry.movementType && entry.movementType !== 'in') continue

    const godownEntries = (entry.stockJournalGodownEntries ?? []).filter(
      Boolean,
    )

    if (godownEntries.length === 0) {
      rows.push({
        quantity: Number(entry.actualQuantity ?? 0),
        rate: Number(entry.rate ?? 0),
        amount: Number(entry.amount ?? 0),
        godownName: '—',
      })
      continue
    }

    for (const ge of godownEntries) {
      if (!ge || (ge.movementType && ge.movementType !== 'in')) continue
      rows.push({
        quantity: Number(ge.actualQuantity ?? 0),
        rate: Number(ge.rate ?? entry.rate ?? 0),
        amount: Number(ge.amount ?? 0),
        godownName: ge.godown?.name ?? '—',
        batchNo: ge.batchNo,
      })
    }
  }
  return rows
}

function formatVoucherDate(date?: Date | string | null): string {
  if (!date) return '—'
  const d = new Date(date)
  return isNaN(d.getTime()) ? '—' : d.toLocaleDateString('en-IN')
}

function Stat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="space-y-1 rounded-md bg-slate-50 px-3 py-2 dark:bg-white/[0.04]">
      <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
        {icon}
        {label}
      </div>
      <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">
        {value}
      </div>
    </div>
  )
}

interface Props {
  /** Existing stock item id — the card is only rendered in edit mode. */
  itemId: number
  /** Item's unit for the quantity label (code + decimal places). */
  unitCode?: string | null
  noOfDecimalPlaces?: number | null
}

/**
 * Read-only summary of this item's opening stock for the current fiscal year,
 * sourced from the ONE Opening Stock (OPNSK) voucher per fiscal year — the
 * same source Stock Summary reports count. Editing happens on the Opening
 * Stock screen (Transactions → Opening Stock), which the card links to.
 */
export default function OpeningStockSummaryCard({
  itemId,
  unitCode,
  noOfDecimalPlaces,
}: Props) {
  const { userFiscalYear } = useAuth()
  const currentFyId = userFiscalYear?.fiscalYearId

  // OPNSK type id is resolved at runtime (not stable across databases) —
  // same lookup the Opening Stock screen and the create-flow recorder use.
  const { data: openingStockType, isPending: isTypePending } = useQuery(
    openingStockVoucherTypeQueryOptions(),
  )
  const openingStockTypeId = openingStockType?.data?.id

  // Reuse the shared list query (same key as the Opening Stock screen) so the
  // card costs nothing extra when the screen was visited before, and warms
  // its cache when it wasn't. The list is tiny — one voucher per fiscal year.
  // NOTE: isLoading is `isPending && isFetching` — a disabled query reports
  // isLoading:false, which would flash the empty state during the type lookup.
  // Use isPending (gated on the type id existing) for the loading state.
  const { data: existingVouchers, isPending: isListPending } = useQuery({
    ...OpeningStockVoucherQueryOptions(openingStockTypeId),
    enabled: !!openingStockTypeId,
  })

  const voucher = (existingVouchers ?? []).find(
    (v) => v.fiscalYearId === currentFyId,
  )
  // The list row already carries the voucher number (OpeningStockVoucherListItemSchema)
  // — the detail fetch only adds the journal entries.

  // The list endpoint serves vouchers SHALLOWLY (no journal entries — see
  // OpeningStockVoucherListItemSchema). The item's rows live on the full
  // voucher, so fetch its detail. Plain useQuery (not useSuspenseQuery) so
  // the card never suspends inside the stock item form, while still sharing
  // the cache with the transaction $id route's suspense query.
  const { data: voucherDetail, isLoading: isLoadingDetail } = useQuery({
    ...OpeningStockQueryOptions(voucher?.id ?? undefined),
    enabled: !!voucher?.id,
  })

  const rows = extractOpeningStockRows(
    voucherDetail?.data as OpeningStockVoucher | undefined,
    itemId,
  )

  const totalQty = rows.reduce((sum, r) => sum + r.quantity, 0)
  const totalValue = rows.reduce((sum, r) => sum + r.amount, 0)
  // Weighted average rate (value ÷ qty) — rows may carry different rates.
  const avgRate = totalQty > 0 ? totalValue / totalQty : 0

  // ── Loading / empty states ─────────────────────────────────────────────
  // Pending while: the OPNSK type lookup is in flight, the list hasn't
  // arrived yet (only when a type id exists — a missing OPNSK type disables
  // the list forever), or the voucher detail is loading for a found voucher.
  const isLoadingCard =
    isTypePending ||
    (!!openingStockTypeId && isListPending) ||
    Boolean(voucher?.id && isLoadingDetail)
  if (isLoadingCard) {
    return (
      <section className="flex items-center gap-2 rounded-md border border-slate-200/70 bg-white p-3 sm:p-4 dark:border-white/[0.07] dark:bg-white/[0.06]">
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        <span className="text-xs text-slate-500 dark:text-slate-400">
          Loading opening stock…
        </span>
      </section>
    )
  }

  if (rows.length === 0) {
    return (
      <section className="rounded-md border border-dashed border-slate-200/70 bg-white p-3 sm:p-4 dark:border-white/[0.07] dark:bg-white/[0.06]">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="space-y-0.5">
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              Opening Stock
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              No opening stock recorded for this item in the current fiscal
              year.
            </p>
          </div>
          <Button asChild size="sm" variant="outline">
            <Link to={OPENING_STOCK_ROUTE}>
              Add in Opening Stock
              <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      </section>
    )
  }

  // ── Populated card ─────────────────────────────────────────────────────
  const voucherNo =
    voucherDetail?.data?.voucherNo ?? voucher?.voucherNo ?? undefined

  return (
    <section className="space-y-3 rounded-md border border-slate-200/70 bg-white p-3 sm:p-4 dark:border-white/[0.07] dark:bg-white/[0.06]">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              Opening Stock
            </h3>
            {voucherNo && (
              <Badge variant="secondary" className="font-mono text-[11px]">
                {voucherNo}
              </Badge>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Read-only — recorded on the opening stock voucher for the current
            fiscal year.
          </p>
        </div>
        <Button asChild size="sm" variant="outline">
          {voucher?.id ? (
            <Link
              to={OPENING_STOCK_VOUCHER_ROUTE}
              params={{ id: voucher.id }}
            >
              Edit in Opening Stock
              <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Link>
          ) : (
            <Link to={OPENING_STOCK_ROUTE}>
              Edit in Opening Stock
              <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Link>
          )}
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat
          icon={<Boxes className="h-3.5 w-3.5" />}
          label="Quantity"
          value={formatQty(totalQty, noOfDecimalPlaces, unitCode)}
        />
        <Stat
          icon={<Archive className="h-3.5 w-3.5" />}
          label="Avg Rate"
          value={formatQty(avgRate, 2)}
        />
        <Stat
          icon={<Archive className="h-3.5 w-3.5" />}
          label="Value"
          value={formatQty(totalValue, 2)}
        />
        <Stat
          icon={<CalendarDays className="h-3.5 w-3.5" />}
          label="Date"
          value={formatVoucherDate(voucherDetail?.data?.voucherDate)}
        />
      </div>

      {/* Per-godown breakdown — only when there is more than one row, or a
          batch number is present, so a simple single-godown row stays clean. */}
      {(rows.length > 1 || rows.some((r) => r.batchNo)) && (
        <div className="overflow-hidden rounded-md border border-slate-200/70 dark:border-white/[0.07]">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-slate-50 text-left text-slate-500 dark:bg-white/[0.04] dark:text-slate-400">
                <th className="px-3 py-1.5 font-medium">Godown</th>
                <th className="px-3 py-1.5 font-medium">Batch</th>
                <th className="px-3 py-1.5 text-right font-medium">Qty</th>
                <th className="px-3 py-1.5 text-right font-medium">Rate</th>
                <th className="px-3 py-1.5 text-right font-medium">Value</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr
                  key={`${row.godownName}-${row.batchNo ?? i}`}
                  className="border-t border-slate-100 dark:border-white/[0.05]"
                >
                  <td className="px-3 py-1.5 text-slate-700 dark:text-slate-300">
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-muted-foreground" />
                      {row.godownName}
                    </span>
                  </td>
                  <td className="px-3 py-1.5 text-slate-500 dark:text-slate-400">
                    {row.batchNo ? (
                      <Badge variant="secondary">{row.batchNo}</Badge>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="px-3 py-1.5 text-right text-slate-700 dark:text-slate-300">
                    {formatQty(row.quantity, noOfDecimalPlaces)}
                  </td>
                  <td className="px-3 py-1.5 text-right text-slate-500 dark:text-slate-400">
                    {formatQty(row.rate, 2)}
                  </td>
                  <td className="px-3 py-1.5 text-right text-slate-700 dark:text-slate-300">
                    {formatQty(row.amount, 2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
