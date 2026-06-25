
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'
import type { ColumnDef } from '@tanstack/react-table'



import { DataTableColumnHeader } from '@/features/global/components/data-table/data-table-column-header'




import type { DistributorBookSchema } from '../data/schema'
import RowActions from './row-actions'


export const columns: ColumnDef<DistributorBookSchema>[] = [
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
        className='translate-y-0.5'
      />
    ),
    meta: {
      className: cn(
        'sticky md:table-cell left-0 z-10 rounded-tl',
      ),
    },
    cell: ({ row }) => (

      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label='Select row'
        className='translate-y-0.5'
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },



  {
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Distributor' />
    ),
    cell: ({ row }) => {

      return (
        <div className='max-w-sm px-2 ' >
          {row.getValue('name')}
        </div>
      )
    },
    enableHiding: false,
  },

  {
    accessorKey: 'debit',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Debit' className='text-right pr-8' />
    ),
    cell: ({ row }) => {

      const badgeColor = 'text-slate-700 dark:text-slate-200 border-green-600/80'
      return (
        <div className='flex space-x-2 justify-end pr-4'>
          <Badge variant='outline' className={cn('capitalize', badgeColor, 'border-0 bg-transparent')}>
            {Number(row.getValue('debit')).toFixed(2)}
          </Badge>
        </div>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
    enableHiding: false,
    enableSorting: false,
  },
  {
    accessorKey: 'credit',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Credit' className='text-right pr-8' />
    ),
    cell: ({ row }) => {

      const badgeColor = 'text-slate-700 dark:text-slate-200 border-green-600/80'
      return (
        <div className='flex space-x-2 justify-end pr-4'>
          <Badge variant='outline' className={cn('capitalize', badgeColor, 'border-0 bg-transparent')}>
            {Number(row.getValue('credit')).toFixed(2)}
          </Badge>
        </div>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
    enableHiding: false,
    enableSorting: false,
  },
  {
    accessorKey: 'balance',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Balance' className='text-right pr-8' />
    ),
    cell: ({ row }) => {

      const badgeColor = 'text-slate-700 dark:text-slate-200 border-green-600/80'
      return (
        <div className='flex space-x-2 justify-end pr-4'>
          <Badge variant='outline' className={cn('capitalize', badgeColor, 'border-0 bg-transparent')}>
            {Number(row.getValue('balance')).toFixed(2)}
          </Badge>
        </div>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
    enableHiding: false,
    enableSorting: false,
  },

  {
    id: 'actions',
    cell: RowActions,
  },
]


