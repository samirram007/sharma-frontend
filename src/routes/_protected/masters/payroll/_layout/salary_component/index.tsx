import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/_protected/masters/payroll/_layout/salary_component/',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_protected/masters/payroll/_layout/employee/"!</div>
}
