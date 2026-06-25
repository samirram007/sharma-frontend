
import { Main } from '@/layouts/components/main'





import { ActionPages } from './components/action-page'
import { type Country } from './data/schema'


// Import the correct type for countryListSchema



interface CountryProps {
    data?: Country
}

export default function CountryDetails(props: CountryProps) {
    const { data } = props
    const keyName = 'countries'

    return (

        <>
            <Main>

                <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12'>
                    <ActionPages currentRow={data}
                        key={`${keyName}-add`} />
                </div>
            </Main>

            {/* <Pages /> */}
        </>
    )
}
