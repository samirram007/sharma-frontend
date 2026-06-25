
import { Main } from '@/layouts/components/main'





import { useInventory } from '@/features/masters/inventory/context/inventory-context'
import { useEffect } from 'react'
import type { StockItem } from './data/schema'


// Import the correct type for stockitemListSchema



interface StockItemProps {
    data?: StockItem
}

export default function StockItemConfiguration(props: StockItemProps) {
    const { setSideBarOpen } = useInventory()
    const { data } = props
    // const keyName = 'stock_items'
    console.log(data)
    useEffect(() => {
        setSideBarOpen && setSideBarOpen(false)
    }, [])
    return (

        <>
            <Main className='min-w-full'>
                <h1>CONFIGURATION</h1>
                {/* <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12'>
                    <ActionPages currentRow={data}
                        key={`${keyName}-add`} />
                </div> */}
            </Main>

            {/* <Pages /> */}
        </>
    )
}
