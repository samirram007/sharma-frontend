import Contra from '@/features/modules/voucher/contra/index'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/_protected/transactions/_provider/vouchers/_layout/contra/_layout/',
)({
  component: Contra,
})
