import { useEffect, useMemo, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { parseFunction } from '@/lib/graph-function'
import { cn } from '@/lib/utils'
import { Minus, Plus, RotateCcw } from 'lucide-react'

/** f(x) plotter: canvas rendering with autoscaled Y, wheel zoom and drag pan. */

const DEFAULT_DOMAIN: [number, number] = [-10, 10]
const KEY_ROWS: string[][] = [
  ['C', '⌫', '(', ')'],
  ['7', '8', '9', '÷'],
  ['4', '5', '6', '×'],
  ['1', '2', '3', '−'],
  ['0', '.', 'x', '+'],
  ['sin', 'cos', 'tan', 'ln'],
  ['sqrt', 'π', 'e', '^'],
]

/** Function keys insert with an opening parenthesis; everything else is literal. */
const FN_ALIAS: Record<string, string> = {
  sin: 'sin(',
  cos: 'cos(',
  tan: 'tan(',
  ln: 'ln(',
  sqrt: 'sqrt(',
}

const ALLOWED_TYPED = /^[0-9a-zA-Z+\-*/().^ ]$/

function formatTick(value: number): string {
  if (Math.abs(value) >= 1e5 || (Math.abs(value) < 1e-4 && value !== 0)) {
    return value.toExponential(0)
  }
  return String(Math.round(value * 1000) / 1000)
}

/** "Nice" rounded tick step so gridlines land on round numbers. */
function niceStep(span: number, targetTicks: number): number {
  const raw = span / targetTicks
  const magnitude = 10 ** Math.floor(Math.log10(raw))
  for (const candidate of [1, 2, 2.5, 5, 10]) {
    const step = candidate * magnitude
    if (step >= raw) return step
  }
  return 10 * magnitude
}

export default function GraphingCalculator() {
  const [expression, setExpression] = useState('sin(x)')
  const [domain, setDomain] = useState<[number, number]>(DEFAULT_DOMAIN)
  const [error, setError] = useState<string | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const drag = useRef<{ startX: number; startMin: number } | null>(null)

  const parsed = useMemo(() => {
    setError(null)
    try {
      return parseFunction(expression)
    } catch (err) {
      setError((err as Error).message)
      return null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expression])

  const append = (text: string) => {
    setError(null)
    setExpression((current) => current + text)
  }
  const backspace = () => {
    setError(null)
    setExpression((current) => current.slice(0, -1))
  }
  const clear = () => {
    setError(null)
    setExpression('')
  }

  const press = (label: string) => {
    if (label === 'C') {
      clear()
      return
    }
    if (label === '⌫') {
      backspace()
      return
    }
    append(FN_ALIAS[label] ?? label)
  }

  // ── plotting ─────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current
    const parent = canvas?.parentElement
    if (!canvas || !parent) return
    const width = parent.clientWidth || 320
    const height = 260
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const [xMin, xMax] = domain
    const span = xMax - xMin
    if (span <= 0) return

    // sample
    const values: Array<number | null> = []
    for (let px = 0; px < width; px++) {
      const x = xMin + (px / (width - 1)) * span
      let y: number | null = parsed ? parsed.evaluate(x) : null
      if (y !== null && (y < -1e9 || y > 1e9)) y = null
      values.push(y)
    }

    // autoscale Y
    const finite = values.filter(
      (y): y is number => y !== null && Number.isFinite(y),
    )
    let yMin = Math.min(...(finite.length ? finite : [0]))
    let yMax = Math.max(...(finite.length ? finite : [0]))
    if (yMin === yMax) {
      yMin -= 1
      yMax += 1
    }
    const pad = (yMax - yMin) * 0.08
    yMin -= pad
    yMax += pad
    const ySpan = yMax - yMin

    const mapX = (x: number) => ((x - xMin) / span) * width
    const mapY = (y: number) => height - ((y - yMin) / ySpan) * height

    ctx.clearRect(0, 0, width, height)
    ctx.fillStyle = 'transparent'

    // grid
    const stepX = niceStep(span, 8)
    const stepY = niceStep(ySpan, 6)
    ctx.strokeStyle = 'rgba(120,120,140,0.18)'
    ctx.lineWidth = 1
    ctx.font = '10px ui-monospace, monospace'
    ctx.fillStyle = 'rgba(100,100,120,0.9)'
    ctx.textAlign = 'center'
    for (let x = Math.ceil(xMin / stepX) * stepX; x <= xMax; x += stepX) {
      if (Math.abs(x) < stepX / 2) continue
      const px = Math.round(mapX(x)) + 0.5
      ctx.beginPath()
      ctx.moveTo(px, 0)
      ctx.lineTo(px, height)
      ctx.stroke()
      ctx.fillText(formatTick(x), px, height - 4)
    }
    for (let y = Math.ceil(yMin / stepY) * stepY; y <= yMax; y += stepY) {
      if (Math.abs(y) < stepY / 2) continue
      const py = Math.round(mapY(y)) + 0.5
      ctx.beginPath()
      ctx.moveTo(0, py)
      ctx.lineTo(width, py)
      ctx.stroke()
      ctx.fillText(formatTick(y), 8, py - 3)
    }

    // axes
    ctx.strokeStyle = 'rgba(100,100,130,0.65)'
    ctx.beginPath()
    if (yMin < 0 && yMax > 0) {
      const py = Math.round(mapY(0)) + 0.5
      ctx.moveTo(0, py)
      ctx.lineTo(width, py)
    }
    if (xMin < 0 && xMax > 0) {
      const px = Math.round(mapX(0)) + 0.5
      ctx.moveTo(px, 0)
      ctx.lineTo(px, height)
    }
    ctx.stroke()

    // function
    if (parsed) {
      ctx.strokeStyle = '#2563eb'
      ctx.lineWidth = 2.5
      ctx.lineJoin = 'round'
      ctx.beginPath()
      let penDown = false
      for (let px = 0; px < width; px++) {
        const y = values[px]
        if (y === null) {
          penDown = false
          continue
        }
        const py = mapY(y)
        if (py < -1000 || py > height + 1000) {
          penDown = false
          continue
        }
        if (!penDown) {
          ctx.moveTo(px, py)
          penDown = true
        } else {
          ctx.lineTo(px, py)
        }
      }
      ctx.stroke()
    }
  }, [expression, parsed, domain])

  const zoom = (factor: number) => {
    setDomain(([min, max]) => {
      const center = (min + max) / 2
      const half = ((max - min) / 2) * factor
      return [center - half, center + half]
    })
  }

  const panTo = (clientX: number, canvas: HTMLCanvasElement) => {
    if (!drag.current) return
    const rect = canvas.getBoundingClientRect()
    const [min, max] = domain
    const span = max - min
    const dx = (drag.current.startX - clientX) / (rect.width || 1)
    const shift = dx * span
    setDomain([
      drag.current.startMin + shift,
      drag.current.startMin + shift + span,
    ])
  }

  const [sampleAtZero, setSampleAtZero] = useState<string | null>(null)
  useEffect(() => {
    if (!parsed) {
      setSampleAtZero(null)
      return
    }
    const y = parsed.evaluate(0)
    setSampleAtZero(
      y === null ? 'undefined' : String(Math.round(y * 1e6) / 1e6),
    )
  }, [parsed, expression])

  return (
    <div className="flex flex-col gap-3" data-testid="graphing-tool">
      {/* expression display */}
      <div className="flex flex-col gap-1 rounded-lg border border-slate-200/80 bg-muted/40 px-3 py-2 font-mono dark:border-white/10">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
            f(x)
          </span>
          {sampleAtZero !== null && (
            <span className="text-[11px] text-muted-foreground">
              f(0) = {sampleAtZero}
            </span>
          )}
        </div>
        <div
          data-testid="graph-entry"
          tabIndex={-1}
          onKeyDown={(event) => {
            const { key, ctrlKey, metaKey, altKey } = event
            if (ctrlKey || metaKey || altKey) return
            if (key === 'Backspace' || key === 'Delete') {
              event.preventDefault()
              backspace()
              return
            }
            if (key === 'Enter') {
              event.preventDefault()
              return
            }
            if (key.length === 1 && ALLOWED_TYPED.test(key)) {
              event.preventDefault()
              append(key)
              return
            }
            if (key === 'Escape') {
              ;(event.target as HTMLElement).blur()
              return
            }
          }}
          className={cn(
            'min-h-8 cursor-text break-words text-right text-xl leading-7 text-foreground outline-none',
            !expression && 'text-muted-foreground/50',
          )}
        >
          {expression || 'f(x) = …'}
        </div>
        <div aria-live="polite" className="min-h-4 text-right text-[11px]">
          {error && <span className="text-red-500">{error}</span>}
        </div>
      </div>

      {/* canvas */}
      <div className="overflow-hidden rounded-lg border border-slate-200/80 bg-white/40 dark:border-white/10 dark:bg-slate-950/40">
        <canvas
          ref={canvasRef}
          data-testid="graph-canvas"
          className="block h-[260px] w-full touch-none"
          onWheel={(event) => {
            event.preventDefault()
            zoom(event.deltaY > 0 ? 1.2 : 1 / 1.2)
          }}
          onPointerDown={(event) => {
            const canvas = event.currentTarget
            canvas.setPointerCapture(event.pointerId)
            const [min] = domain
            drag.current = { startX: event.clientX, startMin: min }
          }}
          onPointerMove={(event) => {
            if (drag.current) panTo(event.clientX, event.currentTarget)
          }}
          onPointerUp={() => {
            drag.current = null
          }}
        />
      </div>

      {/* zoom toolbar */}
      <div className="flex items-center justify-end gap-1">
        <Button
          type="button"
          variant="outline"
          size="sm"
          title="Zoom in"
          onClick={() => zoom(1 / 1.5)}
          className="h-7 w-8 px-0"
        >
          <Plus className="h-3.5 w-3.5" />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          title="Zoom out"
          onClick={() => zoom(1.5)}
          className="h-7 w-8 px-0"
        >
          <Minus className="h-3.5 w-3.5" />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          title="Reset view"
          onClick={() => setDomain(DEFAULT_DOMAIN)}
          className="h-7 gap-1 px-2 text-xs"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Reset
        </Button>
      </div>

      {/* keypad */}
      <div className="grid grid-cols-4 gap-1.5">
        {KEY_ROWS.map((row, rowIndex) => (
          <div key={`graph-row-${rowIndex}`} className="contents">
            {row.map((label) => (
              <Button
                key={label}
                type="button"
                variant="outline"
                data-key={label}
                onClick={() => press(label)}
                className={cn(
                  'h-10 px-0 text-base font-medium',
                  label === 'C' &&
                    'text-red-500 hover:text-red-500 dark:text-red-400 dark:hover:text-red-400',
                  label === 'x' &&
                    'font-semibold text-sky-700 dark:text-sky-300',
                  (label === 'sin' ||
                    label === 'cos' ||
                    label === 'tan' ||
                    label === 'ln' ||
                    label === 'sqrt') &&
                    'text-[13px]',
                )}
              >
                {label}
              </Button>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
