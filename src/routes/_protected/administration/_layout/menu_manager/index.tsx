import MenuManager from '@/features/modules/menu_manager'
import { roleQueryOptions } from '@/features/modules/role/data/queryOptions'
import { createFileRoute } from '@tanstack/react-router'
import { Loader } from 'lucide-react'

export const Route = createFileRoute(
  '/_protected/administration/_layout/menu_manager/',
)({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(roleQueryOptions()),
  component: () => {
    return <MenuManager />
  },
  errorComponent: () => <div>Error loading menu manager.</div>,
  pendingComponent: () => <Loader className='animate-spin' />,
})
