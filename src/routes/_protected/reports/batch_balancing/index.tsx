import { SkeletonTable } from '@/components/skeleton'
import BatchBalancingReport from '@/features/modules/batch_balancing'

import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_protected/reports/batch_balancing/')({
  component: RouteComponent,
  staticData: {
    title: 'Batch Balancing Report',
  },
  pendingComponent: () => <SkeletonTable />,
  errorComponent: () => (
    <div className="p-6 text-center text-destructive">
      Error loading Batch Balancing Report.
    </div>
  ),
})

function RouteComponent() {
  return <BatchBalancingReport />
}
