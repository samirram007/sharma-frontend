
import { Button } from '@/components/ui/button'
import { Route as StorageUnitDetailRoute } from '@/routes/_protected/masters/inventory/_layout/storage_unit/_layout/$id'

import { IconUserPlus } from '@tabler/icons-react'
import { Link } from '@tanstack/react-router'

export function PrimaryButtons() {
  // const { setOpen } = useStorageUnit()
  return (
    <div className='flex gap-2'>
      <Button asChild className="space-x-1">
        <Link to={StorageUnitDetailRoute.to} params={{ id: 'new' }}>
          <span>Add StorageUnit</span>
          <IconUserPlus size={18} />
        </Link>
      </Button>
      {/* <Button className='space-x-1' onClick={() => setOpen('add')}>
        <span>Add StorageUnit</span> <IconUserPlus size={18} />
      </Button> */}
    </div >
  )
}
