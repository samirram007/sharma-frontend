import { createFileRoute } from '@tanstack/react-router'
import { Loader } from 'lucide-react'
import React, { Suspense } from 'react'

const FiscalYearOpen = React.lazy(() => import('@/features/modules/fiscal_year_open'))

export const Route = createFileRoute(
  '/_protected/masters/organization/_layout/fiscal_year/_layout/$id/open',
)({
  component: () => (
    <Suspense fallback={<Loader className='h-8 w-8 animate-spin mx-auto mt-12' />}>
      <FiscalYearOpen />
    </Suspense>
  ),
  errorComponent: () => (
    <div className='p-6 text-center'>
      <span className='text-destructive'>Error loading Opening Journal page.</span>
    </div>
  ),
  pendingComponent: () => <Loader className='h-8 w-8 animate-spin mx-auto mt-12' />,
})
