import { Button } from '@/components/ui/button'

import { IconPlus } from '@tabler/icons-react'
import { useStockCategory } from '../contexts/stock_category-context'


export function StockCategoryPrimaryButtons() {
  const { setOpen } = useStockCategory()
  return (
    <div className='flex gap-2'>
      {/* <Button
        variant='outline'
        className='space-x-1'
        onClick={() => setOpen('invite')}
      >
        <span>Invite User</span> <IconMailPlus size={18} />
      </Button> */}
      <Button variant='default' className='space-x-1' onClick={() => setOpen('add')}>
        <span>Add Stock Category</span> <IconPlus size={18} />
      </Button>
    </div>
  )
}
