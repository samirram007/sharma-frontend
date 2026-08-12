import React, { useState } from 'react'

interface AdministrationContextType {
  currentModule: string
  setCurrentModule: (str: string) => void
  sideBarOpen?: boolean
  setSideBarOpen?: (open: boolean) => void
  headerVisible?: boolean
  setHeaderVisible?: (visible: boolean) => void
  keyName: string
}

const AdministrationContext =
  React.createContext<AdministrationContextType | null>(null)

interface Props {
  children: React.ReactNode
}

export default function AdministrationProvider({ children }: Props) {
  const [currentModule, setCurrentModule] = useState<string>('user')
  const [sideBarOpen, setSideBarOpen] = useState<boolean>(true)
  const [headerVisible, setHeaderVisible] = useState<boolean>(true)

  return (
    <AdministrationContext.Provider
      value={{
        currentModule,
        setCurrentModule,
        sideBarOpen,
        setSideBarOpen,
        headerVisible,
        setHeaderVisible,
        keyName: 'administration',
      }}
    >
      {children}
    </AdministrationContext.Provider>
  )
}

export const useAdministration = () => {
  const administrationContext = React.useContext(AdministrationContext)

  if (!administrationContext) {
    throw new Error(
      'useAdministration has to be used within <AdministrationProvider>',
    )
  }

  return administrationContext
}
