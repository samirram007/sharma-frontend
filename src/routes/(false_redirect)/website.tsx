import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/(false_redirect)/website')({
  beforeLoad: ({ context }) => {
    if (context.auth.user) {
      throw redirect({ to: '/dashboard' })
    }
    throw redirect({ to: '/sign-in' })
  },
  component: () => <div>Route Not Found</div>,
})
