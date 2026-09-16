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

export type FilterSheetOption = {
  id: string
  label: string
  description?: string | null
  /** Right-aligned detail line (e.g. stock qty + unit). */
  meta?: string | null
}

/**
 * Sheet-based single-select for report filters (Item / Godown) — the same
 * pattern as the voucher entry's item/godown sheet selectors: a trigger
 * button opening a right-side sheet with a searchable list.
 */
export function FilterSheetSelect({
  label,
  placeholder,
  allLabel,
  value,
  onChange,
  options,
  className,
  hideLabel = false,
}: {
  /** Field label shown above the trigger (e.g. "Item"). With `hideLabel`,
   * it doubles as the empty-trigger text and aria-label. */
  label: string
  placeholder: string
  /** Label for the "no filter" option (e.g. "All items"). */
  allLabel: string
  /** Selected option id, or 'all'. */
  value: string
  onChange: (id: string) => void
  options: FilterSheetOption[]
  className?: string
  /** Inline mode — no label above the trigger; the trigger shows its own
   * state ("Item: All items" / "Item: ULTRATECH…"). */
  hideLabel?: boolean
}) {
  const [open, setOpen] = useState(false)
  const selected = options.find((o) => o.id === value)

  return (
    <div
      className={cn(
        'w-[170px] space-y-1.5',
        hideLabel && 'space-y-0',
        className,
      )}
    >
      {!hideLabel && (
        <label className="text-xs text-muted-foreground">{label}</label>
      )}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            aria-label={label}
            className="h-9 w-full justify-between px-3 font-normal"
          >
            <span
              className={cn('truncate', !selected && 'text-muted-foreground')}
            >
              {hideLabel
                ? `${label}: ${selected?.label ?? allLabel}`
                : (selected?.label ?? allLabel)}
            </span>
            <ChevronsUpDownIcon className="ml-2 h-3.5 w-3.5 shrink-0 opacity-50" />
          </Button>
        </SheetTrigger>
        <SheetContent className="flex min-w-[380px]! flex-col p-0">
          <SheetHeader className="px-4 pt-4">
            <SheetTitle>{placeholder}</SheetTitle>
            <SheetDescription>
              Pick one — the report filters by it on Apply.
            </SheetDescription>
          </SheetHeader>
          <Command className="min-h-0 flex-1 overflow-hidden rounded-none border-0">
            <div className="sticky top-0 z-10 bg-card px-3 pb-2 pt-1">
              <CommandInput placeholder={`Search ${label.toLowerCase()}…`} />
            </div>
            <CommandList className="min-h-0 max-h-full flex-1 px-1 pb-4">
              <CommandEmpty>No match found.</CommandEmpty>
              <CommandGroup>
                <CommandItem
                  value={allLabel.toLowerCase()}
                  onSelect={() => {
                    onChange('all')
                    setOpen(false)
                  }}
                >
                  <CheckIcon
                    className={cn(
                      'mr-2 h-4 w-4',
                      value === 'all' ? 'opacity-100' : 'opacity-0',
                    )}
                  />
                  <span className="text-muted-foreground">{allLabel}</span>
                </CommandItem>
                {options.map((o) => (
                  <CommandItem
                    key={o.id}
                    value={`${o.label} ${o.description ?? ''}`.toLowerCase()}
                    onSelect={() => {
                      onChange(o.id)
                      setOpen(false)
                    }}
                  >
                    <CheckIcon
                      className={cn(
                        'mr-2 h-4 w-4',
                        value === o.id ? 'opacity-100' : 'opacity-0',
                      )}
                    />
                    <div className="flex min-w-0 flex-1 flex-col">
                      <div className="truncate">{o.label}</div>
                      {o.description ? (
                        <div className="truncate text-xs text-muted-foreground">
                          {o.description}
                        </div>
                      ) : null}
                    </div>
                    {o.meta ? (
                      <span className="ml-auto shrink-0 text-right font-mono text-xs tabular-nums text-muted-foreground">
                        {o.meta}
                      </span>
                    ) : null}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </SheetContent>
      </Sheet>
    </div>
  )
}
