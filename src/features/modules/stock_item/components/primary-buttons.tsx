import { Button } from '@/components/ui/button'
import { Route as StockItemDetailRoute } from '@/routes/_protected/masters/inventory/_layout/stock_item/_layout/$id'

import { IconUserPlus } from '@tabler/icons-react'
import { Link } from '@tanstack/react-router'

export function PrimaryButtons() {
  // const { setOpen } = useStockItem()
  return (
    <div className="flex gap-2">
      <Button asChild className="space-x-1">
        <Link to={StockItemDetailRoute.to} params={{ id: 'new' }}>
          <span>Add Stock Item</span>
          <IconUserPlus size={18} />
        </Link>
      </Button>
      {/* <Button className='space-x-1' onClick={() => setOpen('add')}>
        <span>Add Stock Item</span> <IconUserPlus size={18} />
      </Button> */}
    </div>
  )
}
