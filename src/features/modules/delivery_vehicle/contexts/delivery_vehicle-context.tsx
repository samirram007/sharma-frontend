import useDialogState from '@/core/hooks/use-dialog-state'
import React, { useState } from 'react'
import type { DeliveryVehicle } from '../data/schema'



type DeliveryVehicleDialogType = 'invite' | 'add' | 'edit' | 'delete'

interface DeliveryVehicleContextType {
  open: DeliveryVehicleDialogType | null
  setOpen: (str: DeliveryVehicleDialogType | null) => void
  currentRow: DeliveryVehicle | null
  setCurrentRow: React.Dispatch<React.SetStateAction<DeliveryVehicle | null>>
  keyName: string
}

const DeliveryVehicleContext = React.createContext<DeliveryVehicleContextType | null>(null)
interface Props {
  children: React.ReactNode
}

export default function DeliveryVehicleProvider({ children }: Props) {
  const [open, setOpen] = useDialogState<DeliveryVehicleDialogType>(null)
  const [currentRow, setCurrentRow] = useState<DeliveryVehicle | null>(null)


  return (
    <DeliveryVehicleContext value={{ open, setOpen, currentRow, setCurrentRow, keyName: "delivery_vehicle" }}>
      {children}
    </DeliveryVehicleContext>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useDeliveryVehicle = () => {
  const deliveryVehicleContext = React.useContext(DeliveryVehicleContext)

  if (!deliveryVehicleContext) {
    throw new Error('useDeliveryVehicle has to be used within <DeliveryVehicleContext>')
  }

  return deliveryVehicleContext
}
