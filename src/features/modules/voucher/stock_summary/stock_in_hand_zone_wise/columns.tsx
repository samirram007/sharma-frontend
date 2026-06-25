import LongText from '@/components/long-text'

import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'
import type { ColumnDef } from '@tanstack/react-table'



import { DataTableColumnHeader } from '@/features/global/components/data-table/data-table-column-header'



import type { StockInHandGodownWiseSchema } from '../data/schema'


export const columns: ColumnDef<StockInHandGodownWiseSchema>[] = [
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
    accessorKey: 'zoneId',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='PARTICULARS' />
    ),
    cell: ({ row }) => {

      return (
        <LongText className='max-w-36 flex items-center gap-2'>
          {row.getValue('itemName')}
        </LongText>
      );
    },
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
    accessorKey: 'zoneName',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='ZONE NAME' />
    ),
    cell: ({ row }) => (
      <div className='w-fit text-nowrap'>{row.getValue('zoneName')}</div>
    ),
    filterFn: (row, id, value: string[]) => {
      if (!Array.isArray(value) || value.length === 0) return true
      return value.includes(String(row.getValue(id)))
    },
    enableHiding: false,
    enableSorting: false,
  },



  {
    accessorKey: 'openingQuantity',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Opening Quantity' />
    ),
    cell: ({ row }) => {

      return (
        <div className='flex space-x-2'>
          {row.getValue('openingQuantity')}


        </div>
      )
    },
    enableHiding: false,
  },

  {
    accessorKey: 'openingAmount',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Opening Amount' className='text-right pr-8' />
    ),
    cell: ({ row }) => {


      return (
        <div className='flex space-x-2 justify-end pr-4'>
          {Number(row.getValue('openingAmount')).toFixed(2)}

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
    accessorKey: 'inwardQuantity',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Inward Quantity' />
    ),
    cell: ({ row }) => {

      return (
        <div className='flex space-x-2'>
          {row.getValue('inwardQuantity')}


        </div>
      )
    },
    enableHiding: false,
  },

  {
    accessorKey: 'inwardAmount',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Inward Amount' className='text-right pr-8' />
    ),
    cell: ({ row }) => {


      return (
        <div className='flex space-x-2 justify-end pr-4'>
          {Number(row.getValue('inwardAmount')).toFixed(2)}

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
    accessorKey: 'outwardQuantity',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Outward Quantity' />
    ),
    cell: ({ row }) => {

      return (
        <div className='flex space-x-2'>
          {row.getValue('outwardQuantity')}
        </div>
      )
    },
    enableHiding: false,
  },
  {
    accessorKey: 'outwardAmount',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Outward Amount' className='text-right pr-8' />
    ),
    cell: ({ row }) => {

      return (
        <div className='flex space-x-2 justify-end pr-4'>
          {Number(row.getValue('outwardAmount')).toFixed(2)}
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
    accessorKey: 'closingQuantity',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Closing Quantity' />
    ),
    cell: ({ row }) => {

      return (
        <div className='flex space-x-2'>
          {row.getValue('closingQuantity')}
        </div>
      )
    },
    enableHiding: false,
  },
  {
    accessorKey: 'closingAmount',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Closing Amount' className='text-right pr-8' />
    ),
    cell: ({ row }) => {

      return (
        <div className='flex space-x-2 justify-end pr-4'>
          {Number(row.getValue('closingAmount')).toFixed(2)}
        </div>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
    enableHiding: false,
    enableSorting: false,
  }
]


