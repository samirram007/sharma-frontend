import LongText from '@/components/long-text'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'
import type { ColumnDef } from '@tanstack/react-table'



import type { Country } from '@/features/modules/country/data/schema'

import { DataTableColumnHeader } from '../../../global/components/data-table/data-table-column-header'
import RowActions from './row-actions'
export const columns: ColumnDef<Country>[] = [
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
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Name' />
    ),
    cell: ({ row }) => (
      <LongText className='max-w-36'>{row.getValue('name')}</LongText>
    ),
    meta: {
      className: cn(
        'drop-shadow-[0_1px_2px_rgb(0_0_0_/_0.1)] dark:drop-shadow-[0_1px_2px_rgb(255_255_255_/_0.1)] lg:drop-shadow-none',
        'bg-background transition-colors duration-200 group-hover/row:bg-muted group-data-[state=selected]/row:bg-muted',
        'sticky left-0 md:table-cell'
      ),
    },
    enableHiding: false,
  },

  {
    accessorKey: 'phoneCode',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Phone Code' />
    ),
    cell: ({ row }) => (
      <div className='w-fit text-nowrap'>{row.getValue('phoneCode')}</div>
    ),
  },
  {
    accessorKey: 'isoCode',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Iso Code' />
    ),
    cell: ({ row }) => (
      <div className='w-fit text-nowrap'>{row.getValue('isoCode')}</div>
    ),
  },



  {
    id: 'actions',
    cell: RowActions,
  },
]
