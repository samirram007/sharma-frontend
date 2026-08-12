import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { useMemo } from 'react'
import { useWatch } from 'react-hook-form'
import type {
  FieldArrayWithId,
  UseFieldArrayRemove,
  UseFormReturn,
} from 'react-hook-form'
import { AlertTriangle, Loader2, Plus, RefreshCw, X } from 'lucide-react'

import StockItemSheetSelect, {
  formatStockInHandBalance,
  type StockInHandBalance,
} from './stock-item-sheet-select'
import VarianceSummaryTable from './variance-summary-table'
import { computeCountLine, computeCountTotals } from '../utils/count-math'

import type {
  PhysicalStockCountForm,
  PhysicalStockCountItem,
  PhysicalStockCountStatus,
} from '../../data/schema'

type PosBodyProps = {
  form: UseFormReturn<PhysicalStockCountForm>
  fields: Array<FieldArrayWithId<PhysicalStockCountForm, 'items', 'id'>>
  remove: UseFieldArrayRemove
  stockItems: Array<{
    id: number
    name: string
    code?: string | null
    standardCost?: number | string | null
    isMaintainSerial?: boolean
    isMaintainBatch?: boolean
  }>
  stockInHandByItem?: Record<number, StockInHandBalance>
  status: PhysicalStockCountStatus
  busy: 'save' | 'populate' | 'verify' | 'adjust' | null
  onPopulate: () => void
  onAddItem: () => void
}

const inputClass =
  'h-8 w-full rounded-md border border-slate-200 bg-white px-2 text-sm text-slate-800 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:border-white/[0.08] dark:bg-secondary dark:text-slate-100'

/** Render a Date (or date string) as the value an <input type="date"> expects. */
const toDateInputValue = (d: Date | string | null | undefined) => {
  if (!d) return ''
  // Already an ISO calendar date — pass through untouched (avoids any
  // UTC-midnight timezone shift when re-displaying API-sourced dates).
  if (typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d)) return d
  const date = new Date(d)
  return isNaN(date.getTime()) ? '' : format(date, 'yyyy-MM-dd')
}

const PosBody = ({
  form,
  fields,
  remove,
  stockItems,
  stockInHandByItem,
  status,
  busy,
  onPopulate,
  onAddItem,
}: PosBodyProps) => {
  const items = useWatch({ control: form.control, name: 'items' }) ?? []
  const godownId = useWatch({ control: form.control, name: 'godownId' })

  // Balances are only available once a godown is selected (pos/index.tsx
  // passes undefined until then) — hide the whole column otherwise.
  const showBalance = stockInHandByItem !== undefined

  const totals = computeCountTotals(items)
  const totalDiff = totals.diff

  // Count rows counted at zero physical quantity (with an item selected) so
  // users notice complete losses before verifying.
  const zeroPhysicalCount = items.filter(
    (it) => it?.stock_item_id && !Number(it?.physical_quantity),
  ).length

  // Serial numbers typed across different rows must be unique. Collect every
  // serial used on more than one row so the Serial inputs can flag them.
  const duplicateSerials = useMemo(() => {
    const counts = new Map<string, number>()
    for (const it of items.filter(Boolean)) {
      const serial = String(it?.serial_no ?? '').trim()
      if (!serial) continue
      counts.set(serial, (counts.get(serial) ?? 0) + 1)
    }
    return new Set([...counts].filter(([, c]) => c > 1).map(([s]) => s))
  }, [items])

  return (
    <div className="flex flex-col gap-2 overflow-y-auto px-4 py-2">
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm text-muted-foreground">
          {items.filter(Boolean).length} item(s)
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={busy !== null}
          onClick={onPopulate}
        >
          {busy === 'populate' ? (
            <Loader2 className="animate-spin" />
          ) : (
            <RefreshCw />
          )}
          Populate System Quantities
        </Button>
      </div>

      {status === 'adjusted' && (
        <div className="rounded-md border bg-card p-3">
          <div className="mb-2 flex items-center justify-between">
            <div className="text-sm font-semibold">
              Stock Adjustment Summary
            </div>
            <span className="rounded-full border border-emerald-300 bg-emerald-50 px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
              Adjusted
            </span>
          </div>
          <VarianceSummaryTable items={items} />
        </div>
      )}

      {/* The zero-quantity warning only matters before the loss is booked. */}
      {status !== 'adjusted' && zeroPhysicalCount > 0 && (
        <div className="flex items-start gap-2 rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:border-amber-800/60 dark:bg-amber-950/40 dark:text-amber-300">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            <span className="font-semibold">{zeroPhysicalCount} item(s)</span>{' '}
            have physical quantity 0 — these will be booked as a complete loss.
            Review them before verifying.
          </span>
        </div>
      )}

      <div className="overflow-x-auto rounded-md border">
        <table className="w-full min-w-[1300px] border-collapse text-sm">
          <thead>
            <tr className="border-b bg-muted/50 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <th className="p-2">#</th>
              <th className="p-2">Stock Item</th>
              <th className="p-2">Batch No</th>
              <th className="p-2">MFG</th>
              <th className="p-2">Expiry</th>
              <th className="p-2">Serial No</th>
              <th className="p-2 text-right">Book Qty</th>
              {showBalance && <th className="p-2 text-right">In Hand</th>}
              <th className="p-2 text-right">Physical Qty</th>
              <th className="p-2 text-right">Diff</th>
              <th className="p-2 text-right">Rate</th>
              <th className="p-2 text-right">Amount</th>
              <th className="p-2">Remarks</th>
              <th className="p-2"></th>
            </tr>
          </thead>
          <tbody>
            {fields.map((field, index) => (
              <ItemRow
                key={field.id}
                form={form}
                index={index}
                stockItems={stockItems}
                stockInHandByItem={stockInHandByItem}
                godownId={godownId}
                showBalance={showBalance}
                duplicateSerials={duplicateSerials}
                remove={remove}
                busy={busy}
              />
            ))}
            {fields.length === 0 && (
              <tr>
                <td
                  colSpan={showBalance ? 14 : 13}
                  className="p-8 text-center text-muted-foreground"
                >
                  No items yet. Populate system quantities or add items
                  manually.
                </td>
              </tr>
            )}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-primary/30 bg-primary/[0.04] font-semibold">
              <td className="p-2" colSpan={6}>
                TOTAL
              </td>
              <td className="p-2 text-right">{totals.book.toFixed(2)}</td>
              {showBalance && (
                // No meaningful sum across different items/units
                <td className="p-2 text-right text-muted-foreground">—</td>
              )}
              <td className="p-2 text-right">{totals.physical.toFixed(2)}</td>
              <td
                className={`p-2 text-right ${
                  totalDiff > 0
                    ? 'text-red-600'
                    : totalDiff < 0
                      ? 'text-emerald-600'
                      : ''
                }`}
              >
                {totalDiff.toFixed(2)}
              </td>
              <td className="p-2 text-right text-muted-foreground">—</td>
              <td className="p-2" colSpan={3}></td>
            </tr>
          </tfoot>
        </table>
      </div>

      <Button
        type="button"
        variant="outline"
        size="sm"
        className="self-start"
        disabled={busy !== null}
        onClick={onAddItem}
      >
        <Plus /> Add Item
      </Button>
    </div>
  )
}

export default PosBody

type ItemRowProps = {
  form: UseFormReturn<PhysicalStockCountForm>
  index: number
  stockItems: Array<{
    id: number
    name: string
    code?: string | null
    standardCost?: number | string | null
    isMaintainSerial?: boolean
    isMaintainBatch?: boolean
  }>
  stockInHandByItem?: Record<number, StockInHandBalance>
  godownId?: number | null
  showBalance: boolean
  duplicateSerials: Set<string>
  remove: UseFieldArrayRemove
  busy: 'save' | 'populate' | 'verify' | 'adjust' | null
}

const ItemRow = ({
  form,
  index,
  stockItems,
  stockInHandByItem,
  godownId,
  showBalance,
  duplicateSerials,
  remove,
  busy,
}: ItemRowProps) => {
  const values = useWatch({
    control: form.control,
    name: `items.${index}`,
  }) as PhysicalStockCountItem | undefined

  const line = computeCountLine(values)
  const { book: systemQty, physical: physicalQty, diff, amount } = line

  const balance = values?.stock_item_id
    ? stockInHandByItem?.[Number(values.stock_item_id)]
    : undefined
  const balanceText = formatStockInHandBalance(balance)

  const serial = String(values?.serial_no ?? '').trim()
  const isDuplicateSerial = serial !== '' && duplicateSerials.has(serial)

  // A row counted at zero physical quantity is a complete loss — give it a
  // distinct tint so missing items are easy to spot. Rows without a selected
  // item are ignored (they're just empty rows).
  const isZeroPhysical = Boolean(values?.stock_item_id) && physicalQty === 0
  const isFullLoss = isZeroPhysical && systemQty > 0

  return (
    <tr
      className={cn(
        'border-t align-top transition-colors',
        isZeroPhysical && 'bg-red-50/70 dark:bg-red-950/20',
      )}
    >
      <td className="p-1 pl-2 text-muted-foreground">{index + 1}</td>
      <td className="p-1">
        <StockItemSheetSelect
          form={form}
          index={index}
          stockItems={stockItems}
          stockInHandByItem={stockInHandByItem}
          godownId={godownId}
          disabled={busy !== null}
        />
      </td>
      <td className="p-1">
        <input
          type="text"
          placeholder="Batch"
          disabled={busy !== null}
          {...form.register(`items.${index}.batch_no`)}
          className={inputClass}
        />
      </td>
      <td className="p-1">
        <DateCellInput form={form} index={index} name="mfg_date" busy={busy} />
      </td>
      <td className="p-1">
        <DateCellInput
          form={form}
          index={index}
          name="expiry_date"
          busy={busy}
        />
      </td>
      <td className="p-1">
        <input
          type="text"
          placeholder="Serial"
          disabled={busy !== null}
          aria-invalid={isDuplicateSerial}
          {...form.register(`items.${index}.serial_no`)}
          className={cn(
            inputClass,
            isDuplicateSerial &&
              'border-red-400 focus:border-red-400 focus:ring-red-100',
          )}
        />
        {isDuplicateSerial && (
          <div className="mt-0.5 text-[10px] font-medium text-red-600">
            Duplicate serial
          </div>
        )}
      </td>
      <td className="p-1 text-right tabular-nums">{systemQty.toFixed(2)}</td>
      {showBalance && (
        <td className="p-1 text-right tabular-nums text-muted-foreground">
          {balanceText}
        </td>
      )}
      <td className="p-1">
        <input
          type="number"
          step="any"
          min={0}
          disabled={busy !== null}
          {...form.register(`items.${index}.physical_quantity`, {
            valueAsNumber: true,
          })}
          className={`${inputClass} text-right`}
        />
      </td>
      <td className="p-1 text-right">
        <div
          className={`font-semibold tabular-nums ${
            diff > 0
              ? 'text-red-600'
              : diff < 0
                ? 'text-emerald-600'
                : 'text-muted-foreground'
          }`}
        >
          {diff.toFixed(2)}
        </div>
        {diff !== 0 && (
          <div
            className={`text-[10px] font-semibold uppercase tracking-wide ${
              diff > 0 ? 'text-red-600' : 'text-emerald-600'
            }`}
          >
            {isFullLoss ? 'Full Loss' : diff > 0 ? 'Loss' : 'Surplus'}
          </div>
        )}
      </td>
      <td className="p-1">
        <input
          type="number"
          step="any"
          min={0}
          disabled={busy !== null}
          {...form.register(`items.${index}.rate`, { valueAsNumber: true })}
          className={`${inputClass} text-right`}
        />
      </td>
      <td className="p-1 text-right tabular-nums">{amount.toFixed(2)}</td>
      <td className="p-1">
        <input
          type="text"
          disabled={busy !== null}
          {...form.register(`items.${index}.remarks`)}
          className={inputClass}
        />
      </td>
      <td className="p-1 pr-2 text-center">
        <button
          type="button"
          aria-label="Remove item"
          disabled={busy !== null}
          onClick={() => remove(index)}
          className="rounded p-1 text-red-500 transition hover:bg-red-50 hover:text-red-700 disabled:opacity-40"
        >
          <X />
        </button>
      </td>
    </tr>
  )
}

type DateCellInputProps = {
  form: UseFormReturn<PhysicalStockCountForm>
  index: number
  name: 'mfg_date' | 'expiry_date'
  busy: 'save' | 'populate' | 'verify' | 'adjust' | null
}

/** Controlled <input type="date"> that stores a Date (or null) in the form. */
const DateCellInput = ({ form, index, name, busy }: DateCellInputProps) => {
  const value = useWatch({
    control: form.control,
    name: `items.${index}.${name}`,
  }) as Date | string | null | undefined

  return (
    <input
      type="date"
      disabled={busy !== null}
      value={toDateInputValue(value)}
      onChange={(e) =>
        form.setValue(
          `items.${index}.${name}`,
          e.target.value ? new Date(e.target.value) : null,
          { shouldDirty: true },
        )
      }
      className={`${inputClass} text-right`}
    />
  )
}
