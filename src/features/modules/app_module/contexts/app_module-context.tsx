import useDialogState from '@/core/hooks/use-dialog-state'
import React, { useState } from 'react'
import type { AppModule } from '../data/schema'



type AppModuleDialogType = 'invite' | 'add' | 'edit' | 'delete'

interface AppModuleContextType {
  open: AppModuleDialogType | null
  setOpen: (str: AppModuleDialogType | null) => void
  currentRow: AppModule | null
  setCurrentRow: React.Dispatch<React.SetStateAction<AppModule | null>>
  keyName: string
}

const AppModuleContext = React.createContext<AppModuleContextType | null>(null)

interface Props {
  children: React.ReactNode
}

export default function AppModuleProvider({ children }: Props) {
  const [open, setOpen] = useDialogState<AppModuleDialogType>(null)
  const [currentRow, setCurrentRow] = useState<AppModule | null>(null)

  return (
    <AppModuleContext value={{ open, setOpen, currentRow, setCurrentRow, keyName: "app_modules" }}>
      {children}
    </AppModuleContext>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAppModule = () => {
  const appModuleContext = React.useContext(AppModuleContext)

  if (!appModuleContext) {
    throw new Error('useAppModule has to be used within <AppModuleContext>')
  }

  return appModuleContext
}
