
import { useVoucherClassification } from '../contexts/voucher-classification-context'
import { VoucherClassificationsActionDialog } from './voucher_classifications-action-dialog'
import { VoucherClassificationsDeleteDialog } from './voucher_classifications-delete-dialog'

export function VoucherClassificationsDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useVoucherClassification()
  return (
    <>
      <VoucherClassificationsActionDialog
        key='account_ledger-add'
        open={open === 'add'}
        onOpenChange={() => setOpen('add')}
      />



      {currentRow && (
        <>
          <VoucherClassificationsActionDialog
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

          <VoucherClassificationsDeleteDialog
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
