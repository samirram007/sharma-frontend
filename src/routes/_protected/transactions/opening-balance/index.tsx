import { createFileRoute } from '@tanstack/react-router'
import OpeningBalanceWizard from '@/features/modules/opening_balance'

export const Route = createFileRoute(
  '/_protected/transactions/opening-balance/',
)({
  component: RouteComponent,
  staticData: {
    title: 'Opening Balance Setup',
  },
})

function RouteComponent() {
  return <OpeningBalanceWizard />
}
