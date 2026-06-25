
import { Button } from '@/components/ui/button'
import { Route as UserDetailRoute } from '@/routes/_protected/administration/_layout/user/_layout/$id'

import { IconUserPlus } from '@tabler/icons-react'
import { Link } from '@tanstack/react-router'

export function PrimaryButtons() {
  // const { setOpen } = useUser()
  return (
    <div className='flex gap-2'>
      <Button asChild className="space-x-1">
        <Link to={UserDetailRoute.to} params={{ id: 'new' }}>
          <span>Add User</span>
          <IconUserPlus size={18} />
        </Link>
      </Button>
      {/* <Button className='space-x-1' onClick={() => setOpen('add')}>
        <span>Add User</span> <IconUserPlus size={18} />
      </Button> */}
    </div >
  )
}
