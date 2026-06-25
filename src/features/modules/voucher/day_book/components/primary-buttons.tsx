import { Button } from '@/components/ui/button'

import { IconPlus } from '@tabler/icons-react'
import { useDayBook } from '../contexts/day_book-context'


export function PrimaryButtons() {
  const { setOpen } = useDayBook()
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
        <span>Add Module</span> <IconPlus size={18} />
      </Button>
    </div>
  )
}
