import CreditNoteVoucherComponent from '@/features/modules/voucher/credit_note'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
    '/_protected/transactions/_provider/vouchers/_layout/credit_note/',
)({
    component: CreditNoteVoucherComponent,
})
