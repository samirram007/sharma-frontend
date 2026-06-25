
import { Main } from '@/layouts/components/main'





import { ActionPages } from './components/action-page'
import { type Distributor } from './data/schema'


// Import the correct type for distributorListSchema



interface DistributorProps {
    data?: Distributor
}

export default function DistributorDetails(props: DistributorProps) {
    const { data } = props
    const keyName = 'companies'
    console.log("data");

    return (

        <>
            <Main className='min-w-full'>

                <div className=' flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12'>
                    <ActionPages currentRow={data}
                        key={`${keyName}-add`} />
                </div>
            </Main>

            {/* <Pages /> */}
        </>
    )
}
