import { Button } from '@/components/ui/button'


import { Route as TransporterDetailRoute } from '@/routes/_protected/masters/party/_layout/transporter/_layout/$id'

import { IconPlus } from '@tabler/icons-react'
import { Link } from '@tanstack/react-router'



import { useDeliveryVehicle } from '../contexts/delivery_vehicle-context';


interface PrimaryButtonsProps {
  isModal?: boolean;
  type?: 'icon' | 'text';
}

export function PrimaryButtons({ isModal = false, type = 'text' }: PrimaryButtonsProps) {

  return (
    <div className='flex gap-2'>
      {isModal ? (
        <DeliveryVehicleModalPrimaryButtons type={type} />
      ) : (
        <Button asChild className="space-x-1">
          <Link to={TransporterDetailRoute.to} params={{ id: 'new' }}>
            <span>Add Delivery Vehicle</span>
            <IconPlus size={18} />
          </Link>
        </Button>
      )
      }
    </div >
  )
}

export const DeliveryVehicleModalPrimaryButtons = ({ type }: PrimaryButtonsProps) => {
  const { setOpen } = useDeliveryVehicle()
  // console.log("PrimaryButtons", open)
  return (
    <div className='flex gap-2'>
      <Button className='space-x-1' size={'sm'} variant={'outline'} title='Add Delivery Vehicle' onClick={() => setOpen('add')}>
        {type === 'icon' ? <IconPlus size={18} /> :
          <><span>Add Delivery Vehicle</span> <IconPlus size={18} /></>
        }
      </Button>
    </div >
  )
};



