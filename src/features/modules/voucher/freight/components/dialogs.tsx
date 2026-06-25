

import { useStockSummary } from '../../stock_summary/contexts/stock_summary-context'
import { ActionDialog } from './action-dialog'
import { DeleteDialog } from './delete-dialog'


export function Dialogs() {
  const { open, setOpen, currentRow, setCurrentRow, keyName } = useStockSummary()
  return (
    <>
      <ActionDialog
        key={`${keyName}-add`}
        open={open === 'add'}
        onOpenChange={() => setOpen('add')}
      />
      {currentRow && (
        <>
          <ActionDialog
            key={`${keyName}-edit-${currentRow.id}`}
            open={open === 'edit'}
            onOpenChange={() => {
              setOpen('edit')
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            currentRow={currentRow}
          />

          <DeleteDialog
            key={`${keyName}-delete-${currentRow.id}`}
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
