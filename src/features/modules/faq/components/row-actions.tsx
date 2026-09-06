import { DataTableRowActions } from '@/features/global/components/data-table/data-table-row-actions'
import type { Row } from '@tanstack/react-table'
import { useFaq } from '../contexts/faq-context'
import type { Faq } from '../data/schema'

interface DataTableRowActionsProps {
  row: Row<Faq>
}

const RowActions = (props: DataTableRowActionsProps) => {
  const { setOpen, setCurrentRow } = useFaq()
  const { row } = props
  return (
    <DataTableRowActions<Faq>
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
