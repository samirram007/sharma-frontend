
import { useAccountGroup } from '../contexts/account_group-context'
import { AccountGroupActionDialog } from './account_group-action-dialog'
import { AccountGroupDeleteDialog } from './account_group-delete-dialog'

export function AccountGroupDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useAccountGroup()
  return (
    <>
      <AccountGroupActionDialog
        key='account_group-add'
        open={open === 'add'}
        onOpenChange={() => setOpen('add')}
      />



      {currentRow && (
        <>
          <AccountGroupActionDialog
            key={`account_group-edit-${currentRow.id}`}
            open={open === 'edit'}
            onOpenChange={() => {
              setOpen('edit')
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            currentRow={currentRow}
          />

          <AccountGroupDeleteDialog
            key={`account_group-delete-${currentRow.id}`}
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
