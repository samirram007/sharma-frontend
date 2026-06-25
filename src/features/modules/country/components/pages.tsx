import { useCountry } from '@/features/modules/country/contexts/country-context'

import { ActionPages } from './action-page'


export function Pages() {
    const { currentRow, keyName } = useCountry()

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
