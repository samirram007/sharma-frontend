import PaymentVoucherComponent from '@/features/modules/voucher/payment/index'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/_protected/transactions/_provider/vouchers/_layout/payment/_layout/',
)({
  component: PaymentVoucherComponent,
})
