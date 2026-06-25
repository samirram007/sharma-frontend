import { createFileRoute } from '@tanstack/react-router'


export const Route = createFileRoute(
  '/_protected/transactions/_provider/freight/_layout/$id/receipt',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div>
      Hello "/_protected/transactions/_provider/freight/_layout/$id/receipt"!
    </div>
  )
}
