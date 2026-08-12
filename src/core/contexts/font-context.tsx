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
  const [font, setFont] = useLocalStorage<Font>('font', fonts[0], {
    raw: true,
    // Validate the stored value against the configured font list so an
    // outdated localStorage value falls back to the first configured font
    // instead of escaping the provider.
    deserialize: (stored, fallback) =>
      fonts.includes(stored as Font) ? (stored as Font) : fallback,
  })

  useEffect(() => {
    const applyFont = (fontName: string) => {
      const root = document.documentElement
      root.classList.forEach((cls) => {
        if (cls.startsWith('font-')) root.classList.remove(cls)
      })
      root.classList.add(`font-${fontName}`)
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
