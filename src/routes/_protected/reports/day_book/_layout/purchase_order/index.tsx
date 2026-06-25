import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/_protected/reports/day_book/_layout/purchase_order/',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div>
      Hello "/_protected/transactions/vouchers/_layout/purchase_order/"!
    </div>
  )
}
