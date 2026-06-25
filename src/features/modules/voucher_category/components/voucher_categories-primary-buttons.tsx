import { Button } from '@/components/ui/button'

import { IconCirclePlus } from '@tabler/icons-react'
import { useVoucherCategory } from '../contexts/voucher-categories-context'


export function VoucherCategorysPrimaryButtons() {
  const { setOpen } = useVoucherCategory()
  return (
    <div className='flex gap-2'>
      {/* <Button
        variant='outline'
        className='space-x-1'
        onClick={() => setOpen('invite')}
      >
        <span>Invite User</span> <IconMailPlus size={18} />
      </Button> */}
      <Button className='space-x-1' onClick={() => setOpen('add')}>
        <span>Add Voucher Category</span> <IconCirclePlus size={18} />
      </Button>
    </div>
  )
}
