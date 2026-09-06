'use client'

import { StatusToggleDialog } from '@/components/status-toggle-dialog'
import type { DeliveryPlace } from '@/features/modules/delivery_place/data/schema'
import { deliveryPlaceQueryOptions } from '../data/queryOptions'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: DeliveryPlace
}

export function DeleteDialog({ open, onOpenChange, currentRow }: Props) {
  return (
    <StatusToggleDialog
      open={open}
      onOpenChange={onOpenChange}
      moduleName="Delivery Place"
      apiPath="/delivery_places"
      currentRow={currentRow}
      queryKey={deliveryPlaceQueryOptions().queryKey}
    />
  )
}
