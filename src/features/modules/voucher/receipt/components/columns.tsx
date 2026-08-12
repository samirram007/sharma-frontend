import LongText from '@/components/long-text'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'
import type { ColumnDef } from '@tanstack/react-table'

import { DataTableColumnHeader } from '@/features/global/components/data-table/data-table-column-header'

import {
  lowerCase,
  toSentenceCase,
} from '../../../../../utils/removeEmptyStrings'
import { VoucherTypeColorMapping } from '../data/data'
import type { ReceiptSchema } from '../data/schema'
import RowActions from './row-actions'
import { useAuth } from '@/features/auth/contexts/AuthContext'
import { FEATURES } from '@/data/features'

export const columns: ColumnDef<ReceiptSchema>[] = [
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
      className: cn('sticky md:table-cell left-0 z-10 rounded-tl'),
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
    accessorKey: 'voucherDate',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Date" />
    ),
    cell: ({ row }) => {
      return (
        <LongText className="max-w-36 flex items-center gap-2">
          {formatDDMMMYYYY(row.getValue('voucherDate'))}
        </LongText>
      )
    },
    meta: {
      className: cn(
        'drop-shadow-[0_1px_2px_rgb(0_0_0_/_0.1)] dark:drop-shadow-[0_1px_2px_rgb(255_255_255_/_0.1)] lg:drop-shadow-none',
        '  transition-colors duration-200  ',
        'sticky left-0 md:table-cell',
      ),
    },
    enableHiding: false,
  },

  {
    accessorKey: 'partyLedger',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Particulars" />
    ),
    cell: ({ row }) => {
      const { permissions } = useAuth()
      const { partyLedger, voucherType } = row.original
      const key = lowerCase(voucherType?.name ?? '').replace(/\s+/g, '_')
      const badgeColor = VoucherTypeColorMapping.get(key)
      const DEVELOPER_ACCESS_VIEW = permissions.includes(
        FEATURES.DEVELOPER_ACCESS_VIEW,
      )
      // console.log("partyLedger", row.original)
      if (!partyLedger) {
        return (
          <div className="text-muted-foreground">
            Primary -
            {DEVELOPER_ACCESS_VIEW &&
              row.original.id + '-' + row.original.voucherType?.id}
          </div>
        )
      }
      return (
        <div className="flex space-x-2">
          <Badge
            variant="outline"
            className={cn('capitalize', badgeColor, 'bg-transparent')}
          >
            {/* <div className='text-muted-foreground'>{parentId.name}: </div> */}
            {partyLedger?.name ?? 'Unknown'}
          </Badge>

          {DEVELOPER_ACCESS_VIEW &&
            row.original.id + '-' + row.original.voucherType?.id}
        </div>
      )
    },
    enableHiding: false,
  },
  {
    accessorKey: 'voucherType',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Vch. Type" />
    ),
    cell: ({ row }) => {
      const { voucherType, module } = row.original
      const tagkey = module
        ? module
        : (toSentenceCase(voucherType?.name) ?? 'Unknown')
      const key = lowerCase(tagkey ?? '')
        .replace('_voucher', '')
        .replace(/\s+/g, '_')
      const badgeColor = VoucherTypeColorMapping.get(key)
      if (!voucherType) {
        return <div className="text-muted-foreground">Primary</div>
      }
      return (
        <div className="flex space-x-2">
          <Badge variant="default" className={cn('capitalize', badgeColor)}>
            {/* <div className='text-muted-foreground'>{parentId.name}: </div> */}
            {toSentenceCase(key)}
          </Badge>
        </div>
      )
    },
    enableHiding: false,
  },
  {
    accessorKey: 'voucherNo',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="VchNo." />
    ),
    cell: ({ row }) => <div>{row.getValue('voucherNo')}</div>,
    enableSorting: false,
  },
  {
    accessorKey: 'amount',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Amount"
        className="text-right pr-8"
      />
    ),
    cell: ({ row }) => {
      const badgeColor =
        'text-slate-700 dark:text-slate-200 border-green-600/80'
      return (
        <div className="flex space-x-2 justify-end pr-4">
          <Badge
            variant="outline"
            className={cn('capitalize', badgeColor, 'border-0 bg-transparent')}
          >
            {Number(row.getValue('amount')).toFixed(2)}
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

const formatDDMMMYYYY = (value: string | Date) => {
  const date = new Date(value)
  const day = String(date.getDate()).padStart(2, '0')
  const month = date.toLocaleString('en-US', { month: 'short' })
  const year = date.getFullYear()
  return `${day}-${month}-${year}`
}
