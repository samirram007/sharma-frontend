import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/_protected/masters/payroll/_layout/bank/',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_protected/masters/payroll/_layout/employee/"!</div>
}
