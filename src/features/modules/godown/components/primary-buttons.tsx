import { Button } from '@/components/ui/button'
import { IconUserPlus } from '@tabler/icons-react'
import { useGodown } from '../contexts/godown-context'


export function PrimaryButtons() {
  const { setOpen } = useGodown()
  return (
    <div className='flex gap-2'>
      <Button className='space-x-1' onClick={() => setOpen('add')}>
        <span>Add Godown</span> <IconUserPlus size={18} />
      </Button>
    </div>
  )
}
