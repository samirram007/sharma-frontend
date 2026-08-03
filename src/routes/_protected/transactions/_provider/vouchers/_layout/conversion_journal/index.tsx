import ConversionJournalVoucherComponent from '@/features/modules/voucher/conversion_journal'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/_protected/transactions/_provider/vouchers/_layout/conversion_journal/',
)({
  component: ConversionJournalVoucherComponent,
})
