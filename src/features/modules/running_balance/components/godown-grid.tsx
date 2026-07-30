import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { RunningBalanceGodown } from '../data/schema'
import { IconBuildingWarehouse, IconSearch } from '@tabler/icons-react'
import { useState, useMemo } from 'react'
import { Input } from '@/components/ui/input'

interface GodownGridProps {
  godowns: RunningBalanceGodown[]
  onSelectGodown: (godownId: number) => void
  selectedGodownId: number | null
}

export default function GodownGrid({ godowns, onSelectGodown, selectedGodownId }: GodownGridProps) {
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    if (!search.trim()) return godowns
    const q = search.toLowerCase()
    return godowns.filter(
      (g) =>
        g.godownName.toLowerCase().includes(q) ||
        (g.godownCode && g.godownCode.toLowerCase().includes(q)),
    )
  }, [godowns, search])

  const totalClosing = godowns.reduce((s, g) => s + g.closingQuantity, 0)
  const godownsWithStock = godowns.filter((g) => g.closingQuantity > 0).length

  return (
    <div className='space-y-3'>
      {/* Summary */}
      <div className='flex items-center justify-between text-sm text-muted-foreground'>
        <div className='flex items-center gap-4'>
          <span className='flex items-center gap-1'>
            <IconBuildingWarehouse className='h-4 w-4' />
            <strong className='text-foreground'>{godowns.length}</strong> godowns
          </span>
          <span>
            <strong className='text-foreground'>{godownsWithStock}</strong> with stock
          </span>
          <span>
            Total Closing: <strong className='font-mono text-foreground'>{totalClosing.toFixed(2)}</strong>
          </span>
        </div>
      </div>

      {/* Search */}
      <div className='relative'>
        <IconSearch className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
        <Input
          placeholder='Search godowns...'
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
              <th className='p-2 text-left font-medium text-muted-foreground'>Godown</th>
              <th className='p-2 text-center font-medium text-muted-foreground'>Code</th>
              <th className='p-2 text-right font-medium text-muted-foreground'>Opening</th>
              <th className='p-2 text-right font-medium text-muted-foreground'>Inward</th>
              <th className='p-2 text-right font-medium text-muted-foreground'>Outward</th>
              <th className='p-2 text-right font-medium text-muted-foreground'>Closing</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className='p-6 text-center text-muted-foreground'>
                  No godowns found.
                </td>
              </tr>
            )}
            {filtered.map((godown) => (
              <tr
                key={godown.godownId}
                className={cn(
                  'border-b last:border-0 cursor-pointer transition-colors hover:bg-accent/50',
                  selectedGodownId === godown.godownId && 'bg-accent/70 font-semibold',
                  godown.closingQuantity === 0 && 'text-muted-foreground/60',
                )}
                onClick={() => onSelectGodown(godown.godownId)}
              >
                <td className='p-2'>
                  <div className='flex items-center gap-2'>
                    <IconBuildingWarehouse className='h-3.5 w-3.5 text-primary/60' />
                    <span>{godown.godownName}</span>
                  </div>
                </td>
                <td className='p-2 text-center'>
                  {godown.godownCode && (
                    <Badge variant='secondary' className='text-xs'>
                      {godown.godownCode}
                    </Badge>
                  )}
                </td>
                <td className='p-2 text-right font-mono'>
                  {godown.openingQuantity === 0 ? '-' : godown.openingQuantity.toFixed(2)}
                </td>
                <td className='p-2 text-right font-mono text-green-600'>
                  {godown.inwardQuantity === 0 ? '-' : '+' + godown.inwardQuantity.toFixed(2)}
                </td>
                <td className='p-2 text-right font-mono text-red-600'>
                  {godown.outwardQuantity === 0 ? '-' : '-' + godown.outwardQuantity.toFixed(2)}
                </td>
                <td className='p-2 text-right font-mono font-semibold'>
                  {godown.closingQuantity === 0 ? '-' : godown.closingQuantity.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
