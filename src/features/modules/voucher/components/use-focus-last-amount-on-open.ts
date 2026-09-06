import { useEffect, useRef } from 'react'

/**
 * When an existing voucher (currentRow id present) opens, land the caret on
 * the amount input of the bottom-most row so the amount can be corrected
 * without a click.
 *
 * The row grid mounts progressively (async lookups, entries one at a time),
 * so the hook keeps re-focusing the current bottom-most `[data-amount-input]`
 * until the grid has been stable for a few frames — then it stops. If the
 * user starts interacting before that (or the grid never appears), it backs
 * off and never steals focus.
 */
export function useFocusLastAmountOnOpen(rowId?: string | number | null): void {
  const focusedForRef = useRef<string | number | null>(null)

  useEffect(() => {
    if (!rowId || focusedForRef.current === rowId) return

    let cancelled = false
    let lastTarget: HTMLInputElement | null = null
    let stableFrames = 0
    let attempts = 0
    const MAX_ATTEMPTS = 1500
    const STABLE_FRAMES = 20

    const cancelOnInteraction = () => {
      cancelled = true
    }
    window.addEventListener('pointerdown', cancelOnInteraction, {
      once: true,
    })
    window.addEventListener('keydown', cancelOnInteraction, { once: true })

    const focusLastAmount = () => {
      if (cancelled || attempts++ >= MAX_ATTEMPTS) return
      const inputs = document.querySelectorAll<HTMLInputElement>(
        '[data-amount-input]',
      )
      const last = inputs[inputs.length - 1] ?? null
      if (!last) {
        requestAnimationFrame(focusLastAmount)
        return
      }
      if (last === lastTarget) {
        stableFrames++
      } else {
        lastTarget = last
        stableFrames = 0
      }
      last.focus()
      if (stableFrames >= STABLE_FRAMES) {
        focusedForRef.current = rowId
        return
      }
      requestAnimationFrame(focusLastAmount)
    }
    requestAnimationFrame(focusLastAmount)

    return () => {
      cancelled = true
      window.removeEventListener('pointerdown', cancelOnInteraction)
      window.removeEventListener('keydown', cancelOnInteraction)
    }
  }, [rowId])
}
