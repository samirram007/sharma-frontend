import { Button } from '@/components/ui/button'

import { IconCirclePlus } from '@tabler/icons-react'
import { useVoucherClassification } from '../contexts/voucher-classification-context'


export function VoucherClassificationsPrimaryButtons() {
  const { setOpen } = useVoucherClassification()
  return (
    <div className='flex gap-2'>

      <Button className='space-x-1' onClick={() => setOpen('add')}>
        <span>Add Voucher Classification</span> <IconCirclePlus size={18} />
      </Button>
    </div>
  )
}
