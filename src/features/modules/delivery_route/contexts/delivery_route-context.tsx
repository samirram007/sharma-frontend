import useDialogState from '@/core/hooks/use-dialog-state'
import React, { useState } from 'react'
import type { DeliveryRoute } from '../data/schema'



type DeliveryRouteDialogType = 'invite' | 'add' | 'edit' | 'delete'

interface DeliveryRouteContextType {
  open: DeliveryRouteDialogType | null
  setOpen: (str: DeliveryRouteDialogType | null) => void
  currentRow: DeliveryRoute | null
  setCurrentRow: React.Dispatch<React.SetStateAction<DeliveryRoute | null>>
  keyName: string
}

const DeliveryRouteContext = React.createContext<DeliveryRouteContextType | null>(null)
interface Props {
  children: React.ReactNode
}

export default function DeliveryRouteProvider({ children }: Props) {
  const [open, setOpen] = useDialogState<DeliveryRouteDialogType>(null)
  const [currentRow, setCurrentRow] = useState<DeliveryRoute | null>(null)


  return (
    <DeliveryRouteContext value={{ open, setOpen, currentRow, setCurrentRow, keyName: "account_nature" }}>
      {children}
    </DeliveryRouteContext>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useDeliveryRoute = () => {
  const deliveryRouteContext = React.useContext(DeliveryRouteContext)

  if (!deliveryRouteContext) {
    throw new Error('useDeliveryRoute has to be used within <DeliveryRouteContext>')
  }

  return deliveryRouteContext
}
