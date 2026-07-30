import { requirePermission } from '@/lib/auth';
import MenuManager from '@/features/modules/menu_manager'
import { MenuTreeQueryOptions } from '@/features/modules/menu/data/queryOptions'
import { roleQueryOptions } from '@/features/modules/role/data/queryOptions'
import { createFileRoute } from '@tanstack/react-router'
import { Loader } from 'lucide-react'

export const Route = createFileRoute(
  '/_protected/administration/_layout/menu_manager/',
)({
  beforeLoad: requirePermission('MENU_MANAGER_VIEW'),
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(roleQueryOptions()),
      context.queryClient.ensureQueryData(MenuTreeQueryOptions),
    ])
  },
  component: () => {
    return <MenuManager />
  },
  errorComponent: () => (
    <div className='flex flex-col items-center justify-center py-16 text-destructive'>
      <p className='text-sm font-medium'>Failed to load Menu Manager</p>
      <p className='text-xs text-muted-foreground mt-1'>
        Ensure the backend server is running and you have the required permissions.
      </p>
    </div>
  ),
  pendingComponent: () => <Loader className='animate-spin' />,
})
