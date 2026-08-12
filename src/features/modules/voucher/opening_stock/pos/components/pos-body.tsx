import { Form } from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { useTransaction } from '@/features/transactions/context/transaction-context'
import { IconCalculator, IconCheck, IconCopy } from '@tabler/icons-react'
import { zodResolver } from '@hookform/resolvers/zod'
import isEqual from 'lodash/isEqual'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'
import {
  useForm,
  useWatch,
  type Resolver,
  type UseFormReturn,
} from 'react-hook-form'

import StockJournal from '../../../components/stock-journal'
import {
  stockJournalSchema,
  type StockJournalForm,
} from '../../../data-schema/voucher-schema'
import type { OpeningStockVoucherForm } from '../../data/schema'

type PosBodyProps = {
  mainForm: UseFormReturn<OpeningStockVoucherForm>
  /** Scroll container ref — used to bring the imported rows into view after a fetch. */
  scrollRef?: React.RefObject<HTMLDivElement | null>
}

// Mirrors the entry grid column widths so the summary numbers line up
// directly under their columns (Particulars | Qty | Rate | per | disc% | Amount | Action).
const SUMMARY_GRID_COLS = 'grid-cols-[1fr_280px_130px_70px_70px_180px_120px]'

const PosBody = ({ mainForm, scrollRef }: PosBodyProps) => {
  const { config } = useTransaction()
  const showActualBilling = config.find(
    (c) => c.key === 'show_actual_and_billing_quantity',
  )?.value

  const stockJournal = mainForm.watch('stockJournal')
  const stockJournalForm = useForm<StockJournalForm>({
    resolver: zodResolver(stockJournalSchema) as Resolver<StockJournalForm>,
    defaultValues: {
      ...stockJournal,
      stockJournalEntries: stockJournal?.stockJournalEntries ?? [],
    },
  })

  const stockJournalEntries = useWatch({
    control: stockJournalForm.control,
    name: 'stockJournalEntries',
  })

  const totals = useMemo(() => {
    const entries = (stockJournalEntries ?? []).filter(
      (entry): entry is NonNullable<typeof entry> => Boolean(entry),
    )

    let openingTotal = 0
    let openingQty = 0
    let billingQty = 0
    let totalDiscount = 0
    let itemCount = 0
    let unit = ''
    let decimalPlaces = 2

    for (const entry of entries) {
      openingTotal += Number(entry?.amount) || 0
      openingQty += Number(entry?.actualQuantity) || 0
      billingQty += Number(entry?.billingQuantity) || 0
      totalDiscount += Number(entry?.discount) || 0
      if (entry?.stockItemId || entry?.stockItem?.id) itemCount += 1
      if (!unit) {
        unit =
          entry?.stockUnit?.code ??
          entry?.rateUnit?.code ??
          entry?.stockItem?.stockUnit?.code ??
          ''
        const qtyUnit =
          entry?.stockUnit ?? entry?.rateUnit ?? entry?.stockItem?.stockUnit
        if (qtyUnit?.noOfDecimalPlaces != null) {
          decimalPlaces = qtyUnit.noOfDecimalPlaces
        }
      }
    }

    // Round summed quantities so float additions never leak into the summary.
    const factor = Math.pow(10, decimalPlaces)

    return {
      openingTotal,
      openingQty: Math.round(openingQty * factor) / factor,
      billingQty: Math.round(billingQty * factor) / factor,
      totalDiscount,
      itemCount,
      // Weighted average rate across all entries (matches the per-row rate).
      avgRate: openingQty > 0 ? openingTotal / openingQty : 0,
      unit,
      decimalPlaces,
    }
  }, [stockJournalEntries])

  const [copied, setCopied] = useState(false)

  // Builds a compact human-readable summary of the entry grid and copies it
  // to the clipboard (navigator API with an execCommand fallback).
  const copySummary = useCallback(async () => {
    const text = [
      'Opening Stock Summary',
      '----------------------',
      `Items: ${totals.itemCount}`,
      `Total Quantity: ${totals.openingQty.toFixed(totals.decimalPlaces)}${
        totals.unit ? ` ${totals.unit}` : ''
      }`,
      `Average Rate: ${totals.avgRate.toFixed(2)}${
        totals.unit ? ` / ${totals.unit}` : ''
      }`,
      `Total Discount: ${totals.totalDiscount.toFixed(2)}`,
      `Total Amount: ${totals.openingTotal.toFixed(2)}`,
    ].join('\n')

    try {
      await navigator.clipboard.writeText(text)
    } catch {
      const ta = document.createElement('textarea')
      ta.value = text
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
    }

    setCopied(true)
    toast.success('Summary copied to clipboard')
    window.setTimeout(() => setCopied(false), 1500)
  }, [totals])

  // Sync: parent -> child (when the parent form value changes externally)
  const parentStockJournal = mainForm.watch('stockJournal')
  const lastParentStockJournalRef = useRef<unknown>(null)
  useEffect(() => {
    // Only push parent -> child when the parent value genuinely changes.
    // Skipping the initial snapshot stops the StrictMode double-effect from
    // resetting the sub-form with a stale value and wiping auto-added rows.
    const currentParent = mainForm.getValues('stockJournal')
    if (lastParentStockJournalRef.current === null) {
      lastParentStockJournalRef.current = currentParent
      return
    }
    if (!isEqual(lastParentStockJournalRef.current, currentParent)) {
      lastParentStockJournalRef.current = currentParent
      if (
        currentParent &&
        !isEqual(currentParent, stockJournalForm.getValues())
      ) {
        stockJournalForm.reset(currentParent)
      }
    }
  }, [parentStockJournal, mainForm, stockJournalForm])

  // Sync: child -> parent (when the stock journal sub-form changes)
  useEffect(() => {
    const subscription = stockJournalForm.watch((value) => {
      const currentParent = mainForm.getValues('stockJournal')
      if (!isEqual(currentParent, value)) {
        mainForm.setValue('stockJournal', value as StockJournalForm, {
          shouldValidate: false,
        })
      }
    })

    return () => subscription.unsubscribe()
  }, [mainForm, stockJournalForm])

  return (
    <div className="flex min-h-0 w-full flex-col">
      {/* Scrollable entry grid */}
      <div
        ref={scrollRef}
        className="min-h-0 w-full flex-1 overflow-y-scroll px-2"
      >
        <div className="grid w-full grid-cols-1 items-start gap-2 px-2">
          <Form {...stockJournalForm}>
            <StockJournal stockJournalForm={stockJournalForm} />
          </Form>
        </div>
      </div>

      {/* Pinned summary bar — always visible above the footer */}
      <div className="shrink-0 border-t-2 border-gray-300 bg-gray-100/80 px-2 py-2 dark:border-gray-700 dark:bg-gray-900/50">
        <div className={`${SUMMARY_GRID_COLS} grid items-center gap-0 text-sm`}>
          <div className="flex items-center gap-1.5 px-2 font-semibold text-muted-foreground">
            <IconCalculator className="h-4 w-4" />
            <span>Totals</span>
            <span className="font-medium">({totals.itemCount} item(s))</span>
          </div>
          {showActualBilling ? (
            <div className="grid grid-cols-2 pr-3 text-right font-bold text-emerald-700">
              <div>
                {totals.openingQty.toFixed(totals.decimalPlaces)}
                {totals.unit ? ` ${totals.unit}` : ''}
              </div>
              <div>
                {totals.billingQty.toFixed(totals.decimalPlaces)}
                {totals.unit ? ` ${totals.unit}` : ''}
              </div>
            </div>
          ) : (
            <div className="pr-3 text-right font-bold text-emerald-700">
              {totals.openingQty.toFixed(totals.decimalPlaces)}
              {totals.unit ? ` ${totals.unit}` : ''}
            </div>
          )}
          <div className="pr-3 text-right font-bold">
            {totals.avgRate.toFixed(2)}
          </div>
          <div className="text-center font-semibold text-muted-foreground">
            {totals.unit || '–'}
          </div>
          <div className="pr-3 text-right text-xs font-bold">
            {totals.totalDiscount.toFixed(2)}
          </div>
          <div className="pr-3 text-right font-bold text-emerald-700">
            {totals.openingTotal.toFixed(2)}
          </div>
          <div className="flex items-center justify-end pr-3">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              title="Copy summary to clipboard"
              onClick={copySummary}
            >
              {copied ? (
                <IconCheck className="h-4 w-4 text-emerald-600" />
              ) : (
                <IconCopy className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PosBody
