import VoucherClassification from '@/features/modules/voucher_classification'
import { voucherClassificationQueryOptions } from '@/features/modules/voucher_classification/data/queryOptions'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { Loader } from 'lucide-react'

export const Route = createFileRoute(
  '/_protected/masters/accounts/_layout/voucher_classification/',
)({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(voucherClassificationQueryOptions()),
  component: () => {
    const { data: voucherClassification } = useSuspenseQuery(voucherClassificationQueryOptions())
    return <VoucherClassification data={voucherClassification?.data} />
  },
  errorComponent: () => <div>Error loading voucher classification data.</div>,
  pendingComponent: () => <Loader className="animate-spin" />,
})