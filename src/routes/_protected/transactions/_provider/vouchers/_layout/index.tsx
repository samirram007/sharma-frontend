import { voucherCategoryQueryOptions } from '@/features/modules/voucher_category/data/queryOptions';
import Transactions from '@/features/transactions';
import { useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { Loader } from 'lucide-react';

export const Route = createFileRoute(
  '/_protected/transactions/_provider/vouchers/_layout/',
)({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(voucherCategoryQueryOptions()),
  component: () => {
    const { data: voucherCategories } = useSuspenseQuery(voucherCategoryQueryOptions())

    return <Transactions data={voucherCategories?.data} />
  },
  errorComponent: () => <div>Error loading voucher Category data.</div>,
  pendingComponent: () => <Loader className="animate-spin" />,
})