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
import { CheckIcon, ChevronsUpDownIcon } from 'lucide-react'
import { useState } from 'react'
import type { UseFormReturn } from 'react-hook-form'

import type { PhysicalStockCountForm } from '../../data/schema'

type GodownSheetSelectProps = {
  form: UseFormReturn<PhysicalStockCountForm>
  godowns: Array<{ id: number; name: string; code?: string | null }>
  disabled?: boolean
}

const GodownSheetSelect = ({
  form,
  godowns,
  disabled = false,
}: GodownSheetSelectProps) => {
  const [open, setOpen] = useState(false)
  const selectedId = form.watch('godownId')?.toString()

  const selected = godowns.find((g) => g.id === Number(selectedId))

  const handleSelect = (value: string) => {
    const godown = godowns.find((g) => g.id === Number(value))
    form.setValue('godownId', Number(value), {
      shouldValidate: true,
      shouldDirty: true,
    })
    form.setValue('godown', godown ?? undefined, {
      shouldValidate: true,
      shouldDirty: true,
    })
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
          className="h-9 w-full justify-between font-normal"
        >
          {selected
            ? `${selected.name}${selected.code ? ` (${selected.code})` : ''}`
            : 'Select godown...'}
          <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </SheetTrigger>
      <SheetContent className="min-w-[450px]! p-0">
        <SheetHeader>
          <SheetTitle>Search Godown</SheetTitle>
          <SheetDescription>
            Select the godown for this physical stock count.
          </SheetDescription>
        </SheetHeader>
        <Command className="min-w-full rounded-lg border shadow-md">
          <CommandInput placeholder="Search godown..." />
          <CommandList className="max-h-full">
            <CommandEmpty>No godown found.</CommandEmpty>
            <CommandGroup>
              {godowns.map((godown) => (
                <CommandItem
                  key={godown.id}
                  value={godown.name.toLowerCase()}
                  onSelect={() => handleSelect(String(godown.id))}
                >
                  <CheckIcon
                    className={cn(
                      'mr-2 h-4 w-4',
                      selectedId === String(godown.id)
                        ? 'opacity-100'
                        : 'opacity-0',
                    )}
                  />
                  <div className="flex w-full flex-row justify-between">
                    <div>{godown.name}</div>
                    {godown.code ? (
                      <div className="text-xs text-muted-foreground">
                        {godown.code}
                      </div>
                    ) : null}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </SheetContent>
    </Sheet>
  )
}

export default GodownSheetSelect
