import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import { IconEdit, IconEye, IconTrash } from '@tabler/icons-react'
import type { Row } from '@tanstack/react-table'

interface DataTableRowActionsProps<TData> {
  row: Row<TData>
  onView?: (row: TData) => void
  onEdit?: (row: TData) => void
  onDelete?: (row: TData) => void
}

/**
 * Row actions for CRUD tables.
 *
 * - On desktop/tablet (≥ sm) the actions render as two visible, labelled
 *   buttons — Edit (blue) and Delete (red) — so what a row can do is obvious.
 * - On phones (< sm) the ⋯ dropdown is kept for Edit/Delete so the actions
 *   stay tappable without crowding the narrow row.
 */
export function DataTableRowActions<TData>({
  row,
  onView,
  onEdit,
  onDelete,
}: DataTableRowActionsProps<TData>) {
  if (!onView && !onEdit && !onDelete) return null

  return (
    <div className="flex items-center justify-end gap-1">
      {/* Desktop / tablet: labelled action buttons */}
      <div className="hidden items-center gap-1 sm:flex">
        {onView && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            data-testid="row-view"
            onClick={(event) => {
              event.stopPropagation()
              onView(row.original)
            }}
            className="h-7 cursor-pointer gap-1 rounded-md px-2 text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-700 focus-visible:ring-2 focus-visible:ring-slate-500/40 dark:text-slate-400 dark:hover:bg-slate-500/10 dark:hover:text-slate-300 dark:focus-visible:ring-slate-400/40"
          >
            <IconEye size={13} strokeWidth={2} />
            View
          </Button>
        )}
        {onEdit && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            data-testid="row-edit"
            onClick={(event) => {
              event.stopPropagation()
              onEdit(row.original)
            }}
            className="h-7 cursor-pointer gap-1 rounded-md px-2 text-xs font-medium text-blue-600 hover:bg-blue-50 hover:text-blue-700 focus-visible:ring-2 focus-visible:ring-blue-500/40 dark:text-sky-400 dark:hover:bg-sky-500/10 dark:hover:text-sky-300 dark:focus-visible:ring-sky-400/40"
          >
            <IconEdit size={13} strokeWidth={2} />
            Edit
          </Button>
        )}
        {onDelete && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            data-testid="row-delete"
            onClick={(event) => {
              event.stopPropagation()
              onDelete(row.original)
            }}
            className="h-7 cursor-pointer gap-1 rounded-md px-2 text-xs font-medium text-red-600 hover:bg-red-50 hover:text-red-700 focus-visible:ring-2 focus-visible:ring-red-500/40 dark:text-red-400 dark:hover:bg-red-500/10 dark:hover:text-red-300 dark:focus-visible:ring-red-400/40"
          >
            <IconTrash size={13} strokeWidth={2} />
            Delete
          </Button>
        )}
      </div>

      {/* Mobile: dropdown keeps Edit and Delete */}
      <div className="sm:hidden">
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
            >
              <DotsHorizontalIcon className="h-4 w-4" />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[160px]">
            {onView && (
              <>
                <DropdownMenuItem
                  className="cursor-pointer!"
                  onClick={() => onView(row.original)}
                >
                  View
                  <DropdownMenuShortcut>
                    <IconEye size={16} />
                  </DropdownMenuShortcut>
                </DropdownMenuItem>
                {(onEdit || onDelete) && <DropdownMenuSeparator />}
              </>
            )}
            {onEdit && (
              <>
                <DropdownMenuItem
                  className="cursor-pointer!"
                  onClick={() => onEdit(row.original)}
                >
                  Edit
                  <DropdownMenuShortcut>
                    <IconEdit size={16} />
                  </DropdownMenuShortcut>
                </DropdownMenuItem>
                {onDelete && <DropdownMenuSeparator />}
              </>
            )}
            {onDelete && (
              <DropdownMenuItem
                className="cursor-pointer! text-red-500!"
                onClick={() => onDelete(row.original)}
              >
                Delete
                <DropdownMenuShortcut>
                  <IconTrash size={16} />
                </DropdownMenuShortcut>
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
