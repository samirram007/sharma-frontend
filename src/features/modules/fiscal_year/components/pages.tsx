import { useFiscalYear } from '@/features/modules/fiscal_year/contexts/fiscal_year-context'

import { ActionPages } from './action-page'


export function Pages() {
    const { currentRow, keyName } = useFiscalYear()

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
