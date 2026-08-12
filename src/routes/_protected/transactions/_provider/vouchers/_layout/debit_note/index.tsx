import DebitNoteVoucherComponent from '@/features/modules/voucher/debit_note'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/_protected/transactions/_provider/vouchers/_layout/debit_note/',
)({
  component: DebitNoteVoucherComponent,
})
