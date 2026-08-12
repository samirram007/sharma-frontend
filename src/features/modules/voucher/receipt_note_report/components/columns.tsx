import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import type { ColumnDef } from '@tanstack/react-table'
import { DataTableColumnHeader } from '@/features/global/components/data-table/data-table-column-header'
import { format } from 'date-fns'
import type { ReceiptNoteReportSchema } from '../data/schema'
import LongText from '@/components/long-text'
import { ChevronRight, ChevronDown, Truck, Package } from 'lucide-react'
import { Button } from '@/components/ui/button'

const formatDate = (value: string | Date) => {
  const date = new Date(value)
  return format(date, 'dd-MMM-yyyy')
}

export const columns: ColumnDef<ReceiptNoteReportSchema>[] = [
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
    id: 'expand',
    header: () => null,
    cell: ({ row }) => {
      const hasItems =
        row.original.stockJournal?.stockJournalEntries?.length ?? 0 > 0
      if (!hasItems) return null
      return (
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 p-0"
          onClick={(e) => {
            e.stopPropagation()
            row.toggleExpanded()
          }}
        >
          {row.getIsExpanded() ? (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          )}
        </Button>
      )
    },
    enableSorting: false,
    enableHiding: false,
    meta: { className: 'w-8' },
  },
  {
    accessorKey: 'voucherDate',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Date" />
    ),
    cell: ({ row }) => (
      <LongText className="max-w-28 flex items-center gap-2">
        {formatDate(row.getValue('voucherDate'))}
      </LongText>
    ),
    enableHiding: false,
  },
  {
    accessorKey: 'voucherNo',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Vch No." />
    ),
    cell: ({ row }) => <div>{row.getValue('voucherNo')}</div>,
    meta: { className: 'w-[100px]' },
  },
  {
    accessorKey: 'partyLedger',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Party / Ledger" />
    ),
    cell: ({ row }) => {
      const { partyLedger } = row.original
      if (!partyLedger) return <div className="text-muted-foreground">—</div>
      return (
        <Badge variant="outline" className="capitalize bg-transparent">
          {partyLedger.name}
        </Badge>
      )
    },
    enableHiding: false,
    enableSorting: false,
  },
  {
    id: 'stockItems',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Items" />
    ),
    cell: ({ row }) => {
      const entries = row.original.stockJournal?.stockJournalEntries ?? []
      if (entries.length === 0)
        return <div className="text-muted-foreground text-xs">—</div>
      const count = entries.filter(Boolean).length
      return (
        <div className="flex items-center gap-1.5">
          <Package className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-xs font-medium">
            {count} item{count > 1 ? 's' : ''}
          </span>
          <button
            className="ml-1 text-[10px] text-primary underline-offset-2 hover:underline"
            onClick={(e) => {
              e.stopPropagation()
              row.toggleExpanded()
            }}
          >
            View
          </button>
        </div>
      )
    },
    enableSorting: false,
    enableHiding: false,
  },
  {
    id: 'dispatchInfo',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Dispatch" />
    ),
    cell: ({ row }) => {
      const dd = row.original.voucherDispatchDetail
      if (!dd) return <div className="text-muted-foreground text-xs">—</div>
      return (
        <div className="flex items-center gap-1.5 flex-wrap">
          <Truck className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          {dd.billingPreference && (
            <Badge
              variant="outline"
              className="text-[10px] px-1.5 py-0 capitalize"
            >
              {dd.billingPreference}
            </Badge>
          )}
          {dd.motorVehicleNo && (
            <span className="text-[11px] font-mono text-muted-foreground">
              {dd.motorVehicleNo}
            </span>
          )}
          {dd.carrierName && (
            <span className="text-[11px] text-muted-foreground truncate max-w-[80px]">
              {dd.carrierName}
            </span>
          )}
        </div>
      )
    },
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'remarks',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Remarks" />
    ),
    cell: ({ row }) => {
      const remarks = row.getValue('remarks') as string | undefined
      return (
        <div className="text-xs text-muted-foreground max-w-[160px] truncate">
          {remarks || '—'}
        </div>
      )
    },
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
    cell: ({ row }) => (
      <div className="flex justify-end pr-4">
        <span className="text-sm font-medium tabular-nums">
          {Number(row.getValue('amount')).toLocaleString('en-IN', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </span>
      </div>
    ),
    meta: { className: 'text-right' },
  },
]
