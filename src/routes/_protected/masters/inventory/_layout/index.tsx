import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_protected/masters/inventory/_layout/')({
  beforeLoad: async () => {
    throw redirect({ to: '/masters/inventory/stock_item' })
  },
})
