import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/_protected/masters/miscellaneous/_layout/',
)({
  beforeLoad: async () => {
    throw redirect({ to: '/masters/miscellaneous/delivery_places' })
  },
})
