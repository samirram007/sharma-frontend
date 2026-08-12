'use client'

import { CheckIcon, ChevronsUpDownIcon } from 'lucide-react'
import * as React from 'react'

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
import { cn } from '@/lib/utils'
import { capitalizeAllWords } from '@/utils/removeEmptyStrings'
import { useFormContext } from 'react-hook-form'

import { useFocusNext } from '@/core/hooks/useFocusNext'
import type { Godown } from '@/features/modules/godown/data/schema'
import { getData } from '@/utils/dataClient'
import { useQuery } from '@tanstack/react-query'
import { FaSignOutAlt } from 'react-icons/fa'
import type { StockJournalGodownEntryForm } from '../../data-schema/voucher-schema'

interface GodownComboboxProps {
  handleRemove?: () => void
  godowns: Godown[]
}
export const GodownCombobox = ({
  godowns,
  handleRemove,
}: GodownComboboxProps) => {
  const form = useFormContext<StockJournalGodownEntryForm>()
  const focusNext = useFocusNext()
  const [open, setOpen] = React.useState(false)
  const selectedId = form.watch('godownId')?.toString()
  const stockItem = form.watch('stockItem')
  const { data: godownItemStocks } = useQuery({
    queryKey: ['godownItemStocks', stockItem?.id],
    queryFn: async () => {
      if (!stockItem?.id) {
        return []
      }
      const response = await getData(`/godown_item_stocks/${stockItem.id}`)

      return response.data
    },
    staleTime: 1000 * 60 * 1,
    enabled: !!stockItem?.id,
  })
  const noOfDecimalPlaces =
    (stockItem as any)?.stockUnit?.noOfDecimalPlaces ?? 2

  const stockMap = React.useMemo(() => {
    const map: Record<string, string> = {}
    godownItemStocks?.forEach((row: any) => {
      map[row.godownId] = Number(row.stockInHand || 0).toFixed(
        noOfDecimalPlaces,
      )
    })
    return map
  }, [godownItemStocks, noOfDecimalPlaces])

  const godownsWithStock = React.useMemo(() => {
    const set = new Set<number>()
    godownItemStocks?.forEach((row: any) => {
      if (Number(row.stockInHand || 0) > 0) {
        set.add(Number(row.godownId))
      }
    })
    return set
  }, [godownItemStocks])

  const handleSelect = (value: string) => {
    if (value === '-1') {
      handleRemove?.()
    } else {
      const selected = godowns.find((i) => i.id === Number(value))
      form.setValue(`godownId`, Number(value))
      form.setValue(`godown`, selected ?? null, {
        shouldValidate: true,
        shouldDirty: true,
      })
    }
    setOpen(false)
    focusNext()
  }
  const frameworks = [
    {
      label: (
        <div className="flex items-center  gap-2 text-red-600 hover:text-red-800 font-medium">
          <FaSignOutAlt className="  hover:text-red-800 h-4 w-4" />
          Finish Godown Entries
        </div>
      ),
      value: '-1',
      stockInHand: '',
      stockUnitLabel: <div className="font-semibold underline">Quantity</div>,
      className:
        'flex flex-row justify-end text-right min-w-full   active:bg-red-200 data-[selected=true]:bg-red-200 [selected=true]:text-gray-200  ',
    },
    ...(godowns
      ?.filter((godown: Godown) => godownsWithStock.has(godown.id))
      ?.map((godown: Godown) => {
        const stock =
          stockMap[godown.id] ?? Number(0).toFixed(noOfDecimalPlaces)

        return {
          label: capitalizeAllWords(godown.name!),
          value: String(godown.id),
          stockInHand: stock,
          stockUnitLabel:
            stockItem?.stockUnit?.code || stockItem?.stockUnit?.name || '',
          className: 'min-w-full hover:bg-blue-300',
        }
      }) ?? []),
  ]

  const selected = frameworks.find((o) => o.value === selectedId)
  // console.log("SELECTED GODOWN: ", selectedId, selected)
  const selectedLabel = selected
    ? (selected?.label?.toString() ?? 'Select godown')
    : 'Select godown'

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn('w-full justify-between')}
          autoFocus={false}
        >
          {selectedLabel}
          <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="popover-content-width-same-as-trigger p-0">
        <Command className="rounded-lg border shadow-md min-w-full">
          <CommandInput placeholder="Search godown..." />
          <CommandList className=" max-h-full">
            <CommandEmpty>No godown found.</CommandEmpty>
            <CommandGroup>
              {frameworks.map((framework) => (
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
                      {framework.stockInHand} {framework.stockUnitLabel}
                    </div>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
