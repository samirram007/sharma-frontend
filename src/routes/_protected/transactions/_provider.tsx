import DeliveryVehicleProvider from '@/features/modules/delivery_vehicle/contexts/delivery_vehicle-context'
import TransporterProvider from '@/features/modules/transporter/contexts/transporter-context'
import TransactionProvider from '@/features/transactions/context/transaction-context'
import { createFileRoute, Outlet } from '@tanstack/react-router'
import { Dialogs as TransporterDialog } from '@/features/modules/transporter/components/dialogs'
import { Dialogs as DeliveryVehicleDialog } from '@/features/modules/delivery_vehicle/components/dialogs'
export const Route = createFileRoute('/_protected/transactions/_provider')({
    component: RouteComponent,
})

function RouteComponent() {
    return (
        <>
            <TransporterProvider>
                <DeliveryVehicleProvider>
                    <TransactionProvider>

                        <Outlet />
                        <DeliveryVehicleDialog />
                        <TransporterDialog />

                    </TransactionProvider>
                </DeliveryVehicleProvider>
            </TransporterProvider>

        </>
    )
}
