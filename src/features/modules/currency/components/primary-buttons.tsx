
import { Button } from '@/components/ui/button'
import { Route as CurrencyDetailRoute } from '@/routes/_protected/masters/organization/_layout/currency/_layout/$id'

import { IconUserPlus } from '@tabler/icons-react'
import { Link } from '@tanstack/react-router'

export function PrimaryButtons() {
  // const { setOpen } = useCurrency()
  return (
    <div className='flex gap-2'>
      <Button asChild className="space-x-1">
        <Link to={CurrencyDetailRoute.to} params={{ id: 'new' }}>
          <span>Add Currency</span>
          <IconUserPlus size={18} />
        </Link>
      </Button>
      {/* <Button className='space-x-1' onClick={() => setOpen('add')}>
        <span>Add Currency</span> <IconUserPlus size={18} />
      </Button> */}
    </div >
  )
}
