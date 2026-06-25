

import { useUniqueQuantityCode } from '../contexts/unique_quantity_code-context'
import { UniqueQuantityCodeActionDialog } from './unique_quantity_code-action-dialog'
import { UniqueQuantityCodeDeleteDialog } from './unique_quantity_code-delete-dialog'

export function UniqueQuantityCodeDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useUniqueQuantityCode()
  return (
    <>
      <UniqueQuantityCodeActionDialog
        key='stock_unit-add'
        open={open === 'add'}
        onOpenChange={() => setOpen('add')}
      />



      {currentRow && (
        <>
          <UniqueQuantityCodeActionDialog
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

          <UniqueQuantityCodeDeleteDialog
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
