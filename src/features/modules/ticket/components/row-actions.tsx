import { DataTableRowActions } from '@/features/global/components/data-table/data-table-row-actions'
import type { Row } from '@tanstack/react-table'
import { useTicket } from '../contexts/ticket-context'
import type { Ticket } from '../data/schema'

interface DataTableRowActionsProps {
  row: Row<Ticket>
}

const RowActions = (props: DataTableRowActionsProps) => {
  const { setOpen, setCurrentRow } = useTicket()
  const { row } = props
  return (
    <DataTableRowActions<Ticket>
      row={row}
      onView={(data) => {
        setCurrentRow(data)
        setOpen('view')
      }}
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
