import { DataTableRowActions as BaseRowActions } from '@/features/global/components/data-table/data-table-row-actions'
import type { Row } from '@tanstack/react-table'
import { useStockCategory } from '../contexts/stock_category-context'
import type { StockCategory } from '../data/schema'

interface DataTableRowActionsProps {
  row: Row<StockCategory>
}

export function DataTableRowActions({ row }: DataTableRowActionsProps) {
  const { setOpen, setCurrentRow } = useStockCategory()
  return (
    <BaseRowActions<StockCategory>
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
