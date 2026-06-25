import { Button } from '@/components/ui/button'
import { useDeliveryPlace } from '@/features/modules/delivery_place/contexts/delivery_place-context'
import { IconUserPlus } from '@tabler/icons-react'


export function PrimaryButtons() {
  const { setOpen } = useDeliveryPlace()
  return (
    <div className='flex gap-2'>
      <Button className='space-x-1' onClick={() => setOpen('add')}>
        <span>Add Delivery Place</span> <IconUserPlus size={18} />
      </Button>
    </div>
  )
}
