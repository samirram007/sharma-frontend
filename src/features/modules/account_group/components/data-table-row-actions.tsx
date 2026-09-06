import { DataTableRowActions as BaseRowActions } from '@/features/global/components/data-table/data-table-row-actions'
import type { Row } from '@tanstack/react-table'
import { useAccountGroup } from '../contexts/account_group-context'
import type { AccountGroup } from '../data/schema'

interface DataTableRowActionsProps {
  row: Row<AccountGroup>
}

export function DataTableRowActions({ row }: DataTableRowActionsProps) {
  const { setOpen, setCurrentRow } = useAccountGroup()
  return (
    <BaseRowActions<AccountGroup>
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
