import SalesOrderVoucherComponent from '@/features/modules/voucher/sales_order'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/_protected/transactions/_provider/vouchers/_layout/sales_order/',
)({
  component: SalesOrderVoucherComponent,
})
