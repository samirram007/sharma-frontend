import React, { useState, useCallback } from 'react'
import { useLocalStorage } from '@/hooks/use-local-storage'
import type { VoucherSchema } from '../../data-schema/voucher-schema'
import type { FreightSchema } from '../data/schema'
import useDialogState from '@/core/hooks/use-dialog-state'
import PrintFreightDialog from '../components/print-freight-dialog'

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

/**
 * Payload for the grid-level Freight Bill print dialog. The dialog state lives
 * here (not inside the row's BillCell) because saving a freight bill invalidates
 * the grid query, and the refetch used to swap the data rows for skeleton rows —
 * unmounting the BillCell and taking the freshly opened dialog down with it.
 */
type FreightPrintPayload = {
  freight: FreightSchema
  /** Dispatch detail snapshot built from the row's form (fare breakdown). */
  dispatchDetail?: Record<string, unknown> | null
}

interface FreightContextType {
  open: FreightDialogType | null
  setOpen: (str: FreightDialogType | null) => void
  currentRow: VoucherSchema | null
  setCurrentRow: React.Dispatch<React.SetStateAction<VoucherSchema | null>>
  keyName: string
  config: Array<ConfigItem>
  updateConfig: (key: string, value: boolean | string | number) => void
  printPayload: FreightPrintPayload | null
  openPrint: (payload: FreightPrintPayload) => void
  closePrint: () => void
  /** Delivery note the postpone (lock) dialog is open for. */
  lockTarget: VoucherSchema | null
  lockReason: string
  setLockTarget: (voucher: VoucherSchema | null) => void
  setLockReason: (reason: string) => void
  openLock: (voucher: VoucherSchema, reason?: string) => void
  closeLock: () => void
}

const FreightContext = React.createContext<FreightContextType | null>(null)

export { FreightContext }
export const useFreightContext = () => {
  const ctx = React.useContext(FreightContext)
  if (!ctx) {
    throw new Error(
      'useFreightContext must be used within FreightContext.Provider',
    )
  }
  return ctx
}

interface Props {
  children: React.ReactNode
}

export default function FreightProvider({ children }: Props) {
  const [open, setOpen] = useDialogState<FreightDialogType>(null)
  const [currentRow, setCurrentRow] = useState<VoucherSchema | null>(null)
  const [config, setConfig] = useLocalStorage<Array<ConfigItem>>(
    CONFIG_STORAGE_KEY,
    defaultConfig,
    { deserialize: deserializeConfig },
  )
  const [printPayload, setPrintPayload] = useState<FreightPrintPayload | null>(
    null,
  )

  const openPrint = useCallback(
    (payload: FreightPrintPayload) => setPrintPayload(payload),
    [],
  )
  const closePrint = useCallback(() => setPrintPayload(null), [])

  // Like the print dialog, the lock dialog state lives here (above the grid):
  // saving a lock invalidates the grid query and a row-level dialog would be
  // unmounted by the refetch mid-submit.
  const [lockTarget, setLockTarget] = useState<VoucherSchema | null>(null)
  const [lockReason, setLockReason] = useState<string>('')
  const openLock = useCallback(
    (voucher: VoucherSchema, reason: string = '') => {
      setLockTarget(voucher)
      setLockReason(reason)
    },
    [],
  )
  const closeLock = useCallback(() => {
    setLockTarget(null)
    setLockReason('')
  }, [])

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
        printPayload,
        openPrint,
        closePrint,
        lockTarget,
        lockReason,
        setLockTarget,
        setLockReason,
        openLock,
        closeLock,
      }}
    >
      {children}
      {/* Mounted above the grid so a row-level unmount (e.g. skeleton swap)
          can never close the dialog mid-print. */}
      {printPayload && (
        <PrintFreightDialog
          open
          onOpenChange={(isOpen) => {
            if (!isOpen) closePrint()
          }}
          freightData={printPayload.freight}
          dispatchDetail={printPayload.dispatchDetail}
        />
      )}
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
