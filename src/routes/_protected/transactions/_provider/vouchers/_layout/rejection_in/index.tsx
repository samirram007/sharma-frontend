import RejectionInVoucherComponent from '@/features/modules/voucher/rejection_in'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/_protected/transactions/_provider/vouchers/_layout/rejection_in/',
)({
  component: RejectionInVoucherComponent,
})
