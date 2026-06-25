
import { Main } from '@/layouts/components/main'
import { columns } from './components/columns'





import { Dialogs } from './components/dialogs'
import { GridTable } from './components/grid-table'
import { PrimaryButtons } from './components/primary-buttons'
import DeliveryPlaceProvider from './contexts/delivery_place-context'
import { deliveryPlaceListSchema, type DeliveryPlaceList } from './data/schema'


// Import the correct type for deliveryPlaceListSchema



interface DeliveryPlaceProps {
    data: DeliveryPlaceList
}

export default function DeliveryPlace({ data }: DeliveryPlaceProps) {


    return (
        <DeliveryPlaceProvider>

            <Main className='min-w-0 w-full'>

                <div className='mb-4 flex flex-wrap items-start justify-between gap-3 rounded-lg border border-slate-200/70 bg-white/80 px-4 py-3 shadow-sm dark:border-white/[0.07] dark:bg-white/5'>
                    <div className='space-y-1'>
                        <h2 className='text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100'>Delivery Place List</h2>
                        <p className='text-slate-600 dark:text-slate-400'>
                            Manage your delivery place  here.
                        </p>
                    </div>
                    <PrimaryButtons />
                </div>
                <div className='flex-1 overflow-x-hidden overflow-y-auto py-1'>
                    <GridTable
                        data={deliveryPlaceListSchema.parse(data ?? [])}
                        columns={columns} />
                </div>
            </Main>

            <Dialogs />
        </DeliveryPlaceProvider>
    )
}
