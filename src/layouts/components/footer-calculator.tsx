import { useCallback, useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  CalculatorDialog,
  CalculatorDrawer,
  CalculatorPopover,
  CalculatorSheet,
  isEditableElement,
  useCalculatorState,
  type CalculatorPlacement,
} from '@/components/calculator'
import {
  readCalculatorPrefs,
  saveCalculatorPrefs,
} from '@/lib/calculator-prefs'
import { IconCalculator } from '@tabler/icons-react'

/**
 * Calculator anchored in the app footer. Ctrl/Cmd+M (or the footer button)
 * opens it in the user's remembered placement (popover by default); the
 * panel's "open in another container" menu can hop the same calculator into a
 * dialog, a side sheet or a bottom drawer — that choice is remembered too, as
 * is the calculator mode (see {@link readCalculatorPrefs}).
 */
export default function FooterCalculator() {
  const triggerRef = useRef<HTMLButtonElement>(null)
  const calculator = useCalculatorState()
  const [open, setOpen] = useState(false)
  const [placement, setPlacement] = useState<CalculatorPlacement>(
    () => readCalculatorPrefs().placement ?? 'popover',
  )
  // Text field that had focus when the calculator opened — Apply writes into it.
  const [applyTarget, setApplyTarget] = useState<Element | null>(null)

  const captureApplyTarget = useCallback(() => {
    const active = document.activeElement
    setApplyTarget(isEditableElement(active) ? active : null)
  }, [])

  const openCalculator = useCallback(
    (at: CalculatorPlacement, captureTarget = true) => {
      if (at === 'popover') {
        // The footer may be below the fold — bring the anchor into view first,
        // otherwise the popover renders off-screen.
        triggerRef.current?.scrollIntoView({ block: 'nearest' })
      }
      if (captureTarget) captureApplyTarget()
      setOpen(true)
    },
    [captureApplyTarget],
  )

  const toggle = useCallback(() => {
    if (open) {
      setOpen(false)
      return
    }
    openCalculator(placement)
  }, [open, placement, openCalculator])

  // Ctrl/Cmd+M toggles the calculator from anywhere on a protected page.
  useEffect(() => {
    const down = (event: KeyboardEvent) => {
      if (
        event.key.toLowerCase() !== 'm' ||
        !(event.metaKey || event.ctrlKey)
      ) {
        return
      }
      event.preventDefault()
      if (open) {
        setOpen(false)
        return
      }
      openCalculator(placement)
    }
    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [open, placement, openCalculator])

  /** Hop the same calculator (state + placement kept) into another container. */
  const requestPlacement = useCallback(
    (next: CalculatorPlacement) => {
      saveCalculatorPrefs({ placement: next })
      setPlacement(next)
      // Hopping containers must not re-capture — the Apply target is the field
      // the user had focused before the calculator was first opened.
      openCalculator(next, false)
    },
    [openCalculator],
  )

  const close = useCallback(() => setOpen(false), [])

  return (
    <>
      <CalculatorPopover
        open={placement === 'popover' && open}
        onOpenChange={(next) => (next ? openCalculator('popover') : close())}
        state={calculator}
        onRequestPlacement={requestPlacement}
        applyTarget={applyTarget}
        anchor={
          <Button
            ref={triggerRef}
            type="button"
            variant="ghost"
            title="Calculator (Ctrl+M)"
            aria-label="Open calculator (Ctrl+M)"
            onClick={toggle}
            className="h-6 gap-1 rounded-md px-1.5 text-slate-500 hover:bg-slate-200/70 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-700/70 dark:hover:text-slate-200"
          >
            <IconCalculator size={14} />
            <kbd className="hidden font-mono text-[10px] text-muted-foreground md:inline">
              Ctrl+M
            </kbd>
          </Button>
        }
      />
      <CalculatorDialog
        open={placement === 'dialog' && open}
        onOpenChange={(next) => (next ? openCalculator('dialog') : close())}
        state={calculator}
        onRequestPlacement={requestPlacement}
        applyTarget={applyTarget}
      />
      <CalculatorSheet
        open={placement === 'sheet' && open}
        onOpenChange={(next) => (next ? openCalculator('sheet') : close())}
        state={calculator}
        onRequestPlacement={requestPlacement}
        applyTarget={applyTarget}
      />
      <CalculatorDrawer
        open={placement === 'drawer' && open}
        onOpenChange={(next) => (next ? openCalculator('drawer') : close())}
        state={calculator}
        onRequestPlacement={requestPlacement}
        applyTarget={applyTarget}
      />
    </>
  )
}
