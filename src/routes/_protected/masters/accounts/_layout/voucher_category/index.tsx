import VoucherCategory from '@/features/modules/voucher_category'
import { voucherCategoryQueryOptions } from '@/features/modules/voucher_category/data/queryOptions'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { Loader } from 'lucide-react'


export const Route = createFileRoute(
  '/_protected/masters/accounts/_layout/voucher_category/',
)({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(voucherCategoryQueryOptions()),
  component: () => {
    const { data: voucherCategory } = useSuspenseQuery(voucherCategoryQueryOptions())
    return <VoucherCategory data={voucherCategory?.data} />
  },
  errorComponent: () => <div>Error loading voucher category data.</div>,
  pendingComponent: () => <Loader className="animate-spin" />,
})