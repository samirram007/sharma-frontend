import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/_protected/reports/day_book/_layout/transfer_voucher/',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div>
      Hello "/_protected/transactions/vouchers/_layout/delivery note/"!
    </div>
  )
}
