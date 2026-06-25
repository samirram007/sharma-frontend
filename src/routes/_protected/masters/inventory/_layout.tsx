
import GeneralError from '@/features/errors/general-error'
import NotFoundError from '@/features/errors/not-found-error'
import Inventory from '@/features/masters/inventory'
import InventoryProvider from '@/features/masters/inventory/context/inventory-context'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_protected/masters/inventory/_layout')({
  component: () => {
    return (
      <InventoryProvider>

        <Inventory />
      </InventoryProvider>
    )
  },
  notFoundComponent: NotFoundError,
  errorComponent: GeneralError,
})

