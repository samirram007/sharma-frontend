import {
  CONVERTER_TOOL_IDS,
  TOOL_IDS,
  type CalculatorToolId,
} from '@/components/calculator-tools/catalog'

/** Every selectable tool id (calculator modes + converter categories). */
const KNOWN_TOOL_IDS: string[] = [...TOOL_IDS, ...CONVERTER_TOOL_IDS]

/**
 * Remembered calculator preferences ("user-defined position and mode"): the
 * placement container the calculator should open in next time, and the
 * calculator tool/mode it should start on. Persisted in localStorage.
 */

const STORAGE_KEY = 'calculator-prefs-v1'

const PLACEMENTS = ['popover', 'dialog', 'sheet', 'drawer'] as const

export type SavedPlacement = (typeof PLACEMENTS)[number]

export interface CalculatorPrefs {
  placement: SavedPlacement
  mode: CalculatorToolId
}

/** Read saved preferences — invalid or missing entries fall back to undefined. */
export function readCalculatorPrefs(): Partial<CalculatorPrefs> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as Partial<CalculatorPrefs>
    return {
      placement: (PLACEMENTS as readonly string[]).includes(
        parsed.placement as string,
      )
        ? (parsed.placement as SavedPlacement)
        : undefined,
      mode: KNOWN_TOOL_IDS.includes(parsed.mode as string)
        ? (parsed.mode as CalculatorToolId)
        : undefined,
    }
  } catch {
    return {}
  }
}

/** Persist (a subset of) the calculator preferences. */
export function saveCalculatorPrefs(prefs: Partial<CalculatorPrefs>): void {
  try {
    const current = readCalculatorPrefs()
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...current, ...prefs }))
  } catch {
    // Storage unavailable (private mode etc.) — preferences just won't stick.
  }
}
