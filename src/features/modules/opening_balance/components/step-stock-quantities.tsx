import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { IconArrowLeft, IconArrowRight, IconPackage } from '@tabler/icons-react'
import { useEffect, useState } from 'react'
import type { StockItemSetup, StockEntry } from '../data/schema'
import { cn } from '@/lib/utils'

interface StepStockQuantitiesProps {
  stockItems: StockItemSetup[]
  onNext: (entries: StockEntry[]) => void
  onBack: () => void
}

export default function StepStockQuantities({
  stockItems,
  onNext,
  onBack,
}: StepStockQuantitiesProps) {
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set())
  const [entries, setEntries] = useState<StockEntry[]>([])

  useEffect(() => {
    if (entries.length === 0 && stockItems.length > 0) {
      setEntries(
        stockItems.map((item) => ({
          itemId: item.itemId,
          itemName: item.itemName,
          unitCode: item.unitCode,
          noOfDecimalPlaces: item.noOfDecimalPlaces,
          godowns: item.godowns.map((g) => ({
            godownId: g.godownId,
            godownName: g.godownName,
            quantity: g.prefilledQuantity,
          })),
        })),
      )
    }
  }, [stockItems])

  const updateQuantity = (
    itemId: number,
    godownId: number,
    quantity: number,
  ) => {
    setEntries((prev) =>
      prev.map((item) =>
        item.itemId === itemId
          ? {
              ...item,
              godowns: item.godowns.map((g) =>
                g.godownId === godownId ? { ...g, quantity } : g,
              ),
            }
          : item,
      ),
    )
  }

  const toggleExpand = (itemId: number) => {
    setExpandedItems((prev) => {
      const next = new Set(prev)
      if (next.has(itemId)) next.delete(itemId)
      else next.add(itemId)
      return next
    })
  }

  const itemTotal = (entry: StockEntry) =>
    entry.godowns.reduce((s, g) => s + g.quantity, 0)

  const totalItemsWithStock = entries.filter((e) => itemTotal(e) > 0).length

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg">
                <IconPackage className="h-5 w-5 text-green-500" />
                Step 2: Opening Stock Quantities
              </CardTitle>
              <CardDescription>
                Enter opening stock quantities for each item across godowns.
                {totalItemsWithStock > 0 &&
                  ` ${totalItemsWithStock} of ${stockItems.length} items have quantities.`}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {stockItems.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              No stock items found.
            </div>
          ) : (
            <div className="max-h-[500px] overflow-y-auto space-y-2">
              {entries.map((entry) => {
                const totalQty = itemTotal(entry)
                const isExpanded =
                  expandedItems.has(entry.itemId) || totalQty > 0

                return (
                  <div key={entry.itemId} className="rounded-md border bg-card">
                    <button
                      type="button"
                      onClick={() => toggleExpand(entry.itemId)}
                      className="flex w-full items-center justify-between p-3 text-left hover:bg-accent/30 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-medium">{entry.itemName}</span>
                        {entry.unitCode && (
                          <Badge variant="secondary" className="text-xs">
                            {entry.unitCode}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        {totalQty > 0 && (
                          <span className="text-sm font-mono text-muted-foreground">
                            Total: {totalQty.toFixed(entry.noOfDecimalPlaces)}{' '}
                            {entry.unitCode}
                          </span>
                        )}
                        <svg
                          className={cn(
                            'h-4 w-4 text-muted-foreground transition-transform',
                            isExpanded && 'rotate-180',
                          )}
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <polyline points="6 9 12 15 18 9" />
                        </svg>
                      </div>
                    </button>
                    {isExpanded && (
                      <div className="border-t px-3 py-2 space-y-1">
                        {entry.godowns.map((godown) => (
                          <div
                            key={godown.godownId}
                            className="flex items-center justify-between gap-3 py-1"
                          >
                            <span className="text-sm text-muted-foreground min-w-[150px]">
                              {godown.godownName}
                            </span>
                            <div className="relative">
                              <Input
                                type="number"
                                min={0}
                                step={0.001}
                                value={godown.quantity || ''}
                                onChange={(e) =>
                                  updateQuantity(
                                    entry.itemId,
                                    godown.godownId,
                                    parseFloat(e.target.value) || 0,
                                  )
                                }
                                placeholder="0"
                                className="h-8 w-28 text-right font-mono text-sm"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          <IconArrowLeft className="mr-2 h-4 w-4" />
          Back: Ledger Balances
        </Button>
        <Button onClick={() => onNext(entries)}>
          Next: Review & Confirm
          <IconArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
