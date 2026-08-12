import { DataTableRowActions } from '@/features/global/components/data-table/data-table-row-actions'
import type { Row } from '@tanstack/react-table'
import { useStatus } from '../contexts/status-context'
import type { Status } from '../data/schema'

interface DataTableRowActionsProps {
  row: Row<Status>
}

const RowActions = (props: DataTableRowActionsProps) => {
  const { setOpen, setCurrentRow } = useStatus()
  const { row } = props
  return (
    <DataTableRowActions<Status>
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

export default RowActions
