// import { router } from '@/AppRouter'
import { handleServerError } from '@/utils/handle-server-error'
import {
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
import { AxiosError } from 'axios'
import { toast } from 'sonner'
// const queryClient = new QueryClient()
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        if (import.meta.env.DEV) console.log({ failureCount, error })

        if (failureCount >= 0 && import.meta.env.DEV) return false
        if (failureCount > 3 && import.meta.env.PROD) return false

        return !(
          error instanceof AxiosError &&
          [401, 403].includes(error.response?.status ?? 0)
        )
      },
      refetchOnWindowFocus: import.meta.env.PROD,
      staleTime: 10 * 1000 * 60, // 10 minutes
    },
    mutations: {
      onError: (error) => {
        handleServerError(error)

        if (error instanceof AxiosError) {
          if (error.response?.status === 304) {
            toast.message('Content not modified!')
          }
        }
      },
    },
  },
  queryCache: new QueryCache({
    onError: (error) => {
      if (error instanceof AxiosError) {
        if (error.response?.status === 401) {
          // toast.message('Session expired!')
          // useAuthStore.getState().auth.reset()
          // const redirect = `${router.history.location.href}`
          // router.navigate({ to: '/signin', search: { redirect } })
        }
        if (error.response?.status === 500) {
          toast.message('Internal Server Error!')
          // router.navigate({ to: '/500' })
        }
        if (error.response?.status === 403) {
          // router.navigate({ to: "/403", search: { redirect: router.history.location.href } });
        }
      }
    },
  }),
})
export function getContext() {
  return {
    queryClient,
  }
}

export function TanStackQueryProvider({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}
