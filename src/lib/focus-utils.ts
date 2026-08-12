/**
 * Moves focus to the next focusable element in the document after `from`
 * (defaults to the current active element).
 *
 * Skips disabled and invisible fields (e.g. FormInputField's `display:none`
 * backing inputs) — calling `focus()` on those is a no-op and would stall
 * keyboard-only data entry mid-row.
 *
 * NOTE: callers decide the timing. Use it synchronously inside Radix
 * `onCloseAutoFocus` (to override the default focus restore) or wrap it in a
 * `requestAnimationFrame` when the DOM needs a frame to settle.
 */
export const focusNextFocusable = (from?: HTMLElement | null) => {
  const focusable = Array.from(
    document.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    ),
  ).filter((el) => {
    if (el.hasAttribute('disabled')) return false
    const rect = el.getBoundingClientRect()
    return rect.width > 0 && rect.height > 0
  })

  const anchor = from ?? (document.activeElement as HTMLElement | null)
  const index = anchor ? focusable.indexOf(anchor) : -1

  if (index >= 0 && index < focusable.length - 1) {
    focusable[index + 1].focus()
  }
}
