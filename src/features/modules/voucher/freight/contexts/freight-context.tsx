import React, { useState, useCallback } from 'react'
import { useLocalStorage } from '@/hooks/use-local-storage'
import type { StockSummarySchema } from '../../stock_summary/data/schema'
import useDialogState from '@/core/hooks/use-dialog-state'

type ConfigItem = { key: string; value: boolean | string | number }

const CONFIG_STORAGE_KEY = 'dispatchSectionConfig'

const defaultConfig: Array<ConfigItem> = [
  { key: 'order_details', value: false },
  { key: 'transport_details', value: true },
  { key: 'receipt_details', value: true },
  { key: 'freight_details', value: true },
  { key: 'freight_method', value: 2 },
]

// Merge stored entries with the defaults — stored values win for known keys,
// defaults fill in any keys absent from storage (e.g. newly added sections),
// and unknown stored keys are dropped.
const deserializeConfig = (stored: unknown): Array<ConfigItem> => {
  const parsed = Array.isArray(stored) ? (stored as Array<ConfigItem>) : []
  return defaultConfig.map(
    (def) => parsed.find((p) => p.key === def.key) ?? def,
  )
}

type FreightDialogType = 'invite' | 'add' | 'edit' | 'delete'

interface FreightContextType {
  open: FreightDialogType | null
  setOpen: (str: FreightDialogType | null) => void
  currentRow: StockSummarySchema | null
  setCurrentRow: React.Dispatch<React.SetStateAction<StockSummarySchema | null>>
  keyName: string
  config: Array<ConfigItem>
  updateConfig: (key: string, value: boolean | string | number) => void
}

const FreightContext = React.createContext<FreightContextType | null>(null)

interface Props {
  children: React.ReactNode
}

export default function FreightProvider({ children }: Props) {
  const [open, setOpen] = useDialogState<FreightDialogType>(null)
  const [currentRow, setCurrentRow] = useState<StockSummarySchema | null>(null)
  const [config, setConfig] = useLocalStorage<Array<ConfigItem>>(
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

  return (
    <FreightContext.Provider
      value={{
        config,
        updateConfig,
        open,
        setOpen,
        currentRow,
        setCurrentRow,
        keyName: 'day_books',
      }}
    >
      {children}
    </FreightContext.Provider>
  )
}

export const useFreight = () => {
  const freightContext = React.useContext(FreightContext)

  if (!freightContext) {
    throw new Error(
      'useFreight has to be used within <FreightContext.Provider>',
    )
  }

  return freightContext
}
