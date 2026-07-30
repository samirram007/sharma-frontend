import { createFileRoute } from '@tanstack/react-router'
import RunningBalanceDashboard from '@/features/modules/running_balance'

export const Route = createFileRoute(
  '/_protected/reports/running-balance/',
)({
  component: RouteComponent,
  staticData: {
    title: 'Running Balance Dashboard',
  },
})

function RouteComponent() {
  return <RunningBalanceDashboard />
}
