import { DataTableRowActions } from '@/features/global/components/data-table/data-table-row-actions'
import type { Row } from '@tanstack/react-table'
import { useMenu } from '../contexts/menu-context'
import type { Menu } from '../data/schema'

interface DataTableRowActionsProps {
  row: Row<Menu>
}

const RowActions = (props: DataTableRowActionsProps) => {
  const { setOpen, setCurrentRow } = useMenu()
  const { row } = props
  return (
    <DataTableRowActions<Menu>
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
