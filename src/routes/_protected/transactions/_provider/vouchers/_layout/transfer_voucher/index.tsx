import TransferVoucherVoucherComponent from '@/features/modules/voucher/transfer_voucher'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/_protected/transactions/_provider/vouchers/_layout/transfer_voucher/',
)({
  component: TransferVoucherVoucherComponent,
})
