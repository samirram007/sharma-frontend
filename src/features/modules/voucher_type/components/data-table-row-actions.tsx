import { DataTableRowActions as BaseRowActions } from '@/features/global/components/data-table/data-table-row-actions'
import type { Row } from '@tanstack/react-table'
import { useVoucherType } from '../contexts/voucher-type-context'
import type { VoucherType } from '../data/schema'

interface DataTableRowActionsProps {
  row: Row<VoucherType>
}

export function DataTableRowActions({ row }: DataTableRowActionsProps) {
  const { setOpen, setCurrentRow } = useVoucherType()
  return (
    <BaseRowActions<VoucherType>
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
