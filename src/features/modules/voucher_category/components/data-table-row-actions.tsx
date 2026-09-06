import { DataTableRowActions as BaseRowActions } from '@/features/global/components/data-table/data-table-row-actions'
import type { Row } from '@tanstack/react-table'
import { useVoucherCategory } from '../contexts/voucher-categories-context'
import type { VoucherCategory } from '../data/schema'

interface DataTableRowActionsProps {
  row: Row<VoucherCategory>
}

export function DataTableRowActions({ row }: DataTableRowActionsProps) {
  const { setOpen, setCurrentRow } = useVoucherCategory()
  return (
    <BaseRowActions<VoucherCategory>
      row={row}
      onEdit={(data) => {
        setCurrentRow(data)
        setOpen('edit')
      }}
      onDelete={(data) => {
        setCurrentRow(data)
        setOpen('delete')
      }}
    />
  )
}
