import { Button } from '@/components/ui/button'
import { IconUserPlus } from '@tabler/icons-react'
import { useShift } from '../contexts/shift-context'


export function PrimaryButtons() {
  const { setOpen } = useShift()
  return (
    <div className='flex gap-2'>
      <Button className='space-x-1' onClick={() => setOpen('add')}>
        <span>Add Shift</span> <IconUserPlus size={18} />
      </Button>
    </div>
  )
}
