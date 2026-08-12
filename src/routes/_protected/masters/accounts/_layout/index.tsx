import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_protected/masters/accounts/_layout/')({
  beforeLoad: async () => {
    throw redirect({ to: '/masters/accounts/account_nature' })
  },
})
