'use client'

import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { cn } from '@/lib/utils'
import { getData } from '@/utils/dataClient'
import { CheckIcon, ChevronsUpDownIcon } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useWatch, type UseFormReturn } from 'react-hook-form'

import type {
  PhysicalStockCountForm,
  PhysicalStockCountItem,
} from '../../data/schema'

/** System balance of an item at the selected count godown. */
export type StockInHandBalance = {
  quantity: number
  unitCode?: string | null
  noOfDecimalPlaces?: number
}

/** Format a balance as `qty unitCode` (or '—' when none). */
export const formatStockInHandBalance = (balance?: StockInHandBalance) => {
  if (!balance) return '—'
  const qty = balance.quantity.toFixed(balance.noOfDecimalPlaces ?? 2)
  return balance.unitCode ? `${qty} ${balance.unitCode}` : qty
}

type StockItemSheetSelectProps = {
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
  /** itemId → system balance at the count godown (shown in the picker). */
  stockInHandByItem?: Record<number, StockInHandBalance>
  /** Count godown — used to look up the item's batches for auto-fill. */
  godownId?: number | null
  disabled?: boolean
}

const StockItemSheetSelect = ({
  form,
  index,
  stockItems,
  stockInHandByItem,
  godownId,
  disabled = false,
}: StockItemSheetSelectProps) => {
  const [open, setOpen] = useState(false)
  const values = useWatch({
    control: form.control,
    name: `items.${index}`,
  }) as PhysicalStockCountItem | undefined

  const selectedId = values?.stock_item_id?.toString()
  const selected =
    values?.stock_item ??
    (values?.stock_item_id
      ? stockItems.find((s) => s.id === Number(values.stock_item_id))
      : undefined)

  // Items that actually have stock at the count godown go first so counters
  // can find them quickly. Without a godown there are no balances, so the
  // natural order is kept. Array#sort is stable, so relative order within
  // each group is preserved.
  const sortedStockItems = useMemo(() => {
    if (stockInHandByItem === undefined) return stockItems
    const hasStock = (item: { id: number }) =>
      (stockInHandByItem[item.id]?.quantity ?? 0) > 0
    return [...stockItems].sort(
      (a, b) => Number(hasStock(b)) - Number(hasStock(a)),
    )
  }, [stockItems, stockInHandByItem])

  const handleSelect = (value: string) => {
    const item = stockItems.find((s) => s.id === Number(value))
    form.setValue(`items.${index}.stock_item_id`, Number(value), {
      shouldValidate: true,
      shouldDirty: true,
    })
    form.setValue(`items.${index}.stock_item`, item ?? undefined, {
      shouldValidate: true,
      shouldDirty: true,
    })
    // A new item invalidates item-specific data (batch, dates, quantities,
    // remarks) — clear them so nothing stale carries over. The rate is
    // auto-filled from the item's standard cost (a batch-level rate may be
    // filled when system quantities are populated).
    form.setValue(`items.${index}.batch_no`, '', { shouldDirty: true })
    form.setValue(`items.${index}.serial_no`, '', { shouldDirty: true })
    form.setValue(`items.${index}.mfg_date`, null, { shouldDirty: true })
    form.setValue(`items.${index}.expiry_date`, null, { shouldDirty: true })
    form.setValue(`items.${index}.system_quantity`, 0, { shouldDirty: true })
    // Serial-numbered items are counted one unit at a time, so default the
    // physical quantity to 1; every other item starts at 0.
    form.setValue(`items.${index}.physical_quantity`, item?.isMaintainSerial ? 1 : 0, {
      shouldDirty: true,
    })
    form.setValue(`items.${index}.rate`, Number(item?.standardCost) || 0, {
      shouldDirty: true,
    })
    form.setValue(`items.${index}.remarks`, '', { shouldDirty: true })

    // Batch-maintained items: when the item has exactly one batch at the
    // count godown, auto-fill the batch fields with it. With multiple batches
    // we leave them blank so the counter picks the right one.
    if (item?.isMaintainBatch && godownId) {
      void (async () => {
        try {
          const res = await getData(
            `/godown_item_batches/${item.id}/${godownId}`,
          )
          const batches = (res?.data ?? []) as Array<{
            batchNo?: string
            mfgDate?: string | null
            expiryDate?: string | null
          }>
          if (batches.length !== 1) return
          // Guard against a stale response if the user already switched items.
          if (form.getValues(`items.${index}.stock_item_id`) !== item.id) return

          form.setValue(`items.${index}.batch_no`, batches[0]?.batchNo ?? '', {
            shouldDirty: true,
          })
          const mfg = batches[0]?.mfgDate ? new Date(batches[0].mfgDate) : null
          if (mfg && !isNaN(mfg.getTime())) {
            form.setValue(`items.${index}.mfg_date`, mfg, {
              shouldDirty: true,
            })
          }
          const exp = batches[0]?.expiryDate
            ? new Date(batches[0].expiryDate)
            : null
          if (exp && !isNaN(exp.getTime())) {
            form.setValue(`items.${index}.expiry_date`, exp, {
              shouldDirty: true,
            })
          }
        } catch {
          // Leave the batch fields blank — they can be typed manually.
        }
      })()
    }

    setOpen(false)
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className="w-full justify-between font-normal"
        >
          {selected
            ? `${selected.name}${selected.code ? ` (${selected.code})` : ''}`
            : 'Select item...'}
          <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </SheetTrigger>
      <SheetContent className="min-w-[450px]! p-0">
        <SheetHeader>
          <SheetTitle>Search Item</SheetTitle>
          <SheetDescription>
            Select the stock item for this count row.
          </SheetDescription>
        </SheetHeader>
        <Command className="min-w-full rounded-lg border shadow-md">
          <CommandInput placeholder="Search item..." />
          <CommandList className="max-h-full">
            <CommandEmpty>No item found.</CommandEmpty>
            {stockInHandByItem === undefined ? (
              <div className="border-b px-3 py-1.5 text-[11px] text-muted-foreground">
                Select a godown first to see stock balances.
              </div>
            ) : (
              <div className="flex items-center justify-between gap-3 border-b px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                <span>Item</span>
                <span>In hand</span>
              </div>
            )}
            <CommandGroup>
              {sortedStockItems.map((item) => {
                const balanceText = formatStockInHandBalance(
                  stockInHandByItem?.[item.id],
                )
                return (
                  <CommandItem
                    key={item.id}
                    value={item.name.toLowerCase()}
                    onSelect={() => handleSelect(String(item.id))}
                  >
                    <CheckIcon
                      className={cn(
                        'mr-2 h-4 w-4',
                        selectedId === String(item.id)
                          ? 'opacity-100'
                          : 'opacity-0',
                      )}
                    />
                    <div className="flex w-full flex-row items-center justify-between gap-3">
                      <div className="flex flex-col">
                        <div>{item.name}</div>
                        {item.code ? (
                          <div className="text-xs text-muted-foreground">
                            {item.code}
                          </div>
                        ) : null}
                      </div>
                      {stockInHandByItem !== undefined && (
                        <div className="shrink-0 text-right text-sm tabular-nums text-muted-foreground">
                          {balanceText}
                        </div>
                      )}
                    </div>
                  </CommandItem>
                )
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </SheetContent>
    </Sheet>
  )
}

export default StockItemSheetSelect
