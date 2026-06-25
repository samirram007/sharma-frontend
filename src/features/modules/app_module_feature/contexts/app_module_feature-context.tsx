import useDialogState from '@/core/hooks/use-dialog-state'
import React, { useState } from 'react'
import type { AppModuleFeature } from '../data/schema'



type AppModuleFeatureDialogType = 'invite' | 'add' | 'edit' | 'delete'

interface AppModuleFeatureContextType {
  open: AppModuleFeatureDialogType | null
  setOpen: (str: AppModuleFeatureDialogType | null) => void
  currentRow: AppModuleFeature | null
  setCurrentRow: React.Dispatch<React.SetStateAction<AppModuleFeature | null>>
  keyName: string
}

const AppModuleFeatureContext = React.createContext<AppModuleFeatureContextType | null>(null)

interface Props {
  children: React.ReactNode
}

export default function AppModuleFeatureProvider({ children }: Props) {
  const [open, setOpen] = useDialogState<AppModuleFeatureDialogType>(null)
  const [currentRow, setCurrentRow] = useState<AppModuleFeature | null>(null)

  return (
    <AppModuleFeatureContext value={{ open, setOpen, currentRow, setCurrentRow, keyName: "app_module_features" }}>
      {children}
    </AppModuleFeatureContext>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAppModuleFeature = () => {
  const appModuleFeatureContext = React.useContext(AppModuleFeatureContext)

  if (!appModuleFeatureContext) {
    throw new Error('useAppModuleFeature has to be used within <AppModuleFeatureContext>')
  }

  return appModuleFeatureContext
}
