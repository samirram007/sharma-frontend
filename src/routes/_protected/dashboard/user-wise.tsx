import UserWiseDashboard from '@/features/dashboard/user-wise'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_protected/dashboard/user-wise')({
  component: UserWiseDashboard,
})
