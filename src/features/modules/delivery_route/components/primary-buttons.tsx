import { Button } from '@/components/ui/button'
import { useDeliveryRoute } from '@/features/modules/delivery_route/contexts/delivery_route-context'
import { IconUserPlus } from '@tabler/icons-react'


export function PrimaryButtons() {
  const { setOpen } = useDeliveryRoute()
  return (
    <div className='flex gap-2'>
      <Button className='space-x-1' onClick={() => setOpen('add')}>
        <span>Add Delivery Route</span> <IconUserPlus size={18} />
      </Button>
    </div>
  )
}
