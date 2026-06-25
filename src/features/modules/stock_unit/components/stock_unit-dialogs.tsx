

import { useStockUnit } from '../contexts/stock_unit-context'
import { StockUnitActionDialog } from './stock_unit-action-dialog'
import { StockUnitDeleteDialog } from './stock_unit-delete-dialog'

export function StockUnitDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useStockUnit()
  return (
    <>
      <StockUnitActionDialog
        key='stock_unit-add'
        open={open === 'add'}
        onOpenChange={() => setOpen('add')}
      />



      {currentRow && (
        <>
          <StockUnitActionDialog
            key={`stock_unit-edit-${currentRow.id}`}
            open={open === 'edit'}
            onOpenChange={() => {
              setOpen('edit')
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            currentRow={currentRow}
          />

          <StockUnitDeleteDialog
            key={`stock_unit-delete-${currentRow.id}`}
            open={open === 'delete'}
            onOpenChange={() => {
              setOpen('delete')
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            currentRow={currentRow}
          />
        </>
      )}
    </>
  )
}
