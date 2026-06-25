
import { useVoucherType } from '../contexts/voucher-type-context'
import { VoucherTypesActionDialog } from './voucher_types-action-dialog'
import { VoucherTypesDeleteDialog } from './voucher_types-delete-dialog'

export function VoucherTypesDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useVoucherType()
  return (
    <>
      <VoucherTypesActionDialog
        key='account_ledger-add'
        open={open === 'add'}
        onOpenChange={() => setOpen('add')}
      />



      {currentRow && (
        <>
          <VoucherTypesActionDialog
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

          <VoucherTypesDeleteDialog
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
