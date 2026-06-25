import useDialogState from '@/core/hooks/use-dialog-state'
import React, { useState } from 'react'
import type { DeliveryPlace } from '../data/schema'



type DeliveryPlaceDialogType = 'invite' | 'add' | 'edit' | 'delete'

interface DeliveryPlaceContextType {
  open: DeliveryPlaceDialogType | null
  setOpen: (str: DeliveryPlaceDialogType | null) => void
  currentRow: DeliveryPlace | null
  setCurrentRow: React.Dispatch<React.SetStateAction<DeliveryPlace | null>>
  keyName: string
}

const DeliveryPlaceContext = React.createContext<DeliveryPlaceContextType | null>(null)
interface Props {
  children: React.ReactNode
}

export default function DeliveryPlaceProvider({ children }: Props) {
  const [open, setOpen] = useDialogState<DeliveryPlaceDialogType>(null)
  const [currentRow, setCurrentRow] = useState<DeliveryPlace | null>(null)


  return (
    <DeliveryPlaceContext value={{ open, setOpen, currentRow, setCurrentRow, keyName: "account_nature" }}>
      {children}
    </DeliveryPlaceContext>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useDeliveryPlace = () => {
  const deliveryPlaceContext = React.useContext(DeliveryPlaceContext)

  if (!deliveryPlaceContext) {
    throw new Error('useDeliveryPlace has to be used within <DeliveryPlaceContext>')
  }

  return deliveryPlaceContext
}
