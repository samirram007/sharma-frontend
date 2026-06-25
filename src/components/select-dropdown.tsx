import { FormControl } from '@/components/ui/form'
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
import { IconLoader } from '@tabler/icons-react'
import { useMemo, useState } from 'react'

interface SelectDropdownProps {
  onValueChange?: (value: string) => void
  defaultValue: string | undefined
  placeholder?: string
  isPending?: boolean
  items: { label: string; value: string }[] | undefined
  disabled?: boolean
  className?: string
  isControlled?: boolean
  useSheet?: boolean
  sheetTitle?: string
}

export function SelectDropdown({
  defaultValue,
  onValueChange,
  isPending,
  items,
  placeholder,
  disabled,
  className = '',
  sheetTitle,
}: SelectDropdownProps) {
  const [open, setOpen] = useState(false)

  const selectedLabel = useMemo(() => {
    return items?.find((item) => item.value === defaultValue)?.label
  }, [items, defaultValue])

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <FormControl>
        <SheetTrigger asChild>
          <Button
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={disabled}
            className={cn('h-11 w-full justify-between', className)}
          >
            <span className="truncate text-left">
              {selectedLabel ?? placeholder ?? 'Select'}
            </span>
            <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </SheetTrigger>
      </FormControl>

      <SheetContent side="right" className="p-0 sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{sheetTitle ?? 'Select option'}</SheetTitle>
          <SheetDescription>
            Search and choose a value from the list.
          </SheetDescription>
        </SheetHeader>

        <Command className="h-full rounded-none border-0 shadow-none">
          <CommandInput placeholder="Search..." />
          <CommandList className="max-h-[70vh]">
            {isPending ? (
              <div className="flex items-center gap-2 px-3 py-4 text-sm text-muted-foreground">
                <IconLoader className="h-4 w-4 animate-spin" /> Loading...
              </div>
            ) : (
              <>
                <CommandEmpty>No results found.</CommandEmpty>
                <CommandGroup>
                  {items?.map(({ label, value }) => (
                    <CommandItem
                      key={value}
                      value={label}
                      onSelect={() => {
                        onValueChange?.(value)
                        setOpen(false)
                      }}
                    >
                      <CheckIcon
                        className={cn(
                          'mr-2 h-4 w-4',
                          defaultValue === value ? 'opacity-100' : 'opacity-0',
                        )}
                      />
                      {label}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </SheetContent>
    </Sheet>
  )
}
