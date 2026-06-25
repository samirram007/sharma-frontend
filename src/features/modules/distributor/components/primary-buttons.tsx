
import { Button } from '@/components/ui/button'
import { Route as DistributorDetailRoute } from '@/routes/_protected/masters/party/_layout/distributor/_layout/$id'

import { IconUserPlus } from '@tabler/icons-react'
import { Link } from '@tanstack/react-router'
import { useDistributor } from '../contexts/distributor-context';


interface PrimaryButtonsProps {
  isModal?: boolean;
  type?: 'icon' | 'text';
}

export function PrimaryButtons({ isModal = false, type = 'text' }: PrimaryButtonsProps) {

  return (
    <div className='flex gap-2'>
      {isModal ? (
        <DistributorModalPrimaryButtons type={type} />
      ) : (
      <Button asChild className="space-x-1">
        <Link to={DistributorDetailRoute.to} params={{ id: 'new' }}>
          <span>Add Distributor</span>
          <IconUserPlus size={18} />
        </Link>
      </Button>
      )
      }
    </div >
  )
}

export const DistributorModalPrimaryButtons = ({ type }: PrimaryButtonsProps) => {
  const { setOpen } = useDistributor()
  // console.log("PrimaryButtons", open)
  return (
    <div className='flex gap-2'>
      <Button className='space-x-1' size={'sm'} variant={'outline'} onClick={() => setOpen('add')}>
        {type === 'icon' ? <IconUserPlus size={18} /> :
          <><span>Add Distributor</span> <IconUserPlus size={18} /></>
        }
      </Button>
    </div >
  )
};
