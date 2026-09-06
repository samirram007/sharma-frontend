import { useEffect } from 'react'
import { useLocation } from '@tanstack/react-router'
import { publishVoucherTabLabel } from './voucher-tab-label'

interface EditableVoucherRow {
  id?: string | number | null
  voucherNo?: string | null
}

/**
 * Voucher edit pages call this with the record being edited. While mounted
 * with an existing record it publishes " (VoucherNo)" for the current
 * pathname, so the tab strip can annotate the active tab (e.g.
 * "Delivery Note (DLNT-4115)"). New-voucher / list mounts and unmounts clear
 * the label again.
 */
export function usePublishVoucherTabLabel(
  currentRow?: EditableVoucherRow | null,
): void {
  const pathname = useLocation().pathname

  useEffect(() => {
    const voucherNo = currentRow?.voucherNo?.trim()
    if (!currentRow?.id || !voucherNo || voucherNo === 'new') {
      publishVoucherTabLabel(null)
      return
    }
    publishVoucherTabLabel({ pathname, label: ` (${voucherNo})` })
    return () => publishVoucherTabLabel(null)
  }, [pathname, currentRow?.id, currentRow?.voucherNo])
}
