
import { Button } from '@/components/ui/button'
import { Route as CountryDetailRoute } from '@/routes/_protected/masters/organization/_layout/country/_layout/$id'

import { IconUserPlus } from '@tabler/icons-react'
import { Link } from '@tanstack/react-router'

export function PrimaryButtons() {
  // const { setOpen } = useCountry()
  return (
    <div className='flex gap-2'>
      <Button asChild className="space-x-1">
        <Link to={CountryDetailRoute.to} params={{ id: 'new' }}>
          <span>Add Country</span>
          <IconUserPlus size={18} />
        </Link>
      </Button>
      {/* <Button className='space-x-1' onClick={() => setOpen('add')}>
        <span>Add Country</span> <IconUserPlus size={18} />
      </Button> */}
    </div >
  )
}
