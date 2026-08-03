import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/_protected/masters/organization/_layout/fiscal_year/_layout/close',
)({
  beforeLoad: ({ context }) => {
    const fyId = context.auth?.userFiscalYear?.fiscalYearId
    if (fyId) {
      throw redirect({ to: '/masters/organization/fiscal_year/$id/close', params: { id: fyId } })
    }
    throw redirect({ to: '/masters/organization/fiscal_year' })
  },
})
