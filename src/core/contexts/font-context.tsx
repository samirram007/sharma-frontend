import { fonts } from '@/config/fonts'
import { useLocalStorage } from '@/hooks/use-local-storage'
import React, { createContext, useContext, useEffect } from 'react'

type Font = (typeof fonts)[number]

interface FontContextType {
  font: Font
  setFont: (font: Font) => void
}

const FontContext = createContext<FontContextType | undefined>(undefined)

export const FontProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [savedFont, setSavedFont] = useLocalStorage<string>('font', fonts[0], {
    raw: true,
  })
  // Validate the stored value against the configured font list so an outdated
  // localStorage value can never escape the provider.
  const font: Font = fonts.includes(savedFont as Font)
    ? (savedFont as Font)
    : fonts[0]
  const setFont = (nextFont: Font) => setSavedFont(nextFont)

  useEffect(() => {
    const applyFont = (font: string) => {
      const root = document.documentElement
      root.classList.forEach((cls) => {
        if (cls.startsWith('font-')) root.classList.remove(cls)
      })
      root.classList.add(`font-${font}`)
    }

    applyFont(font)
  }, [font])

  return <FontContext value={{ font, setFont }}>{children}</FontContext>
}

export const useFont = () => {
  const context = useContext(FontContext)
  if (!context) {
    throw new Error('useFont must be used within a FontProvider')
  }
  return context
}
