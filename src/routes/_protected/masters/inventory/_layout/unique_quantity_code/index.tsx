import UniqueQuantityCode from '@/features/modules/unique_quantity_code';
import { uniqueQuantityCodeQueryOptions } from '@/features/modules/unique_quantity_code/data/queryOptions';
import { useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { Loader } from 'lucide-react';

export const Route = createFileRoute(
  '/_protected/masters/inventory/_layout/unique_quantity_code/',
)({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(uniqueQuantityCodeQueryOptions()),
  component: () => {
    const { data: uniqueQuantityCode } = useSuspenseQuery(uniqueQuantityCodeQueryOptions())
    console.log(uniqueQuantityCode, 'unique quantity code data');
    return <UniqueQuantityCode data={uniqueQuantityCode?.data} />
  },
  errorComponent: () => <div>Error loading unique quantity code data.</div>,
  pendingComponent: () => <Loader className="animate-spin" />,
})

