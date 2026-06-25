import ManufacturingJournalVoucherComponent from '@/features/modules/voucher/manufacturing_journal'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/_protected/transactions/_provider/vouchers/_layout/manufacturing_journal/',
)({
  component: ManufacturingJournalVoucherComponent,
})
