import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/_protected/reports/day_book/_layout/manufacturing_journal/',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div>
      Hello
      "/_protected/transactions/vouchers/_layout/manufacturing_journal/"!
    </div>
  )
}
