import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Input } from '@/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  IconActivity,
  IconBuildingWarehouse,
  IconHistory,
  IconLayersSubtract,
  IconLoader2,
  IconLock,
  IconPackage,
  IconPlus,
  IconRotateClockwise,
  IconX,
} from '@tabler/icons-react'
import { useQuery } from '@tanstack/react-query'
import { ChevronDown } from 'lucide-react'
import { useMemo, useRef, useState, type ReactNode } from 'react'
import { useScrollTopAfterFetch } from '@/core/hooks/use-scroll-top-after-fetch'
import { cn } from '@/lib/utils'
import { godownQueryOptions } from '@/features/modules/godown/data/queryOptions'
import { stockItemQueryOptions } from '@/features/modules/stock_item/data/queryOptions'
import type { GodownList } from '@/features/modules/godown/data/schema'
import type {
  StockItem,
  StockItemList,
} from '@/features/modules/stock_item/data/schema'
import type { EditableStockItem } from '../data/schema'

interface OpeningStockEditorProps {
  /** Current (user-edited) stock quantities */
  items: EditableStockItem[]
  /** True when any quantity differs from the previous-year closing stock */
  isDirty: boolean
  /** Where the pre-fill came from: frozen CLSSK journal or live running balance */
  stockSource?: 'closing_journal' | 'running'
  onItemsChange: (items: EditableStockItem[]) => void
  onReset: () => void
  /** Re-fetches the previous year's closing stock and refills the grid */
  onFetchPreviousClosing?: () => void
  isFetchingClosing?: boolean
}

interface DisplayRow {
  entryIndex: number
  quantity: number
  batchNo: string | null
  mfgDate: string | null
  expiryDate: string | null
}

interface DisplayGodown {
  godownId: number
  godownName: string | null
  rows: DisplayRow[]
}

interface PickerOption {
  id: number
  label: string
  sublabel?: string
}

function formatQty(value: number): string {
  return value.toLocaleString('en-IN', { maximumFractionDigits: 2 })
}

function formatShortDate(value: string): string {
  const d = new Date(value)
  if (isNaN(d.getTime())) return value
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function itemTotal(item: EditableStockItem): number {
  return item.godowns.reduce((sum, g) => sum + g.quantity, 0)
}

// Group the flat preview rows (one per batch) under their godown for display.
function groupGodowns(item: EditableStockItem): DisplayGodown[] {
  return item.godowns.reduce<DisplayGodown[]>((acc, g, entryIndex) => {
    const existing = acc.find((group) => group.godownId === g.godownId)
    const row: DisplayRow = {
      entryIndex,
      quantity: g.quantity,
      batchNo: g.batchNo,
      mfgDate: g.mfgDate,
      expiryDate: g.expiryDate,
    }
    if (existing) existing.rows.push(row)
    else
      acc.push({ godownId: g.godownId, godownName: g.godownName, rows: [row] })
    return acc
  }, [])
}

/**
 * Searchable cmdk picker used to add stock items / godowns that weren't carried
 * over from the previous fiscal year's closing stock.
 */
function EntityPicker({
  triggerLabel,
  triggerClassName,
  options,
  loading,
  searchPlaceholder = 'Search...',
  onSelect,
  onOpenChange,
}: {
  triggerLabel: ReactNode
  triggerClassName?: string
  options: PickerOption[]
  loading?: boolean
  searchPlaceholder?: string
  onSelect: (option: PickerOption) => void
  onOpenChange?: (open: boolean) => void
}) {
  const [open, setOpen] = useState(false)

  const handleOpenChange = (next: boolean) => {
    setOpen(next)
    onOpenChange?.(next)
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          role="combobox"
          aria-expanded={open}
          className={cn('justify-start', triggerClassName)}
        >
          {triggerLabel}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <Command>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList className="max-h-72">
            {loading ? (
              <CommandItem
                disabled
                className="justify-center text-muted-foreground"
              >
                Loading...
              </CommandItem>
            ) : (
              <>
                <CommandEmpty>
                  {options.length === 0
                    ? 'No options available.'
                    : 'No match found.'}
                </CommandEmpty>
                <CommandGroup>
                  {options.map((option) => (
                    <CommandItem
                      key={option.id}
                      value={`${option.label} ${option.sublabel ?? ''}`.toLowerCase()}
                      onSelect={() => {
                        onSelect(option)
                        setOpen(false)
                      }}
                    >
                      <div className="flex w-full items-center justify-between gap-3">
                        <span className="truncate">{option.label}</span>
                        {option.sublabel && (
                          <span className="shrink-0 text-xs text-muted-foreground">
                            {option.sublabel}
                          </span>
                        )}
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

/**
 * Editable opening-stock grid shown before the opening journal is saved.
 *
 * Quantities are pre-filled from the previous fiscal year's closing stock
 * (item → godown → batch) and can be changed per godown/batch row. Items and
 * godowns that weren't carried over can be added from the master lists, and any
 * row or item can be removed. The edited payload is sent with the open request
 * so the OPNJL stock journal honours it.
 */
export default function OpeningStockEditor({
  items,
  isDirty,
  stockSource,
  onItemsChange,
  onReset,
  onFetchPreviousClosing,
  isFetchingClosing = false,
}: OpeningStockEditorProps) {
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set())
  const [itemPickerOpen, setItemPickerOpen] = useState(false)

  // Scroll container of the item list — after a closing-stock fetch completes it
  // is scrolled back to the top so the imported rows are immediately visible.
  const listRef = useRef<HTMLDivElement>(null)
  useScrollTopAfterFetch(listRef, isFetchingClosing)

  // Master lists for adding brand-new rows. Stock items load lazily only when
  // the picker is opened; godowns are small and fetched up front.
  const { data: stockItemsData } = useQuery({
    ...stockItemQueryOptions(),
    enabled: itemPickerOpen,
  })
  const { data: godownsData } = useQuery(godownQueryOptions())

  const stockItems = (stockItemsData?.data ?? []) as StockItemList
  const godowns = (godownsData?.data ?? []) as GodownList

  const totalQuantity = useMemo(
    () => items.reduce((sum, item) => sum + itemTotal(item), 0),
    [items],
  )
  const itemsWithStock = useMemo(
    () => items.filter((item) => itemTotal(item) > 0).length,
    [items],
  )

  const existingItemIds = useMemo(
    () => new Set(items.map((item) => item.itemId)),
    [items],
  )

  const availableItems = useMemo(
    () =>
      stockItems
        .filter((s): s is StockItem & { id: number } => {
          if (!s.id) return false
          return !existingItemIds.has(s.id)
        })
        .map((s) => ({ id: s.id, label: s.name, sublabel: s.code })),
    [stockItems, existingItemIds],
  )

  const toggleExpand = (itemId: number) => {
    setExpandedItems((prev) => {
      const next = new Set(prev)
      if (next.has(itemId)) next.delete(itemId)
      else next.add(itemId)
      return next
    })
  }

  const updateRow = (itemId: number, entryIndex: number, quantity: number) => {
    // Guard against negative values typed into the number input.
    quantity = Math.max(0, quantity)
    onItemsChange(
      items.map((item) =>
        item.itemId === itemId
          ? {
              ...item,
              godowns: item.godowns.map((g, i) =>
                i === entryIndex ? { ...g, quantity } : g,
              ),
            }
          : item,
      ),
    )
  }

  const addItem = (option: PickerOption) => {
    onItemsChange([
      ...items,
      {
        itemId: option.id,
        itemName: option.label,
        godowns: [],
      },
    ])
  }

  const addGodownRow = (itemId: number, option: PickerOption) => {
    onItemsChange(
      items.map((item) =>
        item.itemId === itemId
          ? {
              ...item,
              godowns: [
                ...item.godowns,
                {
                  godownId: option.id,
                  godownName: option.label,
                  quantity: 0,
                  batchNo: null,
                  mfgDate: null,
                  expiryDate: null,
                },
              ],
            }
          : item,
      ),
    )
  }

  const removeRow = (itemId: number, entryIndex: number) => {
    onItemsChange(
      items.map((item) =>
        item.itemId === itemId
          ? {
              ...item,
              godowns: item.godowns.filter((_, i) => i !== entryIndex),
            }
          : item,
      ),
    )
  }

  const removeItem = (itemId: number) => {
    onItemsChange(items.filter((item) => item.itemId !== itemId))
  }

  const removeButtonClass =
    'h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive'

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 space-y-1">
            <CardTitle className="flex items-center gap-2 text-base">
              <IconPackage className="h-4 w-4 shrink-0 text-green-500" />
              Opening Stock Quantities
            </CardTitle>
            <CardDescription>
              Pre-filled from the previous fiscal year&apos;s closing stock —
              edit the quantities, or add items and godowns that weren&apos;t
              carried over, before saving the opening journal.
              {itemsWithStock > 0 &&
                ` ${itemsWithStock} of ${items.length} items carry stock.`}
            </CardDescription>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {stockSource === 'running' && (
              <Badge
                variant="outline"
                className="gap-1 text-[11px] font-normal text-amber-700 dark:text-amber-400"
              >
                <IconActivity className="h-3 w-3" />
                running balance
              </Badge>
            )}
            {stockSource === 'closing_journal' && (
              <Badge
                variant="outline"
                className="gap-1 text-[11px] font-normal"
              >
                <IconLock className="h-3 w-3" />
                closing journal
              </Badge>
            )}
            {isDirty && (
              <Badge
                className="gap-1 bg-amber-500/15 text-[11px] font-normal text-amber-700 hover:bg-amber-500/25 dark:text-amber-400"
                variant="default"
              >
                Edited
              </Badge>
            )}
            {onFetchPreviousClosing && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onFetchPreviousClosing}
                disabled={isFetchingClosing}
                className="h-8 gap-1.5 text-xs"
              >
                {isFetchingClosing ? (
                  <IconLoader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <IconHistory className="h-3.5 w-3.5" />
                )}
                Fetch Previous Year Closing Stock
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={onReset}
              disabled={!isDirty}
              className="h-8 text-xs"
            >
              <IconRotateClockwise className="mr-1.5 h-3.5 w-3.5" />
              Reset
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <>
          <div
            ref={listRef}
            className="max-h-[460px] space-y-2 overflow-y-auto pr-1"
          >
            {items.length === 0 ? (
              <div className="py-10 text-center text-muted-foreground">
                No stock items were carried over from the previous fiscal year.
                Use &ldquo;Add Item&rdquo; below to record opening stock
                manually.
              </div>
            ) : (
              items.map((item) => {
                const total = itemTotal(item)
                const isExpanded =
                  expandedItems.has(item.itemId) ||
                  total > 0 ||
                  item.godowns.length === 0
                const godownGroups = groupGodowns(item)
                const availableGodowns = godowns
                  .filter(
                    (g) => !item.godowns.some((row) => row.godownId === g.id),
                  )
                  .map((g) => ({ id: g.id, label: g.name, sublabel: g.code }))

                return (
                  <div
                    key={item.itemId}
                    className="overflow-hidden rounded-lg border bg-card"
                  >
                    <div className="flex items-center">
                      <button
                        type="button"
                        onClick={() => toggleExpand(item.itemId)}
                        className="flex min-w-0 flex-1 items-center justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-accent/40"
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <span className="truncate text-sm font-medium">
                            {item.itemName ?? `Item #${item.itemId}`}
                          </span>
                          {total > 0 && (
                            <Badge
                              variant="secondary"
                              className="shrink-0 font-mono text-xs font-semibold"
                            >
                              {formatQty(total)}
                            </Badge>
                          )}
                        </div>
                        <ChevronDown
                          className={cn(
                            'h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200',
                            isExpanded && 'rotate-180',
                          )}
                        />
                      </button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeItem(item.itemId)}
                        aria-label={`Remove ${item.itemName ?? `item #${item.itemId}`} from opening stock`}
                        title="Remove item"
                        className={removeButtonClass}
                      >
                        <IconX className="h-4 w-4" />
                      </Button>
                    </div>

                    {isExpanded && (
                      <div className="space-y-3 border-t bg-muted/20 px-4 py-3">
                        {item.godowns.length === 0 && (
                          <div className="rounded-md border border-dashed px-3 py-2.5 text-center text-xs text-muted-foreground">
                            No godown entries yet — add a godown to record
                            opening stock for this item.
                          </div>
                        )}

                        {godownGroups.map((godown) => {
                          const godownTotal = godown.rows.reduce(
                            (sum, row) => sum + row.quantity,
                            0,
                          )
                          const singlePlainRow =
                            godown.rows.length === 1 &&
                            !godown.rows[0].batchNo &&
                            !godown.rows[0].mfgDate &&
                            !godown.rows[0].expiryDate

                          // Single godown row without batch info — edit inline.
                          if (singlePlainRow) {
                            const row = godown.rows[0]
                            return (
                              <div
                                key={row.entryIndex}
                                className="flex items-center justify-between gap-2"
                              >
                                <div className="flex min-w-0 flex-1 items-center gap-1.5">
                                  <IconBuildingWarehouse className="h-3.5 w-3.5 shrink-0 text-muted-foreground/70" />
                                  <span className="truncate text-sm font-medium">
                                    {godown.godownName ??
                                      `Godown #${godown.godownId}`}
                                  </span>
                                </div>
                                <Input
                                  type="number"
                                  min={0}
                                  step={0.001}
                                  value={row.quantity || ''}
                                  onChange={(e) =>
                                    updateRow(
                                      item.itemId,
                                      row.entryIndex,
                                      parseFloat(e.target.value) || 0,
                                    )
                                  }
                                  placeholder="0"
                                  aria-label={`${item.itemName} ${godown.godownName} quantity`}
                                  className="h-8 w-28 text-right font-mono text-sm"
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() =>
                                    removeRow(item.itemId, row.entryIndex)
                                  }
                                  aria-label={`Remove ${godown.godownName ?? `godown #${godown.godownId}`} entry for ${item.itemName ?? `item #${item.itemId}`}`}
                                  title="Remove godown entry"
                                  className={removeButtonClass}
                                >
                                  <IconX className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            )
                          }

                          return (
                            <div key={godown.godownId} className="space-y-1.5">
                              <div className="flex items-center gap-1.5 pt-1 text-xs font-medium text-muted-foreground">
                                <IconBuildingWarehouse className="h-3.5 w-3.5 shrink-0" />
                                <span className="truncate">
                                  {godown.godownName ??
                                    `Godown #${godown.godownId}`}
                                </span>
                                <span className="ml-auto font-mono tabular-nums">
                                  {formatQty(godownTotal)}
                                </span>
                              </div>
                              {godown.rows.map((row) => (
                                <div
                                  key={row.entryIndex}
                                  className="flex items-center justify-between gap-2 pl-4"
                                >
                                  <div className="flex min-w-0 flex-1 items-center gap-1.5">
                                    <IconLayersSubtract className="h-3.5 w-3.5 shrink-0 text-muted-foreground/70" />
                                    <span className="font-mono text-xs font-semibold">
                                      {row.batchNo || 'No batch'}
                                    </span>
                                    {(row.mfgDate || row.expiryDate) && (
                                      <span className="truncate text-[10px] text-muted-foreground/80">
                                        {row.mfgDate &&
                                          `MFG ${formatShortDate(row.mfgDate)}`}
                                        {row.mfgDate && row.expiryDate && ' · '}
                                        {row.expiryDate &&
                                          `EXP ${formatShortDate(row.expiryDate)}`}
                                      </span>
                                    )}
                                  </div>
                                  <Input
                                    type="number"
                                    min={0}
                                    step={0.001}
                                    value={row.quantity || ''}
                                    onChange={(e) =>
                                      updateRow(
                                        item.itemId,
                                        row.entryIndex,
                                        parseFloat(e.target.value) || 0,
                                      )
                                    }
                                    placeholder="0"
                                    aria-label={`${item.itemName} ${godown.godownName} ${row.batchNo ?? 'batch'} quantity`}
                                    className="h-8 w-28 text-right font-mono text-sm"
                                  />
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() =>
                                      removeRow(item.itemId, row.entryIndex)
                                    }
                                    aria-label={`Remove ${row.batchNo ?? 'batch'} entry for ${item.itemName ?? `item #${item.itemId}`} in ${godown.godownName ?? `godown #${godown.godownId}`}`}
                                    title="Remove godown entry"
                                    className={removeButtonClass}
                                  >
                                    <IconX className="h-3.5 w-3.5" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          )
                        })}

                        {availableGodowns.length > 0 && (
                          <EntityPicker
                            triggerLabel={
                              <>
                                <IconPlus className="mr-1 h-3.5 w-3.5" />
                                Godown
                              </>
                            }
                            triggerClassName="h-7 text-xs text-muted-foreground"
                            options={availableGodowns}
                            loading={godowns.length === 0}
                            searchPlaceholder="Search godown..."
                            onSelect={(option) =>
                              addGodownRow(item.itemId, option)
                            }
                          />
                        )}
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </div>

          <EntityPicker
            triggerLabel={
              <>
                <IconPlus className="mr-1.5 h-4 w-4" />
                Add Item
              </>
            }
            triggerClassName="w-full border-dashed text-muted-foreground hover:text-foreground"
            options={availableItems}
            loading={itemPickerOpen && stockItems.length === 0}
            searchPlaceholder="Search stock item..."
            onSelect={addItem}
            onOpenChange={setItemPickerOpen}
          />

          {items.length > 0 && (
            <div className="flex items-center justify-between gap-3 rounded-md border bg-muted/40 px-4 py-2.5 text-sm">
              <span className="text-muted-foreground">
                <span className="font-semibold text-foreground">
                  {itemsWithStock}
                </span>{' '}
                item(s) with stock ·{' '}
                <span className="font-semibold text-foreground">
                  {items.length}
                </span>{' '}
                total
              </span>
              <span className="font-mono font-semibold tabular-nums">
                {formatQty(totalQuantity)}
              </span>
            </div>
          )}
        </>
      </CardContent>
    </Card>
  )
}
