import { createFileRoute } from '@tanstack/react-router'
import NotificationsPage from '@/features/notifications'

export const Route = createFileRoute('/_protected/notifications/')({
  component: NotificationsPage,
})
