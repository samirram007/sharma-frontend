import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/_protected/reports/day_book/_layout/physical_stock/',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div>Hello "/_protected/transactions/vouchers/physical_stock/"!</div>
  )
}
