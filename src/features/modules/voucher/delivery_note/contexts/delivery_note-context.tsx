import React, { createContext, useCallback } from 'react'
import { useLocalStorage } from '@/hooks/use-local-storage'

type ConfigItem = { key: string; value: boolean | string | number }

type DeliveryNoteContextType = {
  config: ConfigItem[]
  updateConfig: (key: string, value: boolean | string | number) => void
}

const CONFIG_STORAGE_KEY = 'deliveryNoteDispatchSectionConfig'

const defaultConfig: ConfigItem[] = [
  { key: 'order_details', value: false },
  { key: 'receipt_details', value: true },
  { key: 'freight_details', value: true },
  { key: 'freight_method', value: 2 },
]

// Merge stored entries with the defaults — stored values win for known keys,
// defaults fill in any keys absent from storage (e.g. newly added sections),
// and unknown stored keys are dropped.
const deserializeConfig = (stored: unknown): ConfigItem[] => {
  const parsed = Array.isArray(stored) ? (stored as ConfigItem[]) : []
  return defaultConfig.map(
    (def) => parsed.find((p) => p.key === def.key) ?? def,
  )
}

const DeliveryNoteContext = createContext<DeliveryNoteContextType | null>(null)

export const DeliveryNoteProvider = ({
  children,
}: {
  children: React.ReactNode
}) => {
  const [config, setConfig] = useLocalStorage<ConfigItem[]>(
    CONFIG_STORAGE_KEY,
    defaultConfig,
    { deserialize: deserializeConfig },
  )

  const updateConfig = useCallback(
    (key: string, value: boolean | string | number) => {
      setConfig((prev) =>
        prev.map((item) => (item.key === key ? { ...item, value } : item)),
      )
    },
    [setConfig],
  )

  const value = {
    config,
    updateConfig,
  } as DeliveryNoteContextType

  return (
    <DeliveryNoteContext.Provider value={value}>
      {children}
    </DeliveryNoteContext.Provider>
  )
}

export const useDeliveryNote = () => {
  const deliveryNoteContext = React.useContext(DeliveryNoteContext)

  if (!deliveryNoteContext) {
    throw new Error(
      'useDeliveryNote has to be used within <DeliveryNoteContext>',
    )
  }

  return deliveryNoteContext
}
