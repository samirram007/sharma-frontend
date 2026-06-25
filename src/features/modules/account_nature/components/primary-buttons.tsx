import { Button } from '@/components/ui/button'
import { useAccountNature } from '@/features/modules/account_nature/contexts/account_nature-context'
import { IconUserPlus } from '@tabler/icons-react'


export function PrimaryButtons() {
  const { setOpen } = useAccountNature()
  return (
    <div className='flex gap-2'>
      <Button className='space-x-1' onClick={() => setOpen('add')}>
        <span>Add Account Nature</span> <IconUserPlus size={18} />
      </Button>
    </div>
  )
}
