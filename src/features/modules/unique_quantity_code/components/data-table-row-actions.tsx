import { DataTableRowActions as BaseRowActions } from '@/features/global/components/data-table/data-table-row-actions'
import type { Row } from '@tanstack/react-table'
import { useUniqueQuantityCode } from '../contexts/unique_quantity_code-context'
import type { UniqueQuantityCode } from '../data/schema'

interface DataTableRowActionsProps {
  row: Row<UniqueQuantityCode>
}

export function DataTableRowActions({ row }: DataTableRowActionsProps) {
  const { setOpen, setCurrentRow } = useUniqueQuantityCode()
  return (
    <BaseRowActions<UniqueQuantityCode>
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
