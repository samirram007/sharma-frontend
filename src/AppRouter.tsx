// AppRouter.tsx
import { RouterProvider } from '@tanstack/react-router'
import LoadingBar from 'react-top-loading-bar'
import { useAuth } from './features/auth/contexts/AuthContext'
import * as TanstackQuery from './integrations/tanstack-query/root-provider'
import { createAppRouter } from './router'

const router = createAppRouter()
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
    context: {
      auth: ReturnType<typeof useAuth>
      queryClient: ReturnType<typeof TanstackQuery.getContext>['queryClient']
    }
  }
}

export function AppRouter() {
  const auth = useAuth()
  const { queryClient } = TanstackQuery.getContext()

  if (auth.isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center p-4">
        <LoadingBar color="var(--chart-2)" shadow={true} height={4} />
        <div className="size-10 rounded-full border-4 border-gray-200 border-t-foreground animate-spin" />
      </div>
    )
  }

  return (
    <RouterProvider
      router={router}
      context={{
        auth,
        queryClient,
      }}
    />
  )
}
