import LongText from '@/components/long-text'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import type { ColumnDef } from '@tanstack/react-table'

import { DataTableColumnHeader } from '@/features/global/components/data-table/data-table-column-header'

import {
  lowerCase,
  toSentenceCase,
} from '../../../../../utils/removeEmptyStrings'
import { VoucherTypeColorMapping } from '../data/data'
import type { DayBookSchema } from '../data/schema'
import RowActions from './row-actions'
import { useAuth } from '@/features/auth/contexts/AuthContext'
import { FEATURES } from '@/data/features'

export const columns: ColumnDef<DayBookSchema>[] = [
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
    id: 'dispatchDetails',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Dispatch Details" />
    ),
    cell: ({ row }) => {
      const { voucherType, module, voucherDispatchDetail } = row.original
      const isFreightOrDeliveryNote =
        module === 'freight' ||
        voucherType?.id === 2001 ||
        voucherType?.id === 2002
      const billingPref = voucherDispatchDetail?.billingPreference

      if (!isFreightOrDeliveryNote || !voucherDispatchDetail) {
        return <div className="text-muted-foreground/50 text-xs">—</div>
      }

      const content = (
        <div className="text-xs leading-tight space-y-0.5">
          {voucherDispatchDetail.carrierName && (
            <span className="block text-foreground/80 font-medium">
              {voucherDispatchDetail.carrierName}
            </span>
          )}
          {voucherDispatchDetail.motorVehicleNo && (
            <span className="block text-muted-foreground/70">
              Vehicle: {voucherDispatchDetail.motorVehicleNo}
            </span>
          )}
          {(voucherDispatchDetail.source ||
            voucherDispatchDetail.destination) && (
            <span className="block text-[11px] text-muted-foreground/50">
              {voucherDispatchDetail.source}
              {voucherDispatchDetail.source && voucherDispatchDetail.destination
                ? ' → '
                : ''}
              {voucherDispatchDetail.destination}
            </span>
          )}
          {voucherDispatchDetail.billOfLadingNo && (
            <span className="block text-muted-foreground/70">
              BL#: {voucherDispatchDetail.billOfLadingNo}
            </span>
          )}
          {voucherDispatchDetail.receiptDocNo && (
            <span className="block text-muted-foreground/70">
              Receipt#: {voucherDispatchDetail.receiptDocNo}
            </span>
          )}
        </div>
      )

      if (!billingPref) {
        return content
      }

      const colorMap: Record<string, string> = {
        advance: 'text-blue-600 dark:text-blue-400',
        current: 'text-green-600 dark:text-green-400',
        due: 'text-amber-600 dark:text-amber-400',
      }

      return (
        <TooltipProvider delayDuration={300}>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="cursor-help">{content}</div>
            </TooltipTrigger>
            <TooltipContent side="top" align="start" className="text-xs">
              <div className="flex items-center gap-1.5">
                <span className="text-muted-foreground">Billing:</span>
                <span
                  className={cn(
                    'capitalize font-semibold',
                    colorMap[billingPref] ?? '',
                  )}
                >
                  {billingPref}
                </span>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )
    },
    enableHiding: false,
  },
  {
    id: 'billingPreference',
    accessorFn: (row) => row.voucherDispatchDetail?.billingPreference ?? '',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Billing Pref." />
    ),
    cell: ({ row }) => {
      const preference = row.getValue('billingPreference') as string | undefined

      if (!preference) {
        return (
          <div className="text-muted-foreground/50 text-xs text-center">—</div>
        )
      }

      const colorMap: Record<string, string> = {
        advance:
          'text-blue-600 dark:text-blue-400 border-blue-300 dark:border-blue-700 bg-blue-50/50 dark:bg-blue-950/30',
        current:
          'text-green-600 dark:text-green-400 border-green-300 dark:border-green-700 bg-green-50/50 dark:bg-green-950/30',
        due: 'text-amber-600 dark:text-amber-400 border-amber-300 dark:border-amber-700 bg-amber-50/50 dark:bg-amber-950/30',
      }

      const badgeColor =
        colorMap[preference] ??
        'text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700'

      return (
        <div className="flex justify-center">
          <Badge
            variant="outline"
            className={cn('capitalize text-xs', badgeColor)}
          >
            {preference}
          </Badge>
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
      const { voucherType } = row.original
      if (!voucherType) {
        return <div className="text-muted-foreground">Primary</div>
      }
      const key = lowerCase(voucherType?.name ?? '').replace(/\s+/g, '_')
      const badgeColor = VoucherTypeColorMapping.get(key)
      return (
        <div className="flex space-x-2">
          <Badge variant="default" className={cn('capitalize', badgeColor)}>
            {toSentenceCase(voucherType.name)}
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
    id: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const { voucherType, module, referencedBy, paymentStatus } = row.original

      // Delivery Note: show freight status
      if (voucherType?.id === 2001) {
        const hasFreight = referencedBy?.some((ref) => ref.type === 'freight')
        return (
          <Badge
            variant="outline"
            className={cn(
              'capitalize text-xs',
              hasFreight
                ? 'text-green-600 dark:text-green-400 border-green-300 dark:border-green-700 bg-green-50/50 dark:bg-green-950/30'
                : 'text-amber-600 dark:text-amber-400 border-amber-300 dark:border-amber-700 bg-amber-50/50 dark:bg-amber-950/30',
            )}
          >
            {hasFreight ? 'Freight Done' : 'No Freight'}
          </Badge>
        )
      }

      // Freight: show payment receipt status
      if (module === 'freight') {
        const status = paymentStatus ?? 'unpaid'
        const isPaid = status === 'paid'
        const isPartial = status === 'partially_paid'
        return (
          <Badge
            variant="outline"
            className={cn(
              'capitalize text-xs',
              isPaid
                ? 'text-green-600 dark:text-green-400 border-green-300 dark:border-green-700 bg-green-50/50 dark:bg-green-950/30'
                : isPartial
                  ? 'text-blue-600 dark:text-blue-400 border-blue-300 dark:border-blue-700 bg-blue-50/50 dark:bg-blue-950/30'
                  : 'text-amber-600 dark:text-amber-400 border-amber-300 dark:border-amber-700 bg-amber-50/50 dark:bg-amber-950/30',
            )}
          >
            {status === 'paid'
              ? 'Paid'
              : status === 'partially_paid'
                ? 'Partial'
                : 'Unpaid'}
          </Badge>
        )
      }

      return <div className="text-muted-foreground/50 text-xs">—</div>
    },
    enableHiding: false,
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
