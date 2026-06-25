import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/_protected/reports/day_book/_layout/receipt_note/_layout/$id',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div>
      Hello
      "/_protected/reports/day_book/_layout/receipt_note/_layout/$id"!
    </div>
  )
}
