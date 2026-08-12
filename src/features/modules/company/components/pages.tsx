import { useCompany } from '@/features/modules/company/contexts/company-context'

import { ActionPages } from './action-page'

export function Pages() {
  const { currentRow, keyName } = useCompany()

  return (
    <>
      <ActionPages key={`${keyName}-add`} />
      {currentRow ? (
        <ActionPages
          key={`${keyName}-edit-${currentRow.id}`}
          currentRow={currentRow}
        />
      ) : (
        <ActionPages key={`${keyName}-add`} />
      )}
    </>
  )
}
