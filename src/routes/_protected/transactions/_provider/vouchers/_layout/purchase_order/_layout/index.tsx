import PurchaseOrderVoucherComponent from '@/features/modules/voucher/purchase_order'

import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/_protected/transactions/_provider/vouchers/_layout/purchase_order/_layout/',
)({
  component: PurchaseOrderVoucherComponent,
})
