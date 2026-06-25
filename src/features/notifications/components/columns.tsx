import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { ColumnDef } from '@tanstack/react-table'
import { formatDistanceToNow } from 'date-fns'
import { cn } from '@/lib/utils'
import { IconCheck } from '@tabler/icons-react'
import type { NotificationItem } from '../data/schema'

const TYPE_STYLES: Record<string, { label: string; classes: string }> = {
  warning: {
    label: 'Warning',
    classes:
      'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200 dark:border-amber-800',
  },
  error: {
    label: 'Error',
    classes:
      'bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-300 border-red-200 dark:border-red-800',
  },
  info: {
    label: 'Info',
    classes:
      'bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300 border-blue-200 dark:border-blue-800',
  },
  success: {
    label: 'Success',
    classes:
      'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
  },
}

export function columns(
  opts: { onMarkRead: (id: number) => void },
): Array<ColumnDef<NotificationItem>> {
  return [
    {
      accessorKey: 'type',
      header: 'Type',
      cell: ({ row }) => {
        const type = row.original.type
        const style = TYPE_STYLES[type] ?? TYPE_STYLES.info
        return (
          <Badge
            variant='outline'
            className={cn('text-xs font-medium', style.classes)}
          >
            {style.label}
          </Badge>
        )
      },
      enableSorting: false,
      size: 100,
    },
    {
      accessorKey: 'title',
      header: 'Title',
      cell: ({ row }) => {
        const { title, message, isRead } = row.original
        return (
          <div className='flex flex-col gap-0.5'>
            <span
              className={cn(
                'text-sm leading-tight',
                isRead
                  ? 'font-normal text-slate-600 dark:text-slate-400'
                  : 'font-semibold text-slate-900 dark:text-slate-100',
              )}
            >
              {title}
            </span>
            {message && (
              <span className='text-xs text-slate-500 dark:text-slate-500 line-clamp-1'>
                {message}
              </span>
            )}
          </div>
        )
      },
      enableSorting: false,
    },
    {
      accessorKey: 'createdAt',
      header: 'Received',
      cell: ({ row }) => {
        const date = row.original.createdAt
        return (
          <span className='text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap'>
            {formatDistanceToNow(new Date(date), { addSuffix: true })}
          </span>
        )
      },
      size: 140,
    },
    {
      id: 'actions',
      header: () => <span className='sr-only'>Actions</span>,
      cell: ({ row }) => {
        if (row.original.isRead) return null
        return (
          <Button
            variant='ghost'
            size='icon'
            className='h-7 w-7 rounded-full'
            onClick={(e) => {
              e.stopPropagation()
              opts.onMarkRead(row.original.id)
            }}
            title='Mark as read'
          >
            <IconCheck
              size={14}
              className='text-slate-400 hover:text-emerald-500'
            />
          </Button>
        )
      },
      size: 60,
    },
  ]
}
