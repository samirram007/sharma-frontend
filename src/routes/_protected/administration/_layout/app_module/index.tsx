import AppModule from '@/features/modules/app_module';
import { appModuleQueryOptions } from '@/features/modules/app_module/data/queryOptions';
import { useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { Loader } from 'lucide-react';

export const Route = createFileRoute(
  '/_protected/administration/_layout/app_module/',
)({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(appModuleQueryOptions()),
  component: () => {
    const { data: appModule } = useSuspenseQuery(appModuleQueryOptions())

    return <AppModule data={appModule?.data} />
  },
  errorComponent: () => <div>Error loading modules.</div>,
  pendingComponent: () => <Loader className="animate-spin" />,
})

