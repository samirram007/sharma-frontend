import SignIn from '@/features/auth/sign-in';
import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/(guest)/sign-in')({
  beforeLoad: async ({ context }) => {
    console.log(context, "context")
    if (context.auth?.user) {
      throw redirect({ to: '/dashboard' });
    }
  },
  component: SignIn,
})
