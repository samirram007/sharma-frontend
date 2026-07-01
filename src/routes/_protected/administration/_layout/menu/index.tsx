import { requirePermission } from '@/lib/auth';
import Menu from '@/features/modules/menu';
import { MenuQueryOptions } from '@/features/modules/menu/data/queryOptions';
import { useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { Loader } from 'lucide-react';

export const Route = createFileRoute(
  '/_protected/administration/_layout/menu/',
)({
  beforeLoad: requirePermission('MENU_VIEW'),
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(MenuQueryOptions()),
  component: () => {
    const { data: menuData } = useSuspenseQuery(MenuQueryOptions())
    return <Menu data={menuData?.data} />
  },
  errorComponent: () => <div>Error loading menu entries.</div>,
  pendingComponent: () => <Loader className="animate-spin" />,
})
