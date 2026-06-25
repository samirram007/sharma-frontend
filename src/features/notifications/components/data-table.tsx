import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  type ColumnDef,
  type SortingState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import * as React from 'react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  DoubleArrowLeftIcon,
  DoubleArrowRightIcon,
} from '@radix-ui/react-icons'
import type { NotificationItem } from '../data/schema'

interface DataTableProps {
  columns: ColumnDef<NotificationItem>[]
  data: NotificationItem[]
  filters: { page: number; perPage: number }
  totalPages: number
  isLoading: boolean
  onPageChange: (page: number) => void
  onPerPageChange: (perPage: number) => void
  toolbar: React.ReactNode
}

export function NotificationsDataTable({
  columns,
  data,
  filters,
  totalPages,
  isLoading,
  onPageChange,
  onPerPageChange,
  toolbar,
}: DataTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: 'createdAt', desc: true },
  ])

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true,
    filterFns: {
      fuzzy: () => true,
    },
  })

  return (
    <div className='space-y-4'>
      {toolbar}

      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} colSpan={header.colSpan}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className='h-48 text-center'>
                  <div className='flex items-center justify-center'>
                    <div className='h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600 dark:border-slate-600 dark:border-t-blue-400' />
                  </div>
                </TableCell>
              </TableRow>
            ) : data.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.original.id}
                  data-state={row.getIsSelected() && 'selected'}
                  className={!row.original.isRead ? 'bg-blue-50/40 dark:bg-blue-950/20' : ''}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className='h-48 text-center text-sm text-slate-500 dark:text-slate-400'
                >
                  No notifications found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className='flex items-center justify-between px-2'>
        <div className='text-muted-foreground hidden flex-1 text-sm sm:block'>
          {data.length} notification(s)
        </div>
        <div className='flex items-center sm:space-x-6 lg:space-x-8'>
          <div className='flex items-center space-x-2'>
            <p className='hidden text-sm font-medium sm:block'>Rows per page</p>
            <Select
              value={`${filters.perPage}`}
              onValueChange={(value) => onPerPageChange(Number(value))}
            >
              <SelectTrigger className='h-8 w-[70px]'>
                <SelectValue placeholder={filters.perPage} />
              </SelectTrigger>
              <SelectContent side='top'>
                {[10, 20, 30, 50].map((pageSize) => (
                  <SelectItem key={pageSize} value={`${pageSize}`}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className='flex w-[100px] items-center justify-center text-sm font-medium'>
            Page {filters.page} of {totalPages}
          </div>
          <div className='flex items-center space-x-2'>
            <Button
              variant='outline'
              className='hidden h-8 w-8 p-0 lg:flex'
              onClick={() => onPageChange(1)}
              disabled={filters.page <= 1}
            >
              <span className='sr-only'>Go to first page</span>
              <DoubleArrowLeftIcon className='h-4 w-4' />
            </Button>
            <Button
              variant='outline'
              className='h-8 w-8 p-0'
              onClick={() => onPageChange(filters.page - 1)}
              disabled={filters.page <= 1}
            >
              <span className='sr-only'>Go to previous page</span>
              <ChevronLeftIcon className='h-4 w-4' />
            </Button>
            <Button
              variant='outline'
              className='h-8 w-8 p-0'
              onClick={() => onPageChange(filters.page + 1)}
              disabled={filters.page >= totalPages}
            >
              <span className='sr-only'>Go to next page</span>
              <ChevronRightIcon className='h-4 w-4' />
            </Button>
            <Button
              variant='outline'
              className='hidden h-8 w-8 p-0 lg:flex'
              onClick={() => onPageChange(totalPages)}
              disabled={filters.page >= totalPages}
            >
              <span className='sr-only'>Go to last page</span>
              <DoubleArrowRightIcon className='h-4 w-4' />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
