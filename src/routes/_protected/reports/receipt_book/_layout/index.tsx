import { SkeletonTable } from '@/components/skeleton';

import Receipt from '@/features/modules/voucher/receipt';
import { receiptVoucherQueryOptions } from '@/features/modules/voucher/receipt/data/queryOptions';

import { useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';

import { Loader } from 'lucide-react';
import { Suspense } from 'react';


export const Route = createFileRoute(
  '/_protected/reports/receipt_book/_layout/',
)({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(receiptVoucherQueryOptions()),
  component: () => {
    const { data: receiptVouchers } = useSuspenseQuery(receiptVoucherQueryOptions())
    // console.log("receiptVouchers: ", receiptVouchers)
    return <Suspense fallback={<SkeletonTable />}>
      <Receipt data={receiptVouchers?.data} />
    </Suspense>
  },
  errorComponent: () => <div>Error loading receipt data.</div>,
  pendingComponent: () => <Loader className="animate-spin" />,
})