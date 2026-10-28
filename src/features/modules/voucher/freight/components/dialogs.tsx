import { useFreight } from '../contexts/freight-context'
import DeliveryLockDialog from './delivery-lock-dialog'

/**
 * Freight screen dialogs. Mounted once above the grid so a row unmount during
 * the invalidation refetch that follows a save can't close a dialog mid-submit.
 *
 * Only the delivery-lock (postpone) dialog lives here — adding/editing a
 * delivery note happens on its own route, not in a modal on this screen.
 */
export function Dialogs() {
  const { lockTarget, closeLock } = useFreight()

  return (
    <>
      {lockTarget && (
        <DeliveryLockDialog
          key={`lock-${lockTarget.id}`}
          open
          onOpenChange={(isOpen) => {
            if (!isOpen) closeLock()
          }}
          voucher={lockTarget}
        />
      )}
    </>
  )
}
