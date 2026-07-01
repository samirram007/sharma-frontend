import { createFileRoute } from '@tanstack/react-router'
import { Loader } from 'lucide-react'
import React, { Suspense } from 'react'

const FiscalYearClose = React.lazy(() => import('@/features/modules/fiscal_year_close'))

export const Route = createFileRoute(
  '/_protected/masters/organization/_layout/fiscal_year/_layout/$id/close',
)({
  component: () => (
    <Suspense fallback={<Loader className='h-8 w-8 animate-spin mx-auto mt-12' />}>
      <FiscalYearClose />
    </Suspense>
  ),
  errorComponent: () => (
    <div className='p-6 text-center'>
      <span className='text-destructive'>Error loading Fiscal Year Close page.</span>
    </div>
  ),
  pendingComponent: () => <Loader className='h-8 w-8 animate-spin mx-auto mt-12' />,
})
