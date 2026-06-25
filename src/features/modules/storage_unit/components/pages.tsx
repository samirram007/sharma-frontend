

import { useStorageUnit } from '../contexts/storage_unit-context'
import { ActionPages } from './action-page'


export function Pages() {
    const { currentRow, keyName } = useStorageUnit()

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
