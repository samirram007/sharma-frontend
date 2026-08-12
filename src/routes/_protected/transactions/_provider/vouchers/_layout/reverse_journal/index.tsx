import ReverseJournalVoucherComponent from '@/features/modules/voucher/reverse_journal'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/_protected/transactions/_provider/vouchers/_layout/reverse_journal/',
)({
  component: ReverseJournalVoucherComponent,
})
