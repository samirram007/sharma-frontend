import GeneralError from '@/features/errors/general-error'
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
  errorComponent: () => <GeneralError minimal />,
  pendingComponent: () => <Loader className="animate-spin" />,
})
