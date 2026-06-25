
import FreightProvider from '@/features/modules/voucher/freight/contexts/freight-context'
import TransactionLayout from '@/features/transactions/layouts/transaction-layout'
import { createFileRoute } from '@tanstack/react-router'


export const Route = createFileRoute(
  '/_protected/transactions/_provider/freight/_layout',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <>
      <FreightProvider>
        <TransactionLayout />
      </FreightProvider>

    </>
  )
}

