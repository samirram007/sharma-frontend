import LongText from '@/components/long-text'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'
import { IconLock, IconLockOpen } from '@tabler/icons-react'
import { useAuth } from '@/features/auth/contexts/AuthContext'
import type { ColumnDef, Row } from '@tanstack/react-table'

import type { FiscalYear } from '@/features/modules/fiscal_year/data/schema'

import { DataTableColumnHeader } from '../../../global/components/data-table/data-table-column-header'
import RowActions from './row-actions'

/** Fiscal year name cell with a badge when it's the user's assigned fiscal year. */
function FiscalYearNameCell({ row }: { row: Row<FiscalYear> }) {
  const { userFiscalYear } = useAuth()
  const isAssigned = userFiscalYear?.fiscalYearId === row.original.id

  return (
    <div className="flex items-center gap-2">
      <LongText className="max-w-full">{row.getValue('name')}</LongText>
      {isAssigned && (
        <Badge
          variant="secondary"
          className="shrink-0 px-2 py-0 text-[11px] font-medium"
        >
          Current FY
        </Badge>
      )}
    </div>
  )
}
export const columns: ColumnDef<FiscalYear>[] = [
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
        'group-data-[assigned]/row:bg-primary/5',
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
    cell: ({ row }) => <FiscalYearNameCell row={row} />,
    meta: {
      className: cn(
        'drop-shadow-[0_1px_2px_rgb(0_0_0_/_0.1)] dark:drop-shadow-[0_1px_2px_rgb(255_255_255_/_0.1)] lg:drop-shadow-none',
        'bg-background transition-colors duration-200 group-hover/row:bg-muted group-data-[state=selected]/row:bg-muted',
        'group-data-[assigned]/row:bg-primary/5',
        'sticky left-0 md:table-cell',
      ),
    },
    enableHiding: false,
  },

  {
    accessorKey: 'closedAt',
    id: 'closeStatus',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Close Status" />
    ),
    cell: ({ row }) => {
      const closedAt = row.original.closedAt
      const isClosed = !!closedAt
      return isClosed ? (
        <div className="flex items-center gap-1.5">
          <IconLock className="h-3.5 w-3.5 text-destructive" />
          <Badge variant="destructive" className="text-xs">
            Closed
          </Badge>
          <span className="text-xs text-muted-foreground ml-1">
            {new Date(closedAt).toLocaleDateString('en-IN', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            })}
          </span>
        </div>
      ) : (
        <div className="flex items-center gap-1.5">
          <IconLockOpen className="h-3.5 w-3.5 text-green-600" />
          <Badge
            variant="outline"
            className="border-green-300 text-green-700 dark:text-green-400 text-xs"
          >
            Open
          </Badge>
        </div>
      )
    },
    filterFn: (row, _id, value) => {
      const closedAt = row.original.closedAt
      const isClosed = !!closedAt
      return value.includes(isClosed ? 'closed' : 'open')
    },
    enableSorting: true,
    enableHiding: false,
  },

  {
    accessorKey: 'companyId',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Company" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <Badge variant="outline">{row.original.company?.name}</Badge>
        </div>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const status = row.getValue('status') as string
      return status === 'active' ? (
        <Badge variant="default">Active</Badge>
      ) : (
        <Badge variant="destructive">Inactive</Badge>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
    enableSorting: false,
    enableHiding: false,
  },

  {
    id: 'actions',
    cell: RowActions,
  },
]
