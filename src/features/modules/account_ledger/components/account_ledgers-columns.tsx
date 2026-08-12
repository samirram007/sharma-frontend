import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'
import type { ColumnDef } from '@tanstack/react-table'

import { accountLedgerStatusTypes } from '@/features/modules/account_ledger/data/data'
import type { AccountLedger } from '@/features/modules/account_ledger/data/schema'
import { AccountLedgerView } from './account_ledger-view'
import { DataTableColumnHeader } from './data-table-column-header'
import { DataTableRowActions } from './data-table-row-actions'

export const columns: ColumnDef<AccountLedger>[] = [
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
    cell: AccountLedgerView,
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
    accessorKey: 'code',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Code" />
    ),
    cell: ({ row }) => (
      <div className="w-fit text-nowrap">{row.getValue('code')}</div>
    ),
  },
  {
    id: 'accountGroupId',
    accessorFn: (row) => {
      const group = row.accountGroup
      return group ? String(group.id) : ''
    },
    filterFn: (row, _id, value) => {
      const group = row.original.accountGroup
      if (!group) return false
      return value.includes(String(group.id))
    },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Under" />
    ),
    cell: ({ row }) => {
      const { accountGroup } = row.original
      if (!accountGroup) {
        return <div className="text-muted-foreground">N/A</div>
      }

      return (
        <div className="flex space-x-2">
          <Badge variant="secondary" className="capitalize">
            <div className="text-muted-foreground">
              {accountGroup.accountNature.name}:{' '}
            </div>
            {accountGroup.name}
          </Badge>
        </div>
      )
    },
    enableHiding: false,
    enableSorting: true,
  },
  {
    accessorKey: 'description',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Description" />
    ),
    cell: ({ row }) => <div>{row.getValue('description')}</div>,
    enableSorting: false,
  },
  {
    accessorKey: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const { status } = row.original
      const badgeColor = accountLedgerStatusTypes.get(status)
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
    id: 'actions',
    cell: DataTableRowActions,
  },
]
