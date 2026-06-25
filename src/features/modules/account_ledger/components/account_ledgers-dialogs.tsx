
import { useAccountLedger } from '../contexts/account-ledger-context'
import { AccountLedgersActionDialog } from './account_ledgers-action-dialog'
import { AccountLedgersDeleteDialog } from './account_ledgers-delete-dialog'

export function AccountLedgersDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useAccountLedger()
  return (
    <>
      <AccountLedgersActionDialog
        key='account_ledger-add'
        open={open === 'add'}
        onOpenChange={() => setOpen('add')}
      />



      {currentRow && (
        <>
          <AccountLedgersActionDialog
            key={`account_ledger-edit-${currentRow.id}`}
            open={open === 'edit'}
            onOpenChange={() => {
              setOpen('edit')
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            currentRow={currentRow}
          />

          <AccountLedgersDeleteDialog
            key={`account_ledger-delete-${currentRow.id}`}
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
