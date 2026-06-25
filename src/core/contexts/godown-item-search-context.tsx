
import { CommandMenu } from '@/layouts/components/command-menu'
import React from 'react'

interface GodownItemSearchContextType {
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
}

const GodownItemSearchContext = React.createContext<GodownItemSearchContextType | null>(null)

interface Props {
  children: React.ReactNode
}

export function GodownItemSearchProvider({ children }: Props) {
  const [open, setOpen] = React.useState(false)

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }
    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  return (
    <GodownItemSearchContext.Provider value={{ open, setOpen }}>
      {children}
      <CommandMenu />
    </GodownItemSearchContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useGodownItemSearch = () => {
  const godownItemSearchContext = React.useContext(GodownItemSearchContext)

  if (!godownItemSearchContext) {
    throw new Error('useGodownItemSearch has to be used within <GodownItemSearchProvider>')
  }

  return godownItemSearchContext
}
