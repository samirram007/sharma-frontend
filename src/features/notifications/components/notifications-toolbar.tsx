import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { IconCheck } from '@tabler/icons-react'
import type { NotificationFilter } from '../data/schema'
import { NOTIFICATION_TYPES } from '../data/schema'

interface NotificationsToolbarProps {
  filters: NotificationFilter
  onFilterChange: (partial: Partial<NotificationFilter>) => void
  onMarkAllAsRead: () => void
  isMarkingAll: boolean
}

export function NotificationsToolbar({
  filters,
  onFilterChange,
  onMarkAllAsRead,
  isMarkingAll,
}: NotificationsToolbarProps) {
  const readTabValue =
    filters.is_read === undefined ? 'all' : filters.is_read ? 'unread' : 'read'

  const handleTabChange = (value: string) => {
    switch (value) {
      case 'all':
        onFilterChange({ is_read: undefined })
        break
      case 'unread':
        onFilterChange({ is_read: true })
        break
      case 'read':
        onFilterChange({ is_read: false })
        break
    }
  }

  return (
    <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
      <div className='flex items-center gap-2'>
        <Tabs value={readTabValue} onValueChange={handleTabChange}>
          <TabsList className='h-9'>
            <TabsTrigger value='all' className='text-xs px-3'>
              All
            </TabsTrigger>
            <TabsTrigger value='unread' className='text-xs px-3'>
              Unread
            </TabsTrigger>
            <TabsTrigger value='read' className='text-xs px-3'>
              Read
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <Select
          value={filters.type}
          onValueChange={(value) => onFilterChange({ type: value })}
        >
          <SelectTrigger className='h-9 w-[130px] text-xs'>
            <SelectValue placeholder='Type' />
          </SelectTrigger>
          <SelectContent>
            {NOTIFICATION_TYPES.map((type) => (
              <SelectItem key={type.value} value={type.value} className='text-xs'>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className='flex items-center gap-2'>
        <Button
          variant='outline'
          size='sm'
          className='h-9 text-xs'
          onClick={onMarkAllAsRead}
          disabled={isMarkingAll}
        >
          <IconCheck size={14} className='mr-1.5' />
          Mark all read
        </Button>
      </div>
    </div>
  )
}
