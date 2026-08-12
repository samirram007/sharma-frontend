import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/_protected/masters/organization/_layout/fiscal_year/_layout/open',
)({
  beforeLoad: () => {
    throw redirect({
      to: '/masters/organization/fiscal_year/$id/open',
      params: { id: 'new' },
    })
  },
})
