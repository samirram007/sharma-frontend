import { SkeletonTable } from '@/components/skeleton';


import DistributorBookIndex from '@/features/modules/voucher/distributor_book';
import { distributorBookQueryOptions } from '@/features/modules/voucher/distributor_book/data/queryOptions';

import { useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { Loader } from 'lucide-react';
import { Suspense } from 'react';

export const Route = createFileRoute(
  '/_protected/reports/distributor_book/_layout/',
)({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(distributorBookQueryOptions()),
  component: () => {
    const { data: distributors } = useSuspenseQuery(distributorBookQueryOptions())
    // console.log("Distributor Data: ", distributors)
    return <Suspense fallback={<SkeletonTable />}>
      <DistributorBookIndex data={distributors?.data} />
    </Suspense>
  },
  errorComponent: () => <div>Error loading distributor book data.</div>,
  pendingComponent: () => <Loader className="animate-spin" />,
})