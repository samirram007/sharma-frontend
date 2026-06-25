
import JournalVoucherComponent from '@/features/modules/voucher/journal/index'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/_protected/transactions/_provider/vouchers/_layout/journal/_layout/',
)({
  component: JournalVoucherComponent,
})

