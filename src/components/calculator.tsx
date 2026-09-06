import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
} from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Popover, PopoverAnchor, PopoverContent } from '@/components/ui/popover'
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import {
  evaluateAdvanced,
  evaluateBasic,
  formatNumber,
  solveEquation,
  type AngleMode,
  type SolveResult,
} from '@/lib/calculator-engine'
import GraphingCalculator from '@/components/calculator-tools/graphing-calculator'
import ProgrammerCalculator from '@/components/calculator-tools/programmer-calculator'
import DateCalculator from '@/components/calculator-tools/date-calculator'
import ConverterCalculator from '@/components/calculator-tools/converter-calculator'
import {
  TOOL_ENTRIES,
  toolEntry,
  type CalculatorToolId,
} from '@/components/calculator-tools/catalog'
import {
  readCalculatorPrefs,
  saveCalculatorPrefs,
} from '@/lib/calculator-prefs'
import { cn } from '@/lib/utils'
import {
  Calculator,
  Check,
  Copy,
  History,
  Maximize2,
  Menu,
  MoreHorizontal,
  PanelBottom,
  PanelRight,
  Trash2,
  X,
} from 'lucide-react'

/** Converter categories, in the order shown in the nav list. */
const CONVERTER_CATEGORY_IDS = [
  'currency',
  'volume',
  'length',
  'weight',
  'temperature',
  'energy',
  'area',
  'speed',
  'time',
  'power',
  'data',
  'pressure',
  'angle',
] as const

/**
 * Reusable calculator that can be embedded anywhere. Entry is fully keyboard
 * driven — there is deliberately **no text input**: keypad buttons, the
 * physical keyboard and the numpad all go through one key handler
 * ({@link CalculatorPanel#onKeyDown}), which also lets calculator state
 * persist across opens.
 *
 * The chosen placement container and calculator mode are remembered
 * (localStorage via {@link readCalculatorPrefs}) so the calculator reopens the
 * way the user last configured it. Placement shells ({@link CalculatorPopover},
 * {@link CalculatorDialog}, {@link CalculatorSheet}, {@link CalculatorDrawer})
 * wrap the same shared panel in different containers.
 */

export type CalculatorMode = 'basic' | 'scientific' | 'equation'
export type CalculatorPlacement = 'popover' | 'dialog' | 'sheet' | 'drawer'
export type { CalculatorToolId }

/** One line of calculation history: the expression as typed + its result. */
export interface CalculatorHistoryEntry {
  expression: string
  result: string
}

/** History is capped so the overlay never grows unbounded. */
const MAX_HISTORY_ENTRIES = 30

/** Evaluate an arithmetic expression, throwing the engine's message on error. */
function evaluateForMode(
  mode: CalculatorMode,
  expression: string,
  angle: AngleMode,
): number {
  return mode === 'scientific'
    ? evaluateAdvanced(expression, angle)
    : evaluateBasic(expression)
}

/** Like {@link evaluateForMode} but returns null instead of throwing. */
function tryEvaluate(
  mode: CalculatorMode,
  expression: string,
  angle: AngleMode,
): number | null {
  try {
    return evaluateForMode(mode, expression || '0', angle)
  } catch {
    return null
  }
}

/** Best-effort copy to the clipboard, with a legacy fallback. */
async function copyString(text: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(text)
  } catch {
    const area = document.createElement('textarea')
    area.value = text
    area.style.position = 'fixed'
    area.style.opacity = '0'
    document.body.appendChild(area)
    area.select()
    document.execCommand('copy')
    document.body.removeChild(area)
  }
}

/** Single-line summary of a solve result, for history entries. */
function formatSolveSummary(result: SolveResult): string {
  const variable = result.variable || 'x'
  const root = (value: number) => formatNumber(value)
  switch (result.kind) {
    case 'linear':
      return `${variable} = ${root(result.solution)}`
    case 'quadratic-double':
      return `${variable} = ${root(result.solution)}  (double root)`
    case 'quadratic': {
      const [first, second] = [...result.solutions].sort((a, b) => a - b)
      return `${variable}₁ = ${root(first)}; ${variable}₂ = ${root(second)}`
    }
    case 'identity':
      return `True for every value of ${variable}`
    case 'none':
      return 'No solution'
  }
}

/** Tools that share the arithmetic keypad/entry (Standard/Scientific/Equation). */
const ARITHMETIC_TOOLS = new Set<CalculatorToolId>([
  'basic',
  'scientific',
  'equation',
])

/** Type guard — an arithmetic tool id doubles as its keypad mode. */
const isArithmeticTool = (tool: CalculatorToolId): tool is CalculatorMode =>
  ARITHMETIC_TOOLS.has(tool)

/** Tool switch menu: Calculator modes first, then Converter categories. */
const TOOL_GROUPS: Array<{ key: string; tools: CalculatorToolId[] }> = [
  { key: 'Calculator', tools: TOOL_ENTRIES.map((entry) => entry.id) },
  {
    key: 'Converter',
    tools: CONVERTER_CATEGORY_IDS.map(
      (id) => `converter:${id}` as CalculatorToolId,
    ),
  },
]

export interface CalculatorSnapshot {
  mode: CalculatorMode
  angle: AngleMode
  drafts: Record<CalculatorMode, string>
}

export const DEFAULT_CALCULATOR_SNAPSHOT: CalculatorSnapshot = {
  mode: 'basic',
  angle: 'deg',
  drafts: { basic: '', scientific: '', equation: '' },
}

const PLACEMENT_LABELS: Record<CalculatorPlacement, string> = {
  popover: 'Footer popover',
  dialog: 'Dialog',
  sheet: 'Side sheet',
  drawer: 'Bottom drawer',
}

/* ─────────────────────────── state hook ─────────────────────────── */

export interface CalculatorState {
  mode: CalculatorMode
  setMode: (mode: CalculatorMode) => void
  tool: CalculatorToolId
  setTool: (tool: CalculatorToolId) => void
  angle: AngleMode
  setAngle: (angle: AngleMode) => void
  expression: string
  setExpression: (value: string) => void
  clear: () => void
  backspace: () => void
  append: (text: string) => void
  percent: () => void
  equals: () => void
  error: string | null
  setError: (error: string | null) => void
  memory: number | null
  memoryStore: () => void
  memoryAdd: () => void
  memorySubtract: () => void
  memoryRecall: () => void
  memoryClear: () => void
  history: CalculatorHistoryEntry[]
  pushHistory: (expression: string, result: string) => void
  clearHistory: () => void
  snapshot: () => CalculatorSnapshot
}

export function useCalculatorState(
  initial?: CalculatorSnapshot,
): CalculatorState {
  const saved = useMemo(() => readCalculatorPrefs(), [])
  const savedTool: CalculatorToolId =
    (saved.mode as CalculatorToolId | undefined) ?? 'basic'
  const [tool, setToolState] = useState<CalculatorToolId>(
    initial?.mode ?? savedTool,
  )
  const [mode, setMode] = useState<CalculatorMode>(
    isArithmeticTool(tool) ? tool : 'basic',
  )
  const [angle, setAngle] = useState<AngleMode>(initial?.angle ?? 'deg')
  const [drafts, setDrafts] = useState<Record<CalculatorMode, string>>(
    initial?.drafts ?? DEFAULT_CALCULATOR_SNAPSHOT.drafts,
  )
  const [error, setError] = useState<string | null>(null)
  const [memory, setMemory] = useState<number | null>(null)
  const [history, setHistory] = useState<CalculatorHistoryEntry[]>([])

  const expression = drafts[mode]

  /** Record a calculation, de-duplicating an immediately repeated solve. */
  const pushHistory = (entryExpression: string, result: string) => {
    setHistory((current) => {
      const head = current[0]
      if (
        head &&
        head.expression === entryExpression &&
        head.result === result
      ) {
        return current
      }
      return [{ expression: entryExpression, result }, ...current].slice(
        0,
        MAX_HISTORY_ENTRIES,
      )
    })
  }

  const clearHistory = () => setHistory([])

  /** Switching tool is a user preference — remember it for next time. */
  const changeTool = (next: CalculatorToolId) => {
    setError(null)
    setToolState(next)
    if (isArithmeticTool(next)) setMode(next)
    saveCalculatorPrefs({ mode: next })
  }

  /** Kept for callers that switch the underlying arithmetic mode directly. */
  const changeMode = (next: CalculatorMode) => {
    setError(null)
    setMode(next)
    setToolState(next)
    saveCalculatorPrefs({ mode: next })
  }

  const setExpression = (value: string) => {
    setError(null)
    setDrafts((current) => ({ ...current, [mode]: value }))
  }

  const clear = () => {
    setError(null)
    setDrafts((current) => ({ ...current, [mode]: '' }))
  }

  const backspace = () => {
    setError(null)
    setExpression(expression.slice(0, -1))
  }

  const append = (text: string) => {
    setError(null)
    setExpression(expression + text)
  }

  /** Turn the trailing number into its percentage (200 % → 2). */
  const percent = () => {
    const match = expression.match(/(\d+(?:\.\d+)?)$/)
    if (!match) return
    const replacement = String(Number(match[1]) / 100)
    setExpression(
      expression.slice(0, expression.length - match[1].length) + replacement,
    )
  }

  /** Evaluate the current expression and keep the result for chaining. */
  const equals = () => {
    if (mode === 'equation') return
    setError(null)
    try {
      const value = evaluateForMode(mode, expression || '0', angle)
      setExpression(formatNumber(value))
      pushHistory(expression.trim() || '0', formatNumber(value))
    } catch (err) {
      setError((err as Error).message)
    }
  }

  /** Numeric value of the current entry, or null when not evaluable. */
  const currentValue = (): number | null =>
    mode === 'equation' ? null : tryEvaluate(mode, expression, angle)

  /** Memory operations — MS/M+/M− store or adjust, MR recalls, MC clears. */
  const memoryStore = () => {
    const value = currentValue()
    if (value !== null) setMemory(value)
  }

  const memoryAdd = () => {
    const value = currentValue()
    if (value === null) return
    setMemory((current) => (current ?? 0) + value)
  }

  const memorySubtract = () => {
    const value = currentValue()
    if (value === null) return
    setMemory((current) => (current ?? 0) - value)
  }

  const memoryRecall = () => {
    if (memory === null) return
    setError(null)
    setExpression(formatNumber(memory))
  }

  const memoryClear = () => setMemory(null)

  const snapshot = (): CalculatorSnapshot => ({ mode, angle, drafts })

  return {
    mode,
    setMode: changeMode,
    tool,
    setTool: changeTool,
    angle,
    setAngle,
    expression,
    setExpression,
    clear,
    backspace,
    append,
    percent,
    equals,
    error,
    setError,
    memory,
    memoryStore,
    memoryAdd,
    memorySubtract,
    memoryRecall,
    memoryClear,
    history,
    pushHistory,
    clearHistory,
    snapshot,
  }
}

/* ──────────────────────────── keypads ───────────────────────────── */

type CalcKey =
  | { label: string; kind: 'insert'; value: string }
  | { label: string; kind: 'clear' | 'back' | 'percent' | 'equals' }

const BASIC_ROWS: CalcKey[][] = [
  [
    { label: 'C', kind: 'clear' },
    { label: '⌫', kind: 'back' },
    { label: '(', kind: 'insert', value: '(' },
    { label: ')', kind: 'insert', value: ')' },
  ],
  [
    { label: '7', kind: 'insert', value: '7' },
    { label: '8', kind: 'insert', value: '8' },
    { label: '9', kind: 'insert', value: '9' },
    { label: '÷', kind: 'insert', value: '÷' },
  ],
  [
    { label: '4', kind: 'insert', value: '4' },
    { label: '5', kind: 'insert', value: '5' },
    { label: '6', kind: 'insert', value: '6' },
    { label: '×', kind: 'insert', value: '×' },
  ],
  [
    { label: '1', kind: 'insert', value: '1' },
    { label: '2', kind: 'insert', value: '2' },
    { label: '3', kind: 'insert', value: '3' },
    { label: '−', kind: 'insert', value: '−' },
  ],
  [
    { label: '.', kind: 'insert', value: '.' },
    { label: '%', kind: 'percent' },
    { label: '0', kind: 'insert', value: '0' },
    { label: '+', kind: 'insert', value: '+' },
  ],
]

const ADVANCED_ROWS: CalcKey[][] = [
  [
    { label: 'sin', kind: 'insert', value: 'sin(' },
    { label: 'cos', kind: 'insert', value: 'cos(' },
    { label: 'tan', kind: 'insert', value: 'tan(' },
    { label: 'ln', kind: 'insert', value: 'ln(' },
  ],
  [
    { label: 'log', kind: 'insert', value: 'log(' },
    { label: '√', kind: 'insert', value: 'sqrt(' },
    { label: '|x|', kind: 'insert', value: 'abs(' },
    { label: 'π', kind: 'insert', value: 'π' },
  ],
  [
    { label: 'e', kind: 'insert', value: 'e' },
    { label: 'xʸ', kind: 'insert', value: '^' },
    { label: 'C', kind: 'clear' },
    { label: '⌫', kind: 'back' },
  ],
  [
    { label: '(', kind: 'insert', value: '(' },
    { label: ')', kind: 'insert', value: ')' },
    { label: '7', kind: 'insert', value: '7' },
    { label: '8', kind: 'insert', value: '8' },
  ],
  [
    { label: '9', kind: 'insert', value: '9' },
    { label: '÷', kind: 'insert', value: '÷' },
    { label: '4', kind: 'insert', value: '4' },
    { label: '5', kind: 'insert', value: '5' },
  ],
  [
    { label: '6', kind: 'insert', value: '6' },
    { label: '×', kind: 'insert', value: '×' },
    { label: '1', kind: 'insert', value: '1' },
    { label: '2', kind: 'insert', value: '2' },
  ],
  [
    { label: '3', kind: 'insert', value: '3' },
    { label: '−', kind: 'insert', value: '−' },
    { label: '.', kind: 'insert', value: '.' },
    { label: '%', kind: 'percent' },
  ],
  [
    { label: '0', kind: 'insert', value: '0' },
    { label: '+', kind: 'insert', value: '+' },
  ],
]

const EQUATION_ROWS: CalcKey[][] = [
  [
    { label: 'C', kind: 'clear' },
    { label: '⌫', kind: 'back' },
    { label: '(', kind: 'insert', value: '(' },
    { label: ')', kind: 'insert', value: ')' },
  ],
  [
    { label: '7', kind: 'insert', value: '7' },
    { label: '8', kind: 'insert', value: '8' },
    { label: '9', kind: 'insert', value: '9' },
    { label: '÷', kind: 'insert', value: '÷' },
  ],
  [
    { label: '4', kind: 'insert', value: '4' },
    { label: '5', kind: 'insert', value: '5' },
    { label: '6', kind: 'insert', value: '6' },
    { label: '×', kind: 'insert', value: '×' },
  ],
  [
    { label: '1', kind: 'insert', value: '1' },
    { label: '2', kind: 'insert', value: '2' },
    { label: '3', kind: 'insert', value: '3' },
    { label: '−', kind: 'insert', value: '−' },
  ],
  [
    { label: '0', kind: 'insert', value: '0' },
    { label: '.', kind: 'insert', value: '.' },
    { label: 'x', kind: 'insert', value: 'x' },
    { label: '+', kind: 'insert', value: '+' },
  ],
]

const ROWS_BY_MODE: Record<CalculatorMode, CalcKey[][]> = {
  basic: BASIC_ROWS,
  scientific: ADVANCED_ROWS,
  equation: EQUATION_ROWS,
}

const EQUALS_LABEL: Record<CalculatorMode, string> = {
  basic: '=',
  scientific: '=',
  equation: 'Solve',
}

/* ─────────────── keyboard input (no text box involved) ──────────── */

/** Numpad / named keys → the character they represent on a keypad. */
const NUMPAD_KEYS: Record<string, string> = {
  NumpadAdd: '+',
  NumpadSubtract: '-',
  NumpadMultiply: '*',
  NumpadDivide: '/',
  NumpadDecimal: '.',
  Decimal: '.',
}

/** Pretty operator glyphs for anything typed or pressed on a numpad. */
const ASCII_OPERATORS: Record<string, string> = {
  '*': '×',
  '/': '÷',
  '-': '−',
}

/** Characters allowed straight from the keyboard in each mode. */
const TYPABLE = {
  basic: /^[0-9+\-*/().%]$/,
  scientific: /^[0-9a-zA-Z+\-*/().%^]$/,
  equation: /^[0-9a-zA-Z+\-*/().^=]$/,
}

/* ─────────────────────── applying a result ──────────────────────── */

export type EditableTarget =
  HTMLInputElement | HTMLTextAreaElement | HTMLElement

/** True when an element can receive a typed value (input / textarea / contenteditable). */
export function isEditableElement(
  element: Element | null | undefined,
): element is EditableTarget {
  if (!element) return false
  return (
    element instanceof HTMLInputElement ||
    element instanceof HTMLTextAreaElement ||
    (element instanceof HTMLElement && element.isContentEditable)
  )
}

/**
 * What the Apply button inserts: the computed result when the current
 * expression evaluates, otherwise the expression as typed.
 */
function applyTextFor(
  mode: CalculatorMode,
  expression: string,
  angle: AngleMode,
): string {
  if (!expression.trim()) return '0'
  if (mode === 'equation') {
    try {
      const result = solveEquation(expression)
      if (result.kind === 'linear') return formatNumber(result.solution)
      if (result.kind === 'quadratic-double')
        return formatNumber(result.solution)
      if (result.kind === 'quadratic') {
        const [first] = [...result.solutions].sort((a, b) => a - b)
        return formatNumber(first)
      }
    } catch {
      // fall through to the raw expression
    }
    return expression
  }
  try {
    const value =
      mode === 'scientific'
        ? evaluateAdvanced(expression, angle)
        : evaluateBasic(expression)
    return formatNumber(value)
  } catch {
    return expression
  }
}

/**
 * Write into a React-controlled field without fighting React's value
 * tracking: use the native setter and dispatch an `input` event so
 * onChange / react-hook-form see the change.
 */
function writeElementValue(target: EditableTarget, value: string): void {
  if (
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement
  ) {
    const prototype =
      target instanceof HTMLTextAreaElement
        ? HTMLTextAreaElement.prototype
        : HTMLInputElement.prototype
    const setter = Object.getOwnPropertyDescriptor(prototype, 'value')?.set
    if (setter) setter.call(target, value)
    else target.value = value
    target.dispatchEvent(new Event('input', { bubbles: true }))
    return
  }
  // contenteditable
  if (target.textContent !== value) target.textContent = value
  target.dispatchEvent(new Event('input', { bubbles: true }))
}

/* ─────────────────────── non-arithmetic tools ──────────────────── */

/** Body for the tools that aren't the arithmetic keypads. */
function ToolContent({ tool }: { tool: CalculatorToolId }) {
  if (tool === 'graphing') return <GraphingCalculator />
  if (tool === 'programmer') return <ProgrammerCalculator />
  if (tool === 'date') return <DateCalculator />
  if (tool.startsWith('converter:')) {
    return <ConverterCalculator categoryId={tool.slice('converter:'.length)} />
  }
  return null
}

/* ─────────────────── overlays (nav drawer + history) ───────────── */

interface CalculatorNavOverlayProps {
  activeTool: CalculatorToolId
  onSelect: (tool: CalculatorToolId) => void
  onClose: () => void
}

/** Windows-Calculator-style tool drawer: Calculator then Converter sections. */
function CalculatorNavOverlay({
  activeTool,
  onSelect,
  onClose,
}: CalculatorNavOverlayProps) {
  return (
    <div
      data-testid="calc-nav"
      className="absolute inset-0 z-20 flex flex-col overflow-hidden rounded-xl border border-slate-200/80 bg-popover text-popover-foreground shadow-2xl dark:border-white/10"
    >
      <div className="flex items-center justify-between border-b border-slate-200/70 px-3 py-2 dark:border-white/10">
        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Menu
        </span>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          aria-label="Close menu"
          title="Close menu"
          onClick={onClose}
          className="h-7 w-7 p-0 text-muted-foreground"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto px-2 py-2">
        {TOOL_GROUPS.map((group, groupIndex) => (
          <div key={group.key}>
            {groupIndex > 0 && (
              <div className="mx-2 my-1.5 h-px bg-slate-200/70 dark:bg-white/10" />
            )}
            <p className="px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              {group.key}
            </p>
            {group.tools.map((id) => {
              const entry = toolEntry(id)
              const EntryIcon = entry?.icon
              const active = id === activeTool
              return (
                <button
                  key={id}
                  type="button"
                  data-testid={`calc-tool-${id}`}
                  aria-current={active || undefined}
                  onClick={() => onSelect(id)}
                  className={cn(
                    'flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/50',
                    active
                      ? 'bg-sky-50 font-semibold text-sky-700 dark:bg-sky-500/10 dark:text-sky-300'
                      : 'text-foreground hover:bg-slate-100 dark:hover:bg-slate-800',
                  )}
                >
                  {EntryIcon && (
                    <EntryIcon
                      className={cn(
                        'h-4 w-4 shrink-0',
                        active
                          ? 'text-sky-600 dark:text-sky-400'
                          : 'text-muted-foreground',
                      )}
                    />
                  )}
                  <span className="truncate">{entry?.label ?? id}</span>
                  {active && (
                    <span
                      aria-hidden
                      className="ml-auto h-2 w-2 shrink-0 rounded-full bg-sky-500/80 shadow-[0_0_5px_rgb(14_165_233/0.6)]"
                    />
                  )}
                </button>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}

interface CalculatorHistoryOverlayProps {
  entries: CalculatorHistoryEntry[]
  onReuse: (entry: CalculatorHistoryEntry) => void
  onClear: () => void
  onClose: () => void
}

/** Past calculations — click an entry to load it back into the keypad. */
function CalculatorHistoryOverlay({
  entries,
  onReuse,
  onClear,
  onClose,
}: CalculatorHistoryOverlayProps) {
  return (
    <div
      data-testid="calc-history-panel"
      className="absolute inset-0 z-20 flex flex-col overflow-hidden rounded-xl border border-slate-200/80 bg-popover text-popover-foreground shadow-2xl dark:border-white/10"
    >
      <div className="flex items-center justify-between border-b border-slate-200/70 px-3 py-2 dark:border-white/10">
        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          History
        </span>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            aria-label="Clear history"
            title="Clear history"
            disabled={entries.length === 0}
            onClick={onClear}
            className="h-7 w-7 p-0 text-muted-foreground"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            aria-label="Close history"
            title="Close history"
            onClick={onClose}
            className="h-7 w-7 p-0 text-muted-foreground"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
      {entries.length > 0 ? (
        <div className="flex-1 overflow-y-auto">
          {entries.map((entry, index) => (
            <button
              key={`${index}-${entry.expression}`}
              type="button"
              data-testid="calc-history-entry"
              title="Load this calculation"
              onClick={() => onReuse(entry)}
              className="flex w-full flex-col items-stretch gap-0.5 border-b border-slate-100 px-3 py-2 text-left font-mono transition-colors hover:bg-slate-100/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-sky-500/50 dark:border-white/5 dark:hover:bg-slate-800/70"
            >
              <span className="truncate text-[11px] text-muted-foreground">
                {entry.expression}
              </span>
              <span className="truncate text-right text-sm font-semibold text-sky-700 dark:text-sky-300">
                {entry.result}
              </span>
            </button>
          ))}
        </div>
      ) : (
        <div className="flex flex-1 items-center justify-center p-6 text-xs text-muted-foreground">
          No calculations yet.
        </div>
      )}
      <div className="border-t border-slate-200/70 px-3 py-1.5 text-[10px] text-muted-foreground dark:border-white/10">
        Click an entry to load it back into the keypad
      </div>
    </div>
  )
}

/* ───────────────────────────── panel ────────────────────────────── */

interface CalculatorPanelProps {
  /** Shared state — omit for a standalone panel that owns its state. */
  state?: CalculatorState
  /** Renders a close button in the header (e.g. inside a popover). */
  onClose?: () => void
  /** Offers "open in another container" entries in the header menu. */
  placementMenu?: boolean
  onRequestPlacement?: (
    placement: CalculatorPlacement,
    snapshot: CalculatorSnapshot,
  ) => void
  /** Field the calculated value should be applied to (was focused before open). */
  applyTarget?: Element | null
  /** Fired after a successful Apply (so shells can close themselves). */
  onApplied?: () => void
  className?: string
}

function CalculatorPanelBody({
  state,
  onClose,
  placementMenu = false,
  onRequestPlacement,
  applyTarget,
  onApplied,
  className,
}: Required<Pick<CalculatorPanelProps, 'state'>> & CalculatorPanelProps) {
  const {
    mode,
    tool,
    setTool,
    angle,
    setAngle,
    expression,
    setExpression,
    clear,
    backspace,
    append,
    percent,
    equals,
    error,
    setError,
    memory,
    memoryStore,
    memoryAdd,
    memorySubtract,
    memoryRecall,
    memoryClear,
    history,
    pushHistory,
    clearHistory,
    snapshot,
  } = state

  const arithmetic = isArithmeticTool(tool)
  const activeEntry = toolEntry(tool)
  const ActiveEntryIcon = activeEntry?.icon
  const activeEntryLabel = activeEntry?.label ?? 'Calculator'
  // Windows-style nav drawer + history overlay (panel-local UI state).
  const [navOpen, setNavOpen] = useState(false)
  const [historyOpen, setHistoryOpen] = useState(false)
  // "Press Esc again to close" confirmation shown after Escape dismisses an
  // overlay while the calculator itself stays open.
  const [escapeHint, setEscapeHint] = useState(false)
  // Short-lived "copied!" confirmation on the display's copy button.
  const [copied, setCopied] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)

  // Keyboard focus lands on the calculator container for arithmetic tools so
  // typed keys (and the numpad) go to the calculator; other tools bring their
  // own fields (converter inputs etc.) and keep natural focus.
  useEffect(() => {
    if (!isArithmeticTool(tool)) return
    const frame = requestAnimationFrame(() => {
      panelRef.current?.focus()
    })
    return () => cancelAnimationFrame(frame)
  }, [mode, tool])

  // Live equation solving — the latest successful solve sticks while typing.
  const [equationSolve, setEquationSolve] = useState<{
    source: string
    result: SolveResult
  } | null>(null)
  useEffect(() => {
    if (mode !== 'equation') return
    if (!expression.includes('=')) {
      setEquationSolve(null)
      return
    }
    try {
      setEquationSolve({
        source: expression,
        result: solveEquation(expression),
      })
    } catch {
      // Incomplete while typing — keep showing the previous solution.
    }
  }, [mode, expression])

  const liveResult = useMemo(() => {
    if (mode === 'equation' || !expression) return null
    try {
      const value =
        mode === 'scientific'
          ? evaluateAdvanced(expression, angle)
          : evaluateBasic(expression)
      return formatNumber(value)
    } catch {
      return null
    }
  }, [mode, expression, angle])

  /** What the Copy button / Ctrl+C puts on the clipboard. */
  const copyTarget = useMemo(() => {
    if (!expression.trim()) return ''
    if (mode === 'equation') return expression.trim()
    const value = tryEvaluate(mode, expression, angle)
    return value !== null ? formatNumber(value) : expression.trim()
  }, [mode, expression, angle])

  const copyCurrent = async () => {
    if (!copyTarget) return
    await copyString(copyTarget)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1200)
  }

  const press = (key: CalcKey) => {
    if (key.kind === 'insert') {
      append(key.value)
      return
    }
    if (key.kind === 'clear') {
      clear()
      return
    }
    if (key.kind === 'back') {
      backspace()
      return
    }
    if (key.kind === 'percent') {
      percent()
      return
    }
    // equals — equation mode commits the " = " once, otherwise evaluates.
    if (mode === 'equation') {
      if (!expression.includes('=')) {
        setExpression(`${expression} = `)
      }
      return
    }
    equals()
  }

  /** Commit " = " (equation) or evaluate (basic/scientific). */
  const commit = () => {
    if (mode === 'equation') {
      if (!expression.includes('=')) {
        setExpression(`${expression} = `)
        return
      }
      // Equation complete & solved — log the live solution once.
      if (equationSolve && equationSolve.source === expression) {
        pushHistory(expression, formatSolveSummary(equationSolve.result))
      }
      return
    }
    equals()
  }

  const focusPanel = (event?: ReactMouseEvent) => {
    event?.preventDefault()
    panelRef.current?.focus()
  }

  // While an overlay (nav drawer / history) is open, own Escape from the very
  // top of the propagation path. The Radix shells (dialog/popover/sheet)
  // dismiss on Escape via a document-level keydown listener, so only a
  // window-capture handler can beat them: it swallows the event and closes the
  // overlay, leaving the calculator itself open. A second Escape closes it —
  // so show a hint telling the user to press Escape again to fully close.
  useEffect(() => {
    if (!(navOpen || historyOpen)) return
    const onWindowEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      event.preventDefault()
      event.stopImmediatePropagation()
      setNavOpen(false)
      setHistoryOpen(false)
      setEscapeHint(true)
    }
    window.addEventListener('keydown', onWindowEscape, true)
    return () => window.removeEventListener('keydown', onWindowEscape, true)
  }, [navOpen, historyOpen])

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    const { key, ctrlKey, metaKey, altKey } = event

    if (key === 'Escape') {
      // Overlay-open Escapes are already handled (and stopped) by the window
      // capture listener above — this only closes the calculator itself.
      setEscapeHint(false)
      onClose?.()
      return
    }
    if (!isArithmeticTool(tool)) return // let tool fields handle their own keys
    if (navOpen || historyOpen) return // overlays own the keyboard while open

    // Ctrl/Cmd+C copies the current result (like Windows Calculator).
    if ((ctrlKey || metaKey) && key.toLowerCase() === 'c' && copyTarget) {
      event.preventDefault()
      event.stopPropagation()
      void copyCurrent()
      return
    }
    if (ctrlKey || metaKey || altKey) return // shortcuts (e.g. Ctrl+M) own these

    if (key === 'Enter' || key === 'NumpadEnter') {
      event.preventDefault()
      event.stopPropagation()
      commit()
      return
    }
    if (key === 'Backspace' || key === 'Delete') {
      event.preventDefault()
      event.stopPropagation()
      backspace()
      return
    }

    let char: string | null = null
    if (key.length === 1) {
      char = key
    } else {
      const mapped = NUMPAD_KEYS[key]
      if (mapped) char = mapped
    }
    if (char === null) return

    if (char === '=') {
      event.preventDefault()
      event.stopPropagation()
      commit()
      return
    }

    const pretty = ASCII_OPERATORS[char] ?? char
    const pattern = TYPABLE[mode]
    if (!pattern.test(pretty) && !pattern.test(char)) return
    event.preventDefault()
    event.stopPropagation()
    append(ASCII_OPERATORS[char] ? ASCII_OPERATORS[char] : char)
  }

  const equationLines = useMemo(() => {
    if (mode !== 'equation') return null
    if (!equationSolve) {
      return expression.includes('=')
        ? [{ text: 'Still typing…' }]
        : [{ text: 'Type an equation — e.g. 2x + 3 = 7' }]
    }
    const variable = equationSolve.result.variable || 'x'
    const root = (value: number) => formatNumber(value)
    switch (equationSolve.result.kind) {
      case 'linear':
        return [
          { text: `${variable} = ${root(equationSolve.result.solution)}` },
        ]
      case 'quadratic-double':
        return [
          {
            text: `${variable} = ${root(equationSolve.result.solution)}  (double root)`,
          },
        ]
      case 'quadratic': {
        const [first, second] = [...equationSolve.result.solutions].sort(
          (a, b) => a - b,
        )
        return [
          { text: `${variable}₁ = ${root(first)}` },
          { text: `${variable}₂ = ${root(second)}` },
        ]
      }
      case 'identity':
        return [{ text: `True for every value of ${variable}` }]
      case 'none':
        return [{ text: 'No solution' }]
    }
  }, [mode, equationSolve, expression])

  const placements: CalculatorPlacement[] = [
    'dialog',
    'sheet',
    'drawer',
    'popover',
  ]

  return (
    <div
      ref={panelRef}
      data-testid="calculator-panel"
      tabIndex={-1}
      onKeyDown={handleKeyDown}
      onMouseDown={arithmetic ? focusPanel : undefined}
      className={cn(
        'flex select-none flex-col gap-3 rounded-xl outline-none',
        className,
      )}
    >
      {/* Header: tool switcher + context actions */}
      <div className="flex items-center justify-between gap-1">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          data-testid="calc-tool-switcher"
          aria-label="Choose calculator tool"
          title="Choose calculator mode or converter"
          onClick={() => {
            setEscapeHint(false)
            setHistoryOpen(false)
            setNavOpen((value) => !value)
          }}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-200/80 px-0 text-foreground dark:border-white/10"
        >
          <Menu className="h-4 w-4" />
        </Button>
        <div className="flex min-w-0 items-center gap-1.5">
          {ActiveEntryIcon && (
            <ActiveEntryIcon className="h-3.5 w-3.5 shrink-0 text-sky-600 dark:text-sky-300" />
          )}
          <span className="truncate text-xs font-semibold text-foreground">
            {activeEntryLabel}
          </span>
        </div>

        <div className="flex items-center gap-1">
          {arithmetic && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              data-testid="calc-apply"
              disabled={!isEditableElement(applyTarget)}
              onClick={() => {
                if (!isEditableElement(applyTarget)) return
                writeElementValue(
                  applyTarget,
                  applyTextFor(mode, expression, angle),
                )
                requestAnimationFrame(() => {
                  // Hand focus back to the field, caret at the end.
                  if (
                    applyTarget instanceof HTMLInputElement ||
                    applyTarget instanceof HTMLTextAreaElement
                  ) {
                    applyTarget.focus()
                    try {
                      applyTarget.setSelectionRange(
                        applyTarget.value.length,
                        applyTarget.value.length,
                      )
                    } catch {
                      // not focusable / not a text field
                    }
                  } else {
                    applyTarget.focus()
                  }
                  onApplied?.()
                })
              }}
              title={
                isEditableElement(applyTarget)
                  ? 'Insert the calculated value into the focused field'
                  : 'Focus a text field first, then open the calculator to enable Apply'
              }
              className="h-7 gap-1 rounded-md px-2 text-xs font-semibold"
            >
              <Check className="h-3.5 w-3.5" />
              Apply
            </Button>
          )}

          {arithmetic && mode === 'scientific' && (
            <button
              type="button"
              data-testid="calc-angle-toggle"
              onClick={() => setAngle(angle === 'deg' ? 'rad' : 'deg')}
              className={cn(
                'h-7 rounded-md border px-2 font-mono text-xs font-semibold',
                angle === 'deg'
                  ? 'border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-300'
                  : 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300',
              )}
            >
              {angle === 'deg' ? 'DEG' : 'RAD'}
            </button>
          )}

          {arithmetic && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              data-testid="calc-history"
              aria-label="Calculation history"
              title="Calculation history"
              onClick={() => {
                setEscapeHint(false)
                setNavOpen(false)
                setHistoryOpen((value) => !value)
              }}
              className="h-7 w-8 px-0 text-muted-foreground"
            >
              <History className="h-4 w-4" />
            </Button>
          )}

          {placementMenu && (
            <DropdownMenu
              onOpenChange={(menuOpen) => {
                // Return focus to the calculator when the menu closes.
                if (!menuOpen) panelRef.current?.focus()
              }}
            >
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  aria-label="Open calculator in another container"
                  title="Open in another container"
                  className="h-7 w-8 px-0 text-muted-foreground"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {placements.map((placement) => (
                  <DropdownMenuItem
                    key={placement}
                    onClick={() => onRequestPlacement?.(placement, snapshot())}
                  >
                    <span className="flex items-center gap-2">
                      {placement === 'dialog' && (
                        <Maximize2 className="h-3.5 w-3.5" />
                      )}
                      {placement === 'sheet' && (
                        <PanelRight className="h-3.5 w-3.5" />
                      )}
                      {placement === 'drawer' && (
                        <PanelBottom className="h-3.5 w-3.5" />
                      )}
                      {placement === 'popover' && (
                        <Calculator className="h-3.5 w-3.5" />
                      )}
                      {PLACEMENT_LABELS[placement]}
                    </span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {onClose && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              aria-label="Close calculator"
              onClick={onClose}
              className="h-7 w-8 px-0 text-muted-foreground"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      <div className="relative flex min-w-0 flex-col gap-3">
        {arithmetic ? (
          <>
            {/* Entry display — read-only; input arrives via keys (keypad,
              keyboard, numpad) handled above, so there is no native text box
              to fight over. */}
            <div
              className="flex min-h-24 flex-col justify-between gap-2 overflow-hidden rounded-lg border border-slate-200/80 bg-muted/40 px-4 py-3 font-mono dark:border-white/10"
              aria-label={
                mode === 'equation'
                  ? 'Equation to solve. Type with your keyboard.'
                  : 'Calculator expression. Type with your keyboard.'
              }
            >
              {/* Memory chip + copy action for the current value */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex min-h-4 items-center gap-1.5">
                  {memory !== null && (
                    <span
                      data-testid="calc-memory-chip"
                      title={`Memory: ${formatNumber(memory)}`}
                      className="rounded border border-sky-200 bg-sky-50 px-1 py-px text-[10px] font-bold leading-4 text-sky-700 dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-300"
                    >
                      M
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  data-testid="calc-copy"
                  aria-label="Copy result"
                  title="Copy result (Ctrl+C)"
                  onClick={() => void copyCurrent()}
                  disabled={!copyTarget}
                  className="flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-slate-200/70 hover:text-foreground disabled:pointer-events-none disabled:opacity-40 dark:hover:bg-slate-700/60"
                >
                  {copied ? (
                    <Check className="h-3 w-3" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                </button>
              </div>
              <div
                data-testid="calculator-entry"
                title={
                  mode === 'equation'
                    ? 'Type an equation such as 2x + 3 = 7 — press Enter to solve'
                    : 'Type with your keyboard or numpad — press Enter to calculate'
                }
                className={cn(
                  'min-h-10 break-words text-right text-2xl leading-9 text-foreground',
                  !expression && 'text-muted-foreground/50',
                )}
              >
                {expression || '0'}
              </div>
              <div
                aria-live="polite"
                data-testid="calculator-status"
                className={cn(
                  'flex min-h-5 flex-col items-end justify-end gap-0.5 text-right text-xs',
                  mode === 'equation' ? 'min-h-10' : '',
                )}
              >
                {error ? (
                  <span className="text-red-500">{error}</span>
                ) : equationLines ? (
                  equationLines.map((line, index) => (
                    <span
                      key={`${index}-${line.text}`}
                      className="font-semibold text-sky-700 dark:text-sky-300"
                    >
                      {line.text}
                    </span>
                  ))
                ) : liveResult !== null ? (
                  <span className="text-muted-foreground">= {liveResult}</span>
                ) : null}
              </div>
            </div>

            {/* Memory keys — Standard & Scientific only (Windows Calculator style) */}
            {mode !== 'equation' && (
              <div
                data-testid="calc-memory-row"
                className="grid grid-cols-5 gap-1.5"
              >
                {[
                  {
                    label: 'MC',
                    title: 'Clear memory',
                    disabled: memory === null,
                    run: memoryClear,
                  },
                  {
                    label: 'MR',
                    title: 'Recall memory',
                    disabled: memory === null,
                    run: memoryRecall,
                  },
                  {
                    label: 'M+',
                    title: 'Add to memory',
                    disabled: false,
                    run: memoryAdd,
                  },
                  {
                    label: 'M−',
                    title: 'Subtract from memory',
                    disabled: false,
                    run: memorySubtract,
                  },
                  {
                    label: 'MS',
                    title: 'Store in memory',
                    disabled: false,
                    run: memoryStore,
                  },
                ].map((key) => (
                  <Button
                    key={key.label}
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={key.disabled}
                    title={key.title}
                    data-testid={`calc-mem-${key.label}`}
                    onClick={() => key.run()}
                    className="h-8 px-0 text-xs font-semibold"
                  >
                    {key.label}
                  </Button>
                ))}
              </div>
            )}

            {/* Keypads */}
            <div className="grid grid-cols-4 gap-2">
              {ROWS_BY_MODE[mode].map((row, rowIndex) => (
                <div key={`${mode}-row-${rowIndex}`} className="contents">
                  {row.map((key) => (
                    <Button
                      key={key.label}
                      type="button"
                      variant="outline"
                      onClick={() => press(key)}
                      data-key={key.label}
                      className={cn(
                        'h-12 px-0 text-lg font-medium',
                        key.kind === 'clear' &&
                          'text-lg text-red-500 hover:text-red-500 dark:text-red-400 dark:hover:text-red-400',
                        key.kind === 'back' && 'text-2xl leading-none',
                        mode === 'equation' &&
                          key.label === 'x' &&
                          'font-semibold text-sky-700 dark:text-sky-300',
                      )}
                    >
                      {key.label}
                    </Button>
                  ))}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  press({ label: EQUALS_LABEL[mode], kind: 'equals' })
                }
                data-testid="calc-equals"
                className="col-span-4 h-12 border-0 bg-gradient-to-r from-sky-600 to-indigo-600 px-0 text-lg font-semibold !text-white hover:!text-white hover:from-sky-500 hover:to-indigo-500"
              >
                {EQUALS_LABEL[mode]}
              </Button>
            </div>
          </>
        ) : (
          <ToolContent tool={tool} />
        )}
        {navOpen && (
          <CalculatorNavOverlay
            activeTool={tool}
            onSelect={(next) => {
              setEscapeHint(false)
              setTool(next)
              setNavOpen(false)
            }}
            onClose={() => {
              setEscapeHint(false)
              setNavOpen(false)
            }}
          />
        )}
        {historyOpen && (
          <CalculatorHistoryOverlay
            entries={history}
            onReuse={(entry) => {
              setError(null)
              setEscapeHint(false)
              setExpression(entry.expression)
              setHistoryOpen(false)
            }}
            onClear={clearHistory}
            onClose={() => {
              setEscapeHint(false)
              setHistoryOpen(false)
            }}
          />
        )}
      </div>

      {/* "Press Esc again to close" confirmation — appears after Escape
        dismisses an overlay (menu/history) but keeps the calculator open. */}
      {escapeHint && (
        <div
          data-testid="calc-escape-hint"
          className="flex items-center justify-between gap-2 rounded-md border border-sky-200/70 bg-sky-50/80 px-2.5 py-1.5 text-[11px] font-medium text-sky-800 dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-300"
        >
          <span>Press</span>
          <kbd className="rounded border border-sky-300/70 bg-white/70 px-1.5 py-px font-mono text-[10px] font-semibold text-sky-700 dark:border-sky-500/40 dark:bg-sky-950/50 dark:text-sky-300">
            Esc
          </kbd>
          <span>again to close the calculator</span>
        </div>
      )}
    </div>
  )
}

function CalculatorPanel(props: CalculatorPanelProps) {
  const owned = useCalculatorState()
  return <CalculatorPanelBody {...props} state={props.state ?? owned} />
}

/* ───────────────────────── placement shells ─────────────────────── */

interface CalculatorShellProps {
  state?: CalculatorState
  trigger?: ReactNode
  /** Anchors a popover calculator (footer etc.) without toggling it. */
  anchor?: ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
  placementMenu?: boolean
  onRequestPlacement?: CalculatorPanelProps['onRequestPlacement']
  applyTarget?: Element | null
  onApplied?: () => void
}

function useShellOpen(open?: boolean, onOpenChange?: (open: boolean) => void) {
  const [internal, setInternal] = useState(false)
  const isOpen = open ?? internal
  const setOpen = (value: boolean) => {
    onOpenChange?.(value)
    if (open === undefined) setInternal(value)
  }
  return { isOpen, setOpen }
}

export function CalculatorPopover({
  state,
  anchor,
  open,
  onOpenChange,
  placementMenu = true,
  onRequestPlacement,
  applyTarget,
  onApplied,
}: CalculatorShellProps) {
  const { isOpen, setOpen } = useShellOpen(open, onOpenChange)
  const close = () => setOpen(false)
  return (
    <Popover open={isOpen} onOpenChange={setOpen}>
      {anchor !== undefined && <PopoverAnchor asChild>{anchor}</PopoverAnchor>}
      <PopoverContent
        align="end"
        side="top"
        sideOffset={8}
        className="w-[24rem] max-w-[calc(100vw-1rem)] border border-slate-200/80 p-3 dark:border-white/10"
      >
        <CalculatorPanel
          state={state}
          onClose={close}
          placementMenu={placementMenu}
          onRequestPlacement={onRequestPlacement}
          applyTarget={applyTarget}
          onApplied={onApplied ?? close}
        />
      </PopoverContent>
    </Popover>
  )
}

export function CalculatorDialog({
  state,
  trigger,
  open,
  onOpenChange,
  placementMenu = true,
  onRequestPlacement,
  applyTarget,
  onApplied,
}: CalculatorShellProps) {
  const { isOpen, setOpen } = useShellOpen(open, onOpenChange)
  const close = () => setOpen(false)
  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      {trigger !== undefined && (
        <DialogTrigger asChild>{trigger}</DialogTrigger>
      )}
      <DialogContent className="w-[calc(100vw-2rem)] max-w-md p-5">
        <DialogTitle className="sr-only">Calculator</DialogTitle>
        <CalculatorPanel
          state={state}
          placementMenu={placementMenu}
          onRequestPlacement={onRequestPlacement}
          applyTarget={applyTarget}
          onApplied={onApplied ?? close}
        />
      </DialogContent>
    </Dialog>
  )
}

export function CalculatorSheet({
  state,
  trigger,
  open,
  onOpenChange,
  side = 'right',
  placementMenu = true,
  onRequestPlacement,
  applyTarget,
  onApplied,
}: CalculatorShellProps & { side?: 'right' | 'bottom' }) {
  const { isOpen, setOpen } = useShellOpen(open, onOpenChange)
  const close = () => setOpen(false)
  return (
    <Sheet open={isOpen} onOpenChange={setOpen}>
      {trigger !== undefined && <SheetTrigger asChild>{trigger}</SheetTrigger>}
      <SheetContent
        side={side}
        className={cn(
          'p-5',
          side === 'right'
            ? 'w-[calc(100vw-2rem)] max-w-md'
            : 'mx-auto w-full max-w-lg sm:rounded-t-2xl',
        )}
      >
        <SheetTitle className="sr-only">Calculator</SheetTitle>
        <CalculatorPanel
          state={state}
          placementMenu={placementMenu}
          onRequestPlacement={onRequestPlacement}
          applyTarget={applyTarget}
          onApplied={onApplied ?? close}
        />
      </SheetContent>
    </Sheet>
  )
}

/** A drawer is a bottom-anchored sheet. */
export function CalculatorDrawer(props: CalculatorShellProps) {
  return <CalculatorSheet side="bottom" {...props} />
}
