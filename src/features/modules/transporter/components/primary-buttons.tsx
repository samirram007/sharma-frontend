
import { Button } from '@/components/ui/button'
import { Route as TransporterDetailRoute } from '@/routes/_protected/masters/party/_layout/transporter/_layout/$id'

import { IconPlus, IconTransformPoint, IconUserPlus } from '@tabler/icons-react'
import { Link } from '@tanstack/react-router'



import { useTransporter } from '../contexts/transporter-context';


interface PrimaryButtonsProps {
  isModal?: boolean;
  type?: 'icon' | 'text';
}

export function PrimaryButtons({ isModal = false, type = 'text' }: PrimaryButtonsProps) {

  return (
    <div className='flex gap-2'>
      {isModal ? (
        <TransporterModalPrimaryButtons type={type} />
      ) : (
      <Button asChild className="space-x-1">
        <Link to={TransporterDetailRoute.to} params={{ id: 'new' }}>
          <span>Add Transporter</span>
          <IconUserPlus size={18} />
        </Link>
      </Button>
      )
      }
    </div >
  )
}

export const TransporterModalPrimaryButtons = ({ type }: PrimaryButtonsProps) => {
  const { setOpen } = useTransporter()

  return (
    <div className='flex gap-2'>
      <Button className='space-x-1' size={'sm'} variant={'outline'} title='Add Transporter' onClick={() => setOpen('add')}>
        {type === 'icon' ? <IconPlus size={18} className='h-4' /> :
          <><span>Add Transporter</span> <IconTransformPoint size={18} /></>
        }
      </Button>

    </div >
  )
};
