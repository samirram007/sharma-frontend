import ProfileComponent from '@/features/auth/profile'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_protected/(auth)/profile/')({

  component: ProfileComponent,
})

