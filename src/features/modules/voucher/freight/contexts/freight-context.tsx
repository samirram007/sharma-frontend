import React, { useState, useCallback, useEffect } from 'react'
import type { StockSummarySchema } from '../../stock_summary/data/schema'
import useDialogState from '@/core/hooks/use-dialog-state'

type ConfigItem = { key: string, value: boolean | string | number }

type FreightDialogType = 'invite' | 'add' | 'edit' | 'delete'

interface FreightContextType {
  open: FreightDialogType | null
  setOpen: (str: FreightDialogType | null) => void
  currentRow: StockSummarySchema | null
  setCurrentRow: React.Dispatch<React.SetStateAction<StockSummarySchema | null>>
  keyName: string,
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
  const CONFIG_STORAGE_KEY = 'dispatchSectionConfig'

  const defaultConfig: Array<ConfigItem> = [
    { key: 'order_details', value: false },
    { key: 'transport_details', value: true },
    { key: 'receipt_details', value: true },
    { key: 'freight_details', value: true },
    { key: 'freight_method', value: 2 },
  ]

  const [config, setConfig] = useState<Array<ConfigItem>>(() => {
    try {
      const stored = localStorage.getItem(CONFIG_STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored) as Array<ConfigItem>
        // Merge with defaults — keep any new keys that don't exist in stored
        const merged = defaultConfig.map(
          (def) => parsed.find((p) => p.key === def.key) ?? def
        )
        return merged
      }
    } catch {
      // localStorage unavailable or corrupt — fall through to defaults
    }
    return defaultConfig
  })

  const updateConfig = useCallback((key: string, value: boolean | string | number) => {
    setConfig(prev => prev.map(item =>
      item.key === key ? { ...item, value } : item
    ))
  }, [])

  // Persist config to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(config))
    } catch {
      // silently ignore storage errors
    }
  }, [config])

  return (
    <FreightContext.Provider value={{ config, updateConfig, open, setOpen, currentRow, setCurrentRow, keyName: "day_books" }}>
      {children}
    </FreightContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useFreight = () => {
  const freightContext = React.useContext(FreightContext)

  if (!freightContext) {
    throw new Error('useFreight has to be used within <FreightContext.Provider>')
  }

  return freightContext
}
