import { useCallback } from 'react'
import { focusNextFocusable } from '@/lib/focus-utils'

export function useFocusNext() {
  return useCallback((next?: string | number) => {
    requestAnimationFrame(() => {
      // 👉 1. If "next" is STRING (element ID)
      if (typeof next === 'string' && next.trim() !== '') {
        document.getElementById(next)?.focus()
        return
      }

      // 👉 2. If "next" is NUMBER (tabIndex)
      if (typeof next === 'number') {
        const nextElement = document.querySelector(
          `[tabindex="${next}"]`,
        ) as HTMLElement | null

        nextElement?.focus()
        return
      }

      // 👉 3. If NO PARAM: behave like TAB KEY
      focusNextFocusable()
    })
  }, [])
}
