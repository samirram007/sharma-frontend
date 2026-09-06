import { DataTableRowActions as BaseRowActions } from '@/features/global/components/data-table/data-table-row-actions'
import type { Row } from '@tanstack/react-table'
import { useStockUnit } from '../contexts/stock_unit-context'
import type { StockUnit } from '../data/schema'

interface DataTableRowActionsProps {
  row: Row<StockUnit>
}

export function DataTableRowActions({ row }: DataTableRowActionsProps) {
  const { setOpen, setCurrentRow } = useStockUnit()
  return (
    <BaseRowActions<StockUnit>
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
