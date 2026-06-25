import DeliveryNote from '@/features/modules/voucher/delivery_note'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/_protected/reports/day_book/_layout/delivery_note/_layout/',
)({
  component: DeliveryNote,
})

