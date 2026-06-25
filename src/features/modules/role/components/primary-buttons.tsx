import { Button } from '@/components/ui/button'
import { IconUserPlus } from '@tabler/icons-react'
import { useRole } from '../contexts/role-context'


export function PrimaryButtons() {
  const { setOpen } = useRole()
  return (
    <div className='flex gap-2'>
      <Button className='space-x-1' onClick={() => setOpen('add')}>
        <span>Add Role</span> <IconUserPlus size={18} />
      </Button>
    </div>
  )
}
