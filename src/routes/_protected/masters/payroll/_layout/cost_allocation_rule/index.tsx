import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/_protected/masters/payroll/_layout/cost_allocation_rule/',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_protected/masters/payroll/_layout/employee/"!</div>
}
