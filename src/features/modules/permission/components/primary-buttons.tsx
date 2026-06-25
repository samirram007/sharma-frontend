import { Button } from '@/components/ui/button'
import { IconUserPlus } from '@tabler/icons-react'
import { usePermission } from '../contexts/permission-context'


export function PrimaryButtons() {
  const { setOpen } = usePermission()
  return (
    <div className='flex gap-2'>
      <Button className='space-x-1' onClick={() => setOpen('add')}>
        <span>Add Permission</span> <IconUserPlus size={18} />
      </Button>
    </div>
  )
}
