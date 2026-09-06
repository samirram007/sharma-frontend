'use client'

import { StatusToggleDialog } from '@/components/status-toggle-dialog'
import type { DeliveryRoute } from '@/features/modules/delivery_route/data/schema'
import { deliveryRouteQueryOptions } from '../data/queryOptions'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: DeliveryRoute
}

export function DeleteDialog({ open, onOpenChange, currentRow }: Props) {
  return (
    <StatusToggleDialog
      open={open}
      onOpenChange={onOpenChange}
      moduleName="Delivery Route"
      apiPath="/delivery_routes"
      currentRow={currentRow}
      queryKey={deliveryRouteQueryOptions().queryKey}
    />
  )
}
