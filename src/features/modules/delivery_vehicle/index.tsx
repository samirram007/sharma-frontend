
import { Main } from '@/layouts/components/main'
import { columns } from './components/columns'

import { Dialogs } from './components/dialogs'
import { GridTable } from './components/grid-table'
import { PrimaryButtons } from './components/primary-buttons'
import DeliveryVehicleProvider from './contexts/delivery_vehicle-context'
import { deliveryVehicleListSchema, type DeliveryVehicleList } from './data/schema'



// Import the correct type for deliveryvehicleListSchema



interface DeliveryVehicleProps {
    data: DeliveryVehicleList
}

export default function DeliveryVehicle({ data }: DeliveryVehicleProps) {


    return (
        <DeliveryVehicleProvider>

            <Main className='min-w-0 w-full'>

                <div className='mb-4 flex flex-wrap items-start justify-between gap-3 rounded-lg border border-slate-200/70 bg-white/80 px-4 py-3 shadow-sm dark:border-white/[0.07] dark:bg-white/5'>
                    <div className='space-y-1'>
                        <h2 className='text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100'>Delivery Vehicle List</h2>
                        <p className='text-slate-600 dark:text-slate-400'>
                            Manage your delivery vehicle  here.
                        </p>
                    </div>
                    <PrimaryButtons type='text' isModal={true} />
                </div>
                <div className='flex-1 overflow-x-hidden overflow-y-auto py-1'>
                    <GridTable
                        data={deliveryVehicleListSchema.parse(data ?? [])}
                        columns={columns} />
                </div>
            </Main>

            <Dialogs />
        </DeliveryVehicleProvider>
    )
}
