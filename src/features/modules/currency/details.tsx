
import { Main } from '@/layouts/components/main'





import { ActionPages } from './components/action-page'
import { type Currency } from './data/schema'


// Import the correct type for currencyListSchema



interface CurrencyProps {
    data?: Currency
}

export default function CurrencyDetails(props: CurrencyProps) {
    const { data } = props
    const keyName = 'companies'
    console.log("data");

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
