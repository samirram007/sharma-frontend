
import { useVoucherCategory } from '../contexts/voucher-categories-context'
import { VoucherCategorysActionDialog } from './voucher_categories-action-dialog'
import { VoucherCategorysDeleteDialog } from './voucher_categories-delete-dialog'
import { VoucherCategorysInviteDialog } from './voucher_categories-invite-dialog'

export function VoucherCategorysDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useVoucherCategory()
  return (
    <>
      <VoucherCategorysActionDialog
        key='voucher_category-add'
        open={open === 'add'}
        onOpenChange={() => setOpen('add')}
      />

      <VoucherCategorysInviteDialog
        key='voucher_category-invite'
        open={open === 'invite'}
        onOpenChange={() => setOpen('invite')}
      />

      {currentRow && (
        <>
          <VoucherCategorysActionDialog
            key={`voucher_category-edit-${currentRow.id}`}
            open={open === 'edit'}
            onOpenChange={() => {
              setOpen('edit')
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            currentRow={currentRow}
          />

          <VoucherCategorysDeleteDialog
            key={`voucher_category-delete-${currentRow.id}`}
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
