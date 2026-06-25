
import { useStockCategory } from '../contexts/stock_category-context'
import { StockCategoryActionDialog } from './stock_category-action-dialog'
import { StockCategoryDeleteDialog } from './stock_category-delete-dialog'

export function StockCategoryDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useStockCategory()
  return (
    <>
      <StockCategoryActionDialog
        key='stock_category-add'
        open={open === 'add'}
        onOpenChange={() => setOpen('add')}
      />



      {currentRow && (
        <>
          <StockCategoryActionDialog
            key={`stock_category-edit-${currentRow.id}`}
            open={open === 'edit'}
            onOpenChange={() => {
              setOpen('edit')
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            currentRow={currentRow}
          />

          <StockCategoryDeleteDialog
            key={`stock_category-delete-${currentRow.id}`}
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
