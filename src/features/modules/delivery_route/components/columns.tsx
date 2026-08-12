import LongText from '@/components/long-text'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'
import type { ColumnDef } from '@tanstack/react-table'

import type { DeliveryRoute } from '@/features/modules/delivery_route/data/schema'
import { DataTableColumnHeader } from '../../../global/components/data-table/data-table-column-header'
import RowActions from './row-actions'

export const columns: ColumnDef<DeliveryRoute>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
        className="translate-y-0.5"
      />
    ),
    meta: {
      className: cn(
        'sticky md:table-cell left-0 z-10 rounded-tl',
        'bg-background transition-colors duration-200 group-hover/row:bg-muted group-data-[state=selected]/row:bg-muted',
      ),
    },
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        className="translate-y-0.5"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    id: 'transporter',
    accessorFn: (row) => row.transporter?.name,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Transporter" />
    ),
    cell: ({ row }) => (
      <LongText className="max-w-36">{row.original.transporter?.name}</LongText>
    ),
    meta: {
      className: cn(
        'drop-shadow-[0_1px_2px_rgb(0_0_0_/_0.1)] dark:drop-shadow-[0_1px_2px_rgb(255_255_255_/_0.1)] lg:drop-shadow-none',
        'bg-background transition-colors duration-200 group-hover/row:bg-muted group-data-[state=selected]/row:bg-muted',
        'sticky left-0 md:table-cell',
      ),
    },
    enableHiding: false,
  },
  {
    id: 'sourcePlace',
    filterFn: 'includesString',
    accessorFn: (row) => row.sourcePlace?.name,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Source" />
    ),
    cell: ({ row }) => (
      <LongText className="max-w-36">{row.original.sourcePlace?.name}</LongText>
    ),
    meta: {
      className: cn(
        'drop-shadow-[0_1px_2px_rgb(0_0_0_/_0.1)] dark:drop-shadow-[0_1px_2px_rgb(255_255_255_/_0.1)] lg:drop-shadow-none',
        'bg-background transition-colors duration-200 group-hover/row:bg-muted group-data-[state=selected]/row:bg-muted',
        'sticky left-0 md:table-cell',
      ),
    },
    enableHiding: false,
  },
  {
    id: 'destinationPlace',
    accessorFn: (row) => row.destinationPlace?.name,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Destination" />
    ),
    filterFn: 'includesString',
    cell: ({ row }) => (
      <LongText className="max-w-36">
        {row.original.destinationPlace?.name}
      </LongText>
    ),
    enableHiding: false,
  },

  {
    accessorKey: 'vehicleNo',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Vehicle No" />
    ),
    cell: ({ row }) => <div>{row.getValue('vehicleNo')}</div>,
    enableSorting: false,
  },
  {
    accessorKey: 'rate',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Rate" />
    ),
    cell: ({ row }) => (
      <div>
        {row.getValue('rate') ? Number(row.getValue('rate')).toFixed(2) : '-'}
      </div>
    ),
    enableSorting: false,
  },

  {
    id: 'actions',
    cell: RowActions,
  },
]
