import LongText from '@/components/long-text'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'
import type { ColumnDef } from '@tanstack/react-table'

import { ActiveInactiveStatusTypes } from '@/types/active-inactive-status'
import { DataTableColumnHeader } from '../../../global/components/data-table/data-table-column-header'
import type { User } from '../data/schema'
import RowActions from './row-actions'
import AssignRole from './assign-role'
import type { RoleList } from '../../role/data/schema'

export const columns = (roles: RoleList): ColumnDef<User>[] => [
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
        className="translate-y-[2px]"
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
        className="translate-y-[2px]"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
    cell: ({ row }) => (
      <LongText className="max-w-36">{row.getValue('name')}</LongText>
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
    accessorKey: 'username',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Username" />
    ),
    cell: ({ row }) => (
      <div className="w-fit text-nowrap">{row.getValue('username')}</div>
    ),
  },
  {
    accessorKey: 'email',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Email" />
    ),
    cell: ({ row }) => <div>{row.getValue('email')}</div>,
    enableSorting: false,
  },
  {
    accessorKey: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const { status } = row.original
      const badgeColor = ActiveInactiveStatusTypes.get(status)
      return (
        <div className="flex space-x-2">
          <Badge variant="outline" className={cn('capitalize', badgeColor)}>
            {row.getValue('status')}
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
    id: 'assignRole',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Assign Role" />
    ),
    cell: ({ row }) => <AssignRole row={row} roles={roles} />,
    enableSorting: false,
    enableHiding: false,
  },

  {
    id: 'actions',
    cell: RowActions,
  },
]
