
import { Main } from '@/layouts/components/main'





import { ActionPages } from './components/action-page'
import { type StorageUnit } from './data/schema'


// Import the correct type for storageUnitListSchema



interface StorageUnitProps {
    data?: StorageUnit
}

export default function StorageUnitDetails(props: StorageUnitProps) {
    const { data } = props
    const keyName = 'companies'


    return (

        <>
            <Main className='w-full'>

                <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12'>
                    <ActionPages currentRow={data}
                        key={`${keyName}-add`} />
                </div>
            </Main>

            {/* <Pages /> */}
        </>
    )
}
