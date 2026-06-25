import { fiscalYearQueryOptions } from '@/features/modules/fiscal_year/data/queryOptions'
import UserFiscalYear from '@/features/modules/user_fiscal_year'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { Loader } from 'lucide-react'
import { Suspense } from 'react'

export const Route = createFileRoute(
  '/_protected/(auth)/user-fiscal-year/_layout/',
)({
  loader: async ({ context }) =>
    context.queryClient.ensureQueryData(fiscalYearQueryOptions()),
  component: RouteComponent,
  errorComponent: () => <div>Error loading user data...</div>,
  pendingComponent: () => <Loader className="animate-spin" />,
})

function RouteComponent() {
  const { data: user } = useSuspenseQuery(fiscalYearQueryOptions())
  return (
    <Suspense fallback={<Loader className="animate-spin" />}>
      <UserFiscalYear data={user?.data} />
    </Suspense>)
}
