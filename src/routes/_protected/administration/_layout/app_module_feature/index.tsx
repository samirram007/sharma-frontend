import AppModuleFeature from '@/features/modules/app_module_feature';
import { appModuleFeatureQueryOptions } from '@/features/modules/app_module_feature/data/queryOptions';
import { useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { Loader } from 'lucide-react';

export const Route = createFileRoute(
  '/_protected/administration/_layout/app_module_feature/',
)({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(appModuleFeatureQueryOptions()),
  component: () => {
    const { data: appModuleFeature } = useSuspenseQuery(appModuleFeatureQueryOptions())
    // console.log(appModuleFeature, 'stock group data');
    return <AppModuleFeature data={appModuleFeature?.data} />
  },
  errorComponent: () => <div>Error loading module features.</div>,
  pendingComponent: () => <Loader className="animate-spin" />,
})

