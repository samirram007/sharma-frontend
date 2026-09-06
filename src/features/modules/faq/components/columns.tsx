import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'
import type { ColumnDef } from '@tanstack/react-table'

import { DataTableColumnHeader } from '../../../global/components/data-table/data-table-column-header'
import { faqCategoryTypes } from '../data/data'
import type { Faq } from '../data/schema'
import RowActions from './row-actions'

export const columns: ColumnDef<Faq>[] = [
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
    accessorKey: 'question',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Question" />
    ),
    cell: ({ row }) => (
      <div
        className="min-w-52 max-w-80 whitespace-normal break-words font-medium"
        title={row.getValue('question')}
      >
        {row.getValue('question')}
      </div>
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
    accessorKey: 'answer',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Answer" />
    ),
    cell: ({ row }) => (
      <div
        className="min-w-40 max-w-96 whitespace-normal break-words text-sm text-slate-600 dark:text-slate-400"
        title={row.getValue('answer')}
      >
        {row.getValue('answer')}
      </div>
    ),
    enableSorting: false,
  },
  {
    accessorKey: 'category',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Category" />
    ),
    cell: ({ row }) => {
      const category = row.getValue('category') as string | null
      const badgeColor = faqCategoryTypes.get(category ?? '') ?? ''
      return (
        <div className="flex space-x-2">
          <Badge variant="outline" className={cn('capitalize', badgeColor)}>
            {category ?? 'General'}
          </Badge>
        </div>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: 'sortOrder',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Order" />
    ),
    cell: ({ row }) => (
      <div className="w-fit text-nowrap text-center">
        {row.getValue('sortOrder')}
      </div>
    ),
  },
  {
    accessorKey: 'isPublished',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Published" />
    ),
    cell: ({ row }) => {
      const isPublished = row.getValue('isPublished') as boolean
      return (
        <div className="flex space-x-2">
          <Badge
            variant="outline"
            className={cn(
              'capitalize',
              isPublished
                ? 'bg-teal-100/30 text-teal-900 dark:text-teal-200 border-teal-200'
                : 'bg-neutral-300/40 border-neutral-300',
            )}
          >
            {isPublished ? 'Yes' : 'No'}
          </Badge>
        </div>
      )
    },
  },
  {
    id: 'actions',
    cell: RowActions,
  },
]
