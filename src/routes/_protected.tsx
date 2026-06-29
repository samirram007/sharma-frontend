
import ProtectedLayout from '@/layouts/ProtectedLayout';
import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/_protected')({
  // eslint-disable-next-line @typescript-eslint/require-await
  beforeLoad: async ({ context }) => { 
    if (!context.auth?.isAuthenticated) {
      throw redirect({ to: '/sign-in' }); 
    }
    if (!context.auth?.permissions || context.auth.permissions.length === 0) {
      console.log("Redirecting from protected Route: no permissions assigned")
      throw redirect({ to: '/restrict' });
    }
  },

  component: ProtectedLayout,

  notFoundComponent: () => <div>Authenticated Not Found</div>,
})




