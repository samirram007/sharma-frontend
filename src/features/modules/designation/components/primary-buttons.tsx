import { Button } from '@/components/ui/button'
import { IconUserPlus } from '@tabler/icons-react'
import { useDesignation } from '../contexts/designation-context'


export function PrimaryButtons() {
  const { setOpen } = useDesignation()
  return (
    <div className='flex gap-2'>
      <Button className='space-x-1' onClick={() => setOpen('add')}>
        <span>Add Designation</span> <IconUserPlus size={18} />
      </Button>
    </div>
  )
}
