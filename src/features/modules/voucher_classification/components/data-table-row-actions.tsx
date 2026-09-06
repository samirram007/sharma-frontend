import { DataTableRowActions as BaseRowActions } from '@/features/global/components/data-table/data-table-row-actions'
import type { Row } from '@tanstack/react-table'
import { useVoucherClassification } from '../contexts/voucher-classification-context'
import type { VoucherClassification } from '../data/schema'

interface DataTableRowActionsProps {
  row: Row<VoucherClassification>
}

export function DataTableRowActions({ row }: DataTableRowActionsProps) {
  const { setOpen, setCurrentRow } = useVoucherClassification()
  return (
    <BaseRowActions<VoucherClassification>
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
