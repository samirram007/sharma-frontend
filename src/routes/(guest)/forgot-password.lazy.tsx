import { createLazyFileRoute } from '@tanstack/react-router'
import ForgotPassword from '@/features/auth/forgot-password'

export const Route = createLazyFileRoute('/(guest)/forgot-password')({
  component: ForgotPassword,
})
