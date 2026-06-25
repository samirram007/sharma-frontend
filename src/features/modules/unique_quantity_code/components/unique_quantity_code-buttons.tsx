import { Button } from '@/components/ui/button'

import { IconPlus } from '@tabler/icons-react'
import { useUniqueQuantityCode } from '../contexts/unique_quantity_code-context'


export function UniqueQuantityCodePrimaryButtons() {
  const { setOpen } = useUniqueQuantityCode()
  return (
    <div className='flex gap-2'>

      <Button variant='default' className='space-x-1' onClick={() => setOpen('add')}>
        <span>Add Unique Quantity Code...</span> <IconPlus size={18} />
      </Button>
    </div>
  )
}
