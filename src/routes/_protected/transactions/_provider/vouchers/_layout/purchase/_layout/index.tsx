import PurchaseVoucherComponent from '@/features/modules/voucher/purchase'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/_protected/transactions/_provider/vouchers/_layout/purchase/_layout/',
)({
  component: PurchaseVoucherComponent,
})
