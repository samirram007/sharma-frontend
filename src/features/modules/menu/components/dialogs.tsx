import { useMenu } from '../contexts/menu-context'
import { ActionDialog } from './action-dialog'
import { DeleteDialog } from './delete-dialog'

export function Dialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useMenu()
  return (
    <>
      <ActionDialog
        key="menu-entry-add"
        open={open === 'add'}
        onOpenChange={() => setOpen('add')}
      />
      {currentRow && (
        <>
          <ActionDialog
            key={`menu-entry-edit-${currentRow.id}`}
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
            key={`menu-entry-delete-${currentRow.id}`}
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
