import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/_protected/reports/day_book/_layout/rejection_out/',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div>
      Hello "/_protected/transactions/vouchers/_layout/rejection_in/"!
    </div>
  )
}
