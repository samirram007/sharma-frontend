import { useCallback, useEffect, useRef, useState } from 'react'

interface FullscreenDocument extends Document {
  webkitFullscreenElement?: Element | null
  webkitExitFullscreen?: () => Promise<void> | void
}

interface FullscreenElement extends HTMLElement {
  webkitRequestFullscreen?: () => Promise<void> | void
}

/** Swallow fullscreen promise rejections (e.g. gesture/permission errors). */
function swallow(promise: Promise<void> | void): void {
  Promise.resolve(promise).catch(() => {})
}

/**
 * Fullscreen control for an element via the Fullscreen API, with the Safari
 * `webkit*` fallback. Toggling requires a user gesture (browser rule).
 *
 * Environments without the API (jsdom, old iOS Safari) are safe: toggle is a
 * no-op and isFullscreen stays false. Callers showing this inside a Dialog
 * should preventDefault on Escape while fullscreen, so Esc exits fullscreen
 * without also closing the dialog (the browser consumes Esc before Radix).
 */
export function useFullscreen<T extends HTMLElement>() {
  const ref = useRef<T | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(
    () =>
      typeof document !== 'undefined' &&
      ((document as FullscreenDocument).fullscreenElement ??
        (document as FullscreenDocument).webkitFullscreenElement ??
        null) != null,
  )

  useEffect(() => {
    const doc = document as FullscreenDocument
    const sync = () =>
      setIsFullscreen(
        (doc.fullscreenElement ?? doc.webkitFullscreenElement ?? null) != null,
      )
    document.addEventListener('fullscreenchange', sync)
    document.addEventListener('webkitfullscreenchange', sync)
    return () => {
      document.removeEventListener('fullscreenchange', sync)
      document.removeEventListener('webkitfullscreenchange', sync)
    }
  }, [])

  const toggle = useCallback(() => {
    if (typeof document === 'undefined') return
    const doc = document as FullscreenDocument
    const element = ref.current as FullscreenElement | null
    if (!element) return

    const current = doc.fullscreenElement ?? doc.webkitFullscreenElement ?? null
    if (current) {
      if (doc.exitFullscreen) swallow(doc.exitFullscreen())
      else doc.webkitExitFullscreen?.()
      return
    }
    if (element.requestFullscreen) {
      swallow(element.requestFullscreen({ navigationUI: 'hide' }))
    } else {
      element.webkitRequestFullscreen?.()
    }
  }, [])

  return { ref, isFullscreen, toggle }
}
