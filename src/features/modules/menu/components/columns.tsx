import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'
import type { ColumnDef } from '@tanstack/react-table'

import { DataTableColumnHeader } from '@/features/global/components/data-table/data-table-column-header'
import { ActiveInactiveStatusTypes } from '@/types/active-inactive-status'
import type { Menu } from '../data/schema'
import RowActions from './row-actions'

export const columns: ColumnDef<Menu>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label='Select all'
        className='translate-y-[2px]'
      />
    ),
    meta: {
      className: cn(
        'sticky md:table-cell left-0 z-10 rounded-tl',
        'bg-background transition-colors duration-200 group-hover/row:bg-muted group-data-[state=selected]/row:bg-muted'
      ),
    },
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label='Select row'
        className='translate-y-[2px]'
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'menuName',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Menu Name' />
    ),
    cell: ({ row }) => (
      <div className='flex items-center gap-2'>
        {row.original.isGroup && (
          <Badge variant='secondary' className='text-[10px] px-1 py-0'>Group</Badge>
        )}
        <span className='font-medium'>{row.getValue('menuName')}</span>
      </div>
    ),
    meta: {
      className: cn(
        'drop-shadow-[0_1px_2px_rgb(0_0_0_/_0.1)] dark:drop-shadow-[0_1px_2px_rgb(255_255_255_/_0.1)] lg:drop-shadow-none',
        'bg-background transition-colors duration-200 group-hover/row:bg-muted',
        'sticky left-0 md:table-cell'
      ),
    },
    enableHiding: false,
  },
  {
    accessorKey: 'route',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Route' />
    ),
    cell: ({ row }) => (
      <code className='rounded bg-muted px-1.5 py-0.5 text-xs font-mono'>
        {row.getValue('route') ?? '—'}
      </code>
    ),
  },
  {
    accessorKey: 'icon',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Icon' />
    ),
    cell: ({ row }) => (
      <div className='text-sm text-muted-foreground'>{row.getValue('icon') ?? '—'}</div>
    ),
  },
  {
    accessorKey: 'sortOrder',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Sort Order' />
    ),
    cell: ({ row }) => <div className='text-center'>{row.getValue('sortOrder')}</div>,
  },
  {
    accessorKey: 'feature',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Feature' />
    ),
    cell: ({ row }) => {
      const feature = row.original.feature
      return (
        <div className='text-sm'>
          {feature ? (
            <Badge variant='outline' className='text-[10px] font-mono'>{feature.code}</Badge>
          ) : (
            <span className='text-muted-foreground/50'>—</span>
          )}
        </div>
      )
    },
  },
  {
    accessorKey: 'parent',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Parent' />
    ),
    cell: ({ row }) => {
      const parent = row.original.parent
      return (
        <div className='text-sm text-muted-foreground'>
          {parent?.menuName ?? '—'}
        </div>
      )
    },
  },
  {
    accessorKey: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Status' />
    ),
    cell: ({ row }) => {
      const { status } = row.original
      const badgeColor = ActiveInactiveStatusTypes.get(status)
      return (
        <Badge variant='outline' className={cn('capitalize', badgeColor)}>
          {status}
        </Badge>
      )
    },
    filterFn: (row, id, value) => value.includes(row.getValue(id)),
    enableHiding: false,
    enableSorting: false,
  },
  {
    accessorKey: 'isVisible',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Visible' />
    ),
    cell: ({ row }) => {
      const visible = row.original.isVisible
      return (
        <Badge variant='outline' className={visible ? 'text-green-600 border-green-300' : 'text-red-600 border-red-300'}>
          {visible ? 'Yes' : 'No'}
        </Badge>
      )
    },
  },
  {
    accessorKey: 'description',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Description' />
    ),
    cell: ({ row }) => (
      <div className='max-w-48 truncate text-sm text-muted-foreground'>
        {row.getValue('description') ?? '—'}
      </div>
    ),
    enableSorting: false,
  },
  {
    id: 'actions',
    cell: RowActions,
  },
]
