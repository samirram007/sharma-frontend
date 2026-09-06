'use client'

import { StatusToggleDialog } from '@/components/status-toggle-dialog'
import type { DeliveryVehicle } from '@/features/modules/delivery_vehicle/data/schema'
import { deliveryVehicleQueryOptions } from '../data/queryOptions'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: DeliveryVehicle
}

export function DeleteDialog({ open, onOpenChange, currentRow }: Props) {
  return (
    <StatusToggleDialog
      open={open}
      onOpenChange={onOpenChange}
      moduleName="Delivery Vehicle"
      apiPath="/delivery_vehicles"
      currentRow={currentRow}
      queryKey={deliveryVehicleQueryOptions().queryKey}
    />
  )
}
