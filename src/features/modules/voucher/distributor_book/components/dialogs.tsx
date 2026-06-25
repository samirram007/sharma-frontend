
import { useDistributorBook } from '../contexts/distributor_book-context'

import { DeleteDialog } from './delete-dialog'


export function Dialogs() {
  const { open, setOpen, currentRow, setCurrentRow, keyName } = useDistributorBook()
  return (
    <>

      {currentRow && (
        <>


          <DeleteDialog
            key={`${keyName}-delete-${currentRow.id}`}
            open={open === 'delete'}
            onOpenChange={() => {
              setOpen('delete')
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            currentRow={currentRow}
          />
        </>
      )}
    </>
  )
}
