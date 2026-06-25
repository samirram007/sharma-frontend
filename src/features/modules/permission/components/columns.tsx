import LongText from '@/components/long-text'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'
import type { ColumnDef, FilterFn, Row } from '@tanstack/react-table'



import { DataTableColumnHeader } from '../../../global/components/data-table/data-table-column-header'
import type { Permission } from '../data/schema'
import RowActions from './row-actions'
declare module '@tanstack/table-core' {
  interface FilterFns {
    fuzzy: FilterFn<any>
  }
}
export const columns: ColumnDef<Permission>[] = [
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
    accessorKey: 'roleId',
    filterFn: 'fuzzy',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Role' />
    ),
    cell: ({ row }) => (
      <LongText className='max-w-36'>{row.original.role?.name ?? 'N/A'}</LongText>
    ),
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
    accessorKey: 'appModuleFeatureId',

    filterFn: 'fuzzy',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Module/Feature' />
    ),
    cell: ({ row }) => (
      <div className='w-fit text-nowrap gap-2 flex flex-wrap'>
        <Badge>{row.original.appModuleFeature?.appModule?.name ?? 'N/A'}</Badge>

        {row.original.appModuleFeature?.name ?? 'N/A'}
      </div>
    ),
  },



  {
    id: 'actions',
    cell: RowActions,
  },
]


function getNestedValue(obj: any, path: string) {
  return path.split('.').reduce((acc, key) => acc?.[key], obj)
}

export const filterFns = {
  fuzzy: (row: Row<any>, columnId: string | string[], value: string) => {
    if (!value) return true
    const searchValue = value.toLowerCase()

    // Support both single and multiple column keys
    const columns = Array.isArray(columnId) ? columnId : [columnId]

    // Check if any of the columns match the search value
    return columns.some((col) => {
      const columnValue =
        col.includes('.') ? getNestedValue(row.original, col) : row.getValue(col)

      if (Array.isArray(columnValue)) {
        return columnValue.some((v) =>
          v?.toString().toLowerCase().includes(searchValue)
        )
      }

      return columnValue?.toString().toLowerCase().includes(searchValue)
    })
  },
}