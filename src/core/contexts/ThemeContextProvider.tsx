import { createContext, use, useEffect } from 'react'
import { useLocalStorage } from '@/hooks/use-local-storage'

type Theme = 'dark' | 'light' | 'system'

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
}

type ThemeProviderState = {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const initialState: ThemeProviderState = {
  theme: 'light',
  setTheme: () => null,
}

const ThemeContext = createContext<ThemeProviderState>(initialState)

export function ThemeContextProvider({
  children,
  defaultTheme = 'light',
  storageKey = 'vite-ui-theme',
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useLocalStorage<Theme>(storageKey, defaultTheme, {
    raw: true,
  })

  useEffect(() => {
    const root = window.document.documentElement

    root.classList.remove('light', 'dark')

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)')
        .matches
        ? 'dark'
        : 'light'

      root.classList.add(systemTheme)
      return
    }

    root.classList.add(theme)
  }, [theme])

  const value = {
    theme,
    setTheme,
  }

  return (
    <ThemeContext {...props} value={value}>
      {children}
    </ThemeContext>
  )
}

export const useTheme = () => {
  const context = use(ThemeContext)

  if (context === undefined)
    throw new Error('useTheme must be used within a ThemeProvider')

  return context
}
