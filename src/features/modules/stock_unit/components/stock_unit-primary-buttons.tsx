import { Button } from '@/components/ui/button'

import { IconPlus } from '@tabler/icons-react'
import { useStockUnit } from '../contexts/stock_unit-context'


export function StockUnitPrimaryButtons() {
  const { setOpen } = useStockUnit()
  return (
    <div className='flex gap-2'>

      <Button variant='default' className='space-x-1' onClick={() => setOpen('add')}>
        <span>Add Stock Unit...</span> <IconPlus size={18} />
      </Button>
    </div>
  )
}
