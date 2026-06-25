import { useStateRegion } from '@/features/modules/state/contexts/state-context'

import { ActionPages } from './action-page'


export function Pages() {
    const { currentRow, keyName } = useStateRegion()

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
