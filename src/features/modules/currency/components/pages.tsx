import { useCurrency } from '@/features/modules/currency/contexts/currency-context'

import { ActionPages } from './action-page'


export function Pages() {
    const { currentRow, keyName } = useCurrency()

    return (
        <>
            <ActionPages
                key={`${keyName}-add`}
            />
            {currentRow ?

                <ActionPages
                    key={`${keyName}-edit-${currentRow.id}`}
                    currentRow={currentRow}
                />
                : <ActionPages
                    key={`${keyName}-add`}
                />
            }
        </>
    )
}
