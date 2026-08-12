import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import type { ColumnDef } from '@tanstack/react-table'
import { DataTableColumnHeader } from '@/features/global/components/data-table/data-table-column-header'
import { format } from 'date-fns'
import type { ConversionJournalReportSchema } from '../data/schema'
import type { StockJournalEntryForm } from '../../data-schema/voucher-schema'
import LongText from '@/components/long-text'
import {
  ChevronRight,
  ChevronDown,
  Package,
  ArrowDownCircle,
  ArrowUpCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toNum, formatLocale } from '@/utils/format-num'
import RowActions from './row-actions'

const formatDate = (value: string | Date) => {
  const date = new Date(value)
  return format(date, 'dd-MMM-yyyy')
}

export function isProductionEntry(
  entry: StockJournalEntryForm | null | undefined,
): boolean {
  return (entry?.movementType ?? 'in') === 'in'
}

export function entryTotals(
  entries: (StockJournalEntryForm | null | undefined)[],
) {
  let consumptionQty = 0
  let productionQty = 0
  let consumptionCount = 0
  let productionCount = 0
  for (const entry of entries) {
    if (!entry) continue
    if (isProductionEntry(entry)) {
      productionCount += 1
      productionQty += toNum(entry.actualQuantity)
    } else {
      consumptionCount += 1
      consumptionQty += toNum(entry.actualQuantity)
    }
  }
  return { consumptionQty, productionQty, consumptionCount, productionCount }
}

export const columns: ColumnDef<ConversionJournalReportSchema>[] = [
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
    id: 'consumption',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Consumed (OUT)" />
    ),
    cell: ({ row }) => {
      const entries =
        row.original.stockJournal?.stockJournalEntries?.filter(Boolean) ?? []
      const { consumptionQty, consumptionCount } = entryTotals(entries)
      if (consumptionCount === 0)
        return <div className="text-muted-foreground text-xs">—</div>
      return (
        <div className="flex items-center gap-1.5">
          <ArrowUpCircle className="h-3.5 w-3.5 text-red-500 shrink-0" />
          <Badge
            variant="outline"
            className="text-[10px] px-1.5 py-0 text-red-600 dark:text-red-400 border-red-200 dark:border-red-900"
          >
            {consumptionCount}
          </Badge>
          <span className="text-xs tabular-nums text-muted-foreground">
            {formatLocale(consumptionQty)}
          </span>
        </div>
      )
    },
    enableSorting: false,
  },
  {
    id: 'production',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Produced (IN)" />
    ),
    cell: ({ row }) => {
      const entries =
        row.original.stockJournal?.stockJournalEntries?.filter(Boolean) ?? []
      const { productionQty, productionCount } = entryTotals(entries)
      if (productionCount === 0)
        return <div className="text-muted-foreground text-xs">—</div>
      return (
        <div className="flex items-center gap-1.5">
          <ArrowDownCircle className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
          <Badge
            variant="outline"
            className="text-[10px] px-1.5 py-0 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900"
          >
            {productionCount}
          </Badge>
          <span className="text-xs tabular-nums text-muted-foreground">
            {formatLocale(productionQty)}
          </span>
        </div>
      )
    },
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
  {
    id: 'actions',
    header: () => null,
    cell: RowActions,
    enableSorting: false,
    enableHiding: false,
    meta: { className: 'w-8' },
  },
]
