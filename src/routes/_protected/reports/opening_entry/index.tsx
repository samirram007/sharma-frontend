import { createFileRoute } from '@tanstack/react-router'
import { Loader } from 'lucide-react'
import React, { Suspense } from 'react'
import z from 'zod'

const OpeningEntryReport = React.lazy(
  () => import('@/features/modules/opening_entry_report'),
)

export const Route = createFileRoute('/_protected/reports/opening_entry/')({
  validateSearch: z.object({
    fy: z.coerce.number().optional(),
  }),
  component: () => (
    <Suspense
      fallback={<Loader className="h-8 w-8 animate-spin mx-auto mt-12" />}
    >
      <OpeningEntryReport />
    </Suspense>
  ),
  errorComponent: () => (
    <div className="p-6 text-center">
      <span className="text-destructive">
        Error loading Opening Entry Report.
      </span>
    </div>
  ),
  pendingComponent: () => (
    <Loader className="h-8 w-8 animate-spin mx-auto mt-12" />
  ),
})
