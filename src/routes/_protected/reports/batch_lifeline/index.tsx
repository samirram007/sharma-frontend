import { SkeletonTable } from '@/components/skeleton'
import BatchLifelineReport from '@/features/modules/batch_lifeline'

import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_protected/reports/batch_lifeline/')({
  component: RouteComponent,
  staticData: {
    title: 'Batch Lifeline',
  },
  pendingComponent: () => <SkeletonTable />,
  errorComponent: () => (
    <div className="p-6 text-center text-destructive">
      Error loading Batch Lifeline.
    </div>
  ),
})

function RouteComponent() {
  return <BatchLifelineReport />
}
