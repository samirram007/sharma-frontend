import ChangePassword from '@/features/auth/components/change-password'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_protected/(auth)/change-password')({
  component: RouteComponent,
})

function RouteComponent() {
  return <ChangePassword />
}
