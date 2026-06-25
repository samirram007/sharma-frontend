import RejectionOutVoucherComponent from '@/features/modules/voucher/rejection_out'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/_protected/transactions/_provider/vouchers/_layout/rejection_out/',
)({
  component: RejectionOutVoucherComponent,
})
