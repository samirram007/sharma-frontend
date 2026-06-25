import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/_protected/transactions/_provider/vouchers/_layout/receipt/',
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
