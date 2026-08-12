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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import type { StockItem } from '@/features/modules/stock_item/data/schema'
import { useQuantityDecimals } from '@/hooks/use-quantity-decimals'
import { cn } from '@/lib/utils'
import { getData } from '@/utils/dataClient'
import { capitalizeAllWords } from '@/utils/removeEmptyStrings'
import { useQuery } from '@tanstack/react-query'

import { CheckIcon, ChevronsUpDownIcon, Loader2 } from 'lucide-react'
import React from 'react'
import type { UseFormReturn } from 'react-hook-form'

import { lowerCase } from 'lodash'
import { focusNextFocusable } from '@/lib/focus-utils'
import type { StockJournalGodownEntryForm } from '../../data-schema/voucher-schema'

interface BatchData {
  batchNo?: string
  mfgDate?: Date
  expiryDate?: Date
  stockInHand?: number
  className?: string
}

type BatchSelectionProps = {
  form: UseFormReturn<StockJournalGodownEntryForm>
  stockItem: StockItem | null
  godownId: number | null
  /** 0-based godown row index — only the first row auto-opens the picker and autofocuses. */
  rowIndex?: number
}
const BatchSelection = (props: BatchSelectionProps) => {
  const { form, stockItem, godownId, rowIndex = 0 } = props
  const [open, setOpen] = React.useState(false)
  const autoOpenedRef = React.useRef(false)
  const triggerRef = React.useRef<HTMLButtonElement>(null)
  const searchInputRef = React.useRef<HTMLInputElement>(null)
  const selectedId = form.watch('batchNo')?.toString()
  const batches = useQuery({
    queryKey: ['batches', stockItem?.id, godownId],
    queryFn: async () => {
      if (!stockItem?.id || !godownId) {
        return []
      }
      const response = await getData(
        `/godown_item_batches/${stockItem.id}/${godownId}`,
      )

      return response.data
    },
    enabled: !!stockItem?.id && !!godownId,
  })
  // Quantity uses the stock unit's decimal places, defaulting to 2.
  const noOfDecimalPlaces = useQuantityDecimals(
    stockItem?.stockUnit?.noOfDecimalPlaces,
  )

  const frameworks =
    batches.data?.map((batch: BatchData) => ({
      label: batch.batchNo!,
      value: batch.batchNo!,
      stockInHand: batch.stockInHand,
      stockUnitLabel: stockItem?.stockUnit
        ? capitalizeAllWords(stockItem.stockUnit.code!)
        : '',
      className: 'min-w-full hover:bg-blue-300',
      stockInHandFormatted: batch.stockInHand?.toFixed(noOfDecimalPlaces),
    })) || []

  // Auto-open the picker ONCE, when the first batch data arrives (first
  // godown row only). Opening on every remount (e.g. after the batch query
  // resolves and the loading placeholder unmounts) left focus on the trigger
  // with an already-open popover, so the first Enter just closed it.
  React.useEffect(() => {
    if (
      rowIndex === 0 &&
      !autoOpenedRef.current &&
      !batches.isPending &&
      frameworks.length > 0
    ) {
      autoOpenedRef.current = true
      setOpen(true)
    }
  }, [batches.isPending, frameworks.length, rowIndex])

  const handleSelect = (value: string) => {
    form.setValue(`batchNo`, String(value))
    setOpen(false)

    // Move focus forward to the quantity input instead of leaving it on
    // the batch picker (which used to trap the keyboard flow).
    requestAnimationFrame(() => focusNextFocusable(triggerRef.current))
  }
  const handleBlur = () => {
    // Auto-select only when there is exactly one batch available (an
    // unambiguous choice). With several batches, never assign silently.
    if (
      (form.watch(`batchNo`) === undefined || form.watch(`batchNo`) === '') &&
      frameworks.length === 1
    ) {
      form.setValue(`batchNo`, frameworks[0].value)
    }
  }

  if (batches.isPending) {
    return (
      <div className="flex flex-row justify-between items-center border-2 rounded-l-lg rounded-2xl mr-2 pl-2 text-sm mt-0.5">
        Batch loading
        <Loader2 className="animate-spin mr-2 h-4 w-4 text-blue-500" />
      </div>
    )
  }

  const selected = frameworks.find(
    (o: {
      label: string
      value: string
      stockInHand: number
      stockUnitLabel: string
      className: string
    }) => lowerCase(o.value) === lowerCase(selectedId!),
  )

  const selectedLabel = (
    <div className="flex flex-row justify-between w-full">
      {selected ? (
        <>
          <div>{selected?.label}</div>{' '}
          <div>
            {selected?.stockInHandFormatted} {selected?.stockUnitLabel}
          </div>
        </>
      ) : frameworks?.length > 0 ? (
        <>
          <div>{frameworks[0].label}</div>{' '}
          <div>
            {frameworks[0].stockInHandFormatted} {frameworks[0].stockUnitLabel}
          </div>
        </>
      ) : (
        'Select batch...'
      )}
    </div>
  )

  return (
    <div>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            ref={triggerRef}
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn('w-full justify-between')}
            onBlur={handleBlur}
          >
            {selectedLabel}
            <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="popover-content-width-same-as-trigger p-0"
          onOpenAutoFocus={(e) => {
            // Move focus into the search box so the batch can be
            // chosen entirely with the keyboard. Fires after the
            // content mounts, so the ref is always available.
            e.preventDefault()
            searchInputRef.current?.focus()
          }}
        >
          <Command className="rounded-lg border shadow-md min-w-full">
            <CommandInput ref={searchInputRef} placeholder="Search batch..." />
            <CommandList className=" max-h-full">
              <CommandEmpty>No batch found.</CommandEmpty>
              <CommandGroup>
                {frameworks.map(
                  (framework: {
                    label: string
                    value: string
                    stockInHand: number
                    stockUnitLabel: string
                    className: string
                    stockInHandFormatted: string
                  }) => (
                    <CommandItem
                      className={cn('justify-start', framework.className)}
                      key={framework.value}
                      value={framework.value}
                      onSelect={() => handleSelect(framework.value)}
                    >
                      <CheckIcon
                        className={cn(
                          'mr-2 h-4 w-4',
                          selectedId === framework.value
                            ? 'opacity-100'
                            : 'opacity-0',
                        )}
                      />
                      <div className="flex flex-row justify-between w-full">
                        <div>{framework.label}</div>
                        <div>
                          {framework.stockInHandFormatted}{' '}
                          {framework.stockUnitLabel}
                        </div>
                      </div>
                    </CommandItem>
                  ),
                )}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}

export default BatchSelection
