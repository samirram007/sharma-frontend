
import { Main } from '@/layouts/components/main'





import { useInventory } from '@/features/masters/inventory/context/inventory-context'
import { useEffect } from 'react'
import { ActionPages } from './components/action-page'
import { type StockItem } from './data/schema'


// Import the correct type for stockitemListSchema



interface StockItemProps {
    data?: StockItem
}

export default function StockItemDetails(props: StockItemProps) {
    const { setSideBarOpen } = useInventory()
    const { data } = props
    const keyName = 'stock_items'
    useEffect(() => {
        setSideBarOpen && setSideBarOpen(false)
    }, [])
    return (

        <>
            <Main className='min-w-full'>

                <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12'>
                    <ActionPages currentRow={data}
                        key={`${keyName}-add`} />
                </div>
            </Main>

            {/* <Pages /> */}
        </>
    )
}
