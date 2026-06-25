import SalesVoucherComponent from '@/features/modules/voucher/sales'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/_protected/transactions/_provider/vouchers/_layout/sales/',
)({
  component: SalesVoucherComponent,
})
