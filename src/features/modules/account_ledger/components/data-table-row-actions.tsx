import { DataTableRowActions as BaseRowActions } from '@/features/global/components/data-table/data-table-row-actions'
import type { Row } from '@tanstack/react-table'
import { useAccountLedger } from '../contexts/account-ledger-context'
import type { AccountLedger } from '../data/schema'

interface DataTableRowActionsProps {
  row: Row<AccountLedger>
}

export function DataTableRowActions({ row }: DataTableRowActionsProps) {
  const { setOpen, setCurrentRow } = useAccountLedger()
  return (
    <BaseRowActions<AccountLedger>
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
