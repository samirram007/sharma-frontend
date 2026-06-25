import VoucherTypeProvider from '@/features/modules/voucher_type/contexts/voucher-type-context'
import { createFileRoute, Outlet } from '@tanstack/react-router'
import { Loader } from 'lucide-react'

export const Route = createFileRoute(
  '/_protected/masters/accounts/_layout/voucher_type/_layout',
)({
  component: () => {

    return (
      <VoucherTypeProvider>
        <Outlet />
      </VoucherTypeProvider>
    )
  },
  errorComponent: () => <div> <span className='bg-red-400  '>Layout:</span> Error loading voucher type data[]. </div>
  ,
  pendingComponent: () => <Loader className="animate-spin" />,
})


