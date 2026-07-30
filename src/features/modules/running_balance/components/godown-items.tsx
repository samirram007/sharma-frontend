import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { GodownRunningBalanceResponse } from '../data/schema'
import { IconArrowLeft, IconChartBar, IconSearch } from '@tabler/icons-react'
import { useState, useMemo } from 'react'
import { Input } from '@/components/ui/input'

interface GodownItemsProps {
  data: GodownRunningBalanceResponse
  onSelectItem: (itemId: number) => void
  onBack: () => void
  selectedItemId: number | null
}

export default function GodownItems({ data, onSelectItem, onBack, selectedItemId }: GodownItemsProps) {
  const [search, setSearch] = useState('')
  const { godown, items } = data

  const filtered = useMemo(() => {
    if (!search.trim()) return items
    const q = search.toLowerCase()
    return items.filter(
      (item) =>
        item.itemName.toLowerCase().includes(q) ||
        (item.unitCode && item.unitCode.toLowerCase().includes(q)),
    )
  }, [items, search])

  const totalClosing = items.reduce((s, i) => s + i.closingQuantity, 0)
  const itemsWithStock = items.filter((i) => i.closingQuantity > 0).length

  return (
    <div className='space-y-3'>
      {/* Header */}
      <div className='flex items-start justify-between gap-4'>
        <div className='space-y-1'>
          <div className='flex items-center gap-3'>
            <Button variant='ghost' size='sm' onClick={onBack} className='-ml-2'>
              <IconArrowLeft className='h-4 w-4' />
            </Button>
            <h3 className='text-xl font-bold tracking-tight'>{godown.godownName}</h3>
            {godown.godownCode && (
              <Badge variant='secondary' className='text-xs'>
                {godown.godownCode}
              </Badge>
            )}
          </div>
          <p className='text-muted-foreground'>
            <strong className='text-foreground'>{items.length}</strong> items
            {' · '}
            <strong className='text-foreground'>{itemsWithStock}</strong> with stock
            {' · '}
            Closing: <strong className='font-mono text-foreground'>{totalClosing.toFixed(2)}</strong>
          </p>
        </div>
      </div>

      {/* Search */}
      <div className='relative'>
        <IconSearch className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
        <Input
          placeholder='Search items...'
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className='h-9 pl-9'
        />
      </div>

      {/* Table */}
      <div className='max-h-[500px] overflow-y-auto rounded-md border'>
        <table className='w-full text-sm'>
          <thead className='sticky top-0 bg-muted/80 backdrop-blur-sm z-10'>
            <tr className='border-b'>
              <th className='p-2 text-left font-medium text-muted-foreground'>Item</th>
              <th className='p-2 text-right font-medium text-muted-foreground'>Opening</th>
              <th className='p-2 text-right font-medium text-muted-foreground'>Inward</th>
              <th className='p-2 text-right font-medium text-muted-foreground'>Outward</th>
              <th className='p-2 text-right font-medium text-muted-foreground'>Closing</th>
              <th className='p-2 text-center font-medium text-muted-foreground'>Unit</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className='p-6 text-center text-muted-foreground'>
                  No items found in this godown.
                </td>
              </tr>
            )}
            {filtered.map((item) => (
              <tr
                key={item.itemId}
                className={cn(
                  'border-b last:border-0 cursor-pointer transition-colors hover:bg-accent/50',
                  selectedItemId === item.itemId && 'bg-accent/70 font-semibold',
                  item.closingQuantity === 0 && 'text-muted-foreground/60',
                )}
                onClick={() => onSelectItem(item.itemId)}
              >
                <td className='p-2'>
                  <div className='flex items-center gap-2'>
                    <IconChartBar className='h-3.5 w-3.5 text-primary/60' />
                    <span>{item.itemName}</span>
                  </div>
                </td>
                <td className='p-2 text-right font-mono'>
                  {item.openingQuantity === 0 ? '-' : item.openingQuantity.toFixed(item.noOfDecimalPlaces ?? 2)}
                </td>
                <td className='p-2 text-right font-mono text-green-600'>
                  {item.inwardQuantity === 0 ? '-' : '+' + item.inwardQuantity.toFixed(item.noOfDecimalPlaces ?? 2)}
                </td>
                <td className='p-2 text-right font-mono text-red-600'>
                  {item.outwardQuantity === 0 ? '-' : '-' + item.outwardQuantity.toFixed(item.noOfDecimalPlaces ?? 2)}
                </td>
                <td className='p-2 text-right font-mono font-semibold'>
                  {item.closingQuantity === 0 ? '-' : item.closingQuantity.toFixed(item.noOfDecimalPlaces ?? 2)}
                </td>
                <td className='p-2 text-center'>
                  {item.unitCode && (
                    <Badge variant='secondary' className='text-xs'>
                      {item.unitCode}
                    </Badge>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
