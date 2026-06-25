
import { Button } from '@/components/ui/button'
import { Route as SupplierDetailRoute } from '@/routes/_protected/masters/party/_layout/supplier/_layout/$id'

import { IconUserPlus } from '@tabler/icons-react'
import { Link } from '@tanstack/react-router'

export function PrimaryButtons() {
  // const { setOpen } = useSupplier()
  return (
    <div className='flex gap-2'>
      <Button asChild className="space-x-1">
        <Link to={SupplierDetailRoute.to} params={{ id: 'new' }}>
          <span>Add Supplier</span>
          <IconUserPlus size={18} />
        </Link>
      </Button>
      {/* <Button className='space-x-1' onClick={() => setOpen('add')}>
        <span>Add Supplier</span> <IconUserPlus size={18} />
      </Button> */}
    </div >
  )
}
