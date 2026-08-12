import { IconEdit } from '@tabler/icons-react'
import PaymentProcessDialog from './payment-process-dialog'
import type { Row } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuSeparator,
//   DropdownMenuShortcut,
//   DropdownMenuTrigger,
// } from '@/components/ui/dropdown-menu'
// import { DotsHorizontalIcon } from '@radix-ui/react-icons'
// import { IconEdit, IconTrash } from '@tabler/icons-react'

// interface DataTableRowActionsProps {
//   row: Row<AccountNature>
// }
interface DataTableRowActionsProps<TData> {
  row: Row<TData>
  onEdit?: (row: TData) => void
  onDelete?: (row: TData) => void
  onPaymentAction?: (row: TData) => void
}

export function DataTableRowActions<TData>({
  row,
  onEdit,
}: DataTableRowActionsProps<TData>) {
  return (
    <>
      <div className="flex items-center gap-2">
        <PaymentProcessDialog row={row} />

        <Button
          variant={'outline'}
          disabled={true}
          className="disabled cursor-pointer! "
          onClick={() => onEdit?.(row.original)}
        >
          <IconEdit size={18} />
          Edit
        </Button>
      </div>
    </>
  )
}
