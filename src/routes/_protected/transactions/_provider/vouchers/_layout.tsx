
import DistributorProvider from '@/features/modules/distributor/contexts/distributor-context'

import TransactionLayout from '@/features/transactions/layouts/transaction-layout'
import { createFileRoute } from '@tanstack/react-router'


import { Dialogs as DistributorDialog } from '@/features/modules/distributor/components/dialogs'
export const Route = createFileRoute(
    '/_protected/transactions/_provider/vouchers/_layout',
)({
    component: () => {
        return (

            <DistributorProvider>
                <TransactionLayout />
                <DistributorDialog />
            </DistributorProvider >

        )
    }
})


