import { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { convertUnit, getConversionCategory } from '@/lib/conversions'
import { formatNumber } from '@/lib/calculator-engine'
import { cn } from '@/lib/utils'
import { ArrowLeftRight } from 'lucide-react'

/** Generic unit converter — one panel per category (converter:length etc.). */

interface ConverterCalculatorProps {
  categoryId: string
}

function toNumber(text: string): number | null {
  const cleaned = text.replace(/,/g, '').trim()
  if (!cleaned) return null
  const value = Number(cleaned)
  return Number.isFinite(value) ? value : null
}

const inputClass =
  'h-10 w-full rounded-md border border-slate-200 bg-white px-2 text-right font-mono text-lg text-foreground caret-sky-600 outline-none transition-colors focus:border-sky-400 focus:ring-2 focus:ring-sky-500/30 dark:border-white/10 dark:bg-zinc-900 dark:focus:border-sky-500 dark:focus:ring-sky-400/25'

const selectClass =
  'h-8 w-full truncate rounded-md border border-slate-200 bg-white px-1.5 text-xs text-foreground outline-none transition-colors focus:border-sky-400 focus:ring-2 focus:ring-sky-500/30 dark:border-white/10 dark:bg-zinc-900 dark:focus:border-sky-500 dark:focus:ring-sky-400/25'

export default function ConverterCalculator({
  categoryId,
}: ConverterCalculatorProps) {
  const category = getConversionCategory(categoryId)
  const [fromUnitId, setFromUnitId] = useState(category?.units[0]?.id ?? '')
  const [toUnitId, setToUnitId] = useState(category?.units[1]?.id ?? '')
  const [editing, setEditing] = useState<'from' | 'to'>('from')
  const [fromText, setFromText] = useState('1')
  const [toText, setToText] = useState('')

  const conversion = useMemo(() => {
    if (!category) return null
    const fromValue = toNumber(editing === 'from' ? fromText : toText)
    if (fromValue === null) return null
    const result = convertUnit(category.id, fromUnitId, toUnitId, fromValue)
    return { input: fromValue, result }
  }, [category, editing, fromText, toText, fromUnitId, toUnitId])

  // Mirror the *other* box when either side is edited.
  const updateFrom = (text: string) => {
    setEditing('from')
    setFromText(text)
    const value = toNumber(text)
    if (category && value !== null) {
      setToText(
        formatNumber(convertUnit(category.id, fromUnitId, toUnitId, value)),
      )
    } else {
      setToText('')
    }
  }

  const updateTo = (text: string) => {
    setEditing('to')
    setToText(text)
    const value = toNumber(text)
    if (category && value !== null) {
      setFromText(
        formatNumber(convertUnit(category.id, toUnitId, fromUnitId, value)),
      )
    } else {
      setFromText('')
    }
  }

  // Seed the converted result on first mount / category change.
  useEffect(() => {
    const value = toNumber(fromText)
    if (category && value !== null) {
      setToText(
        formatNumber(convertUnit(category.id, fromUnitId, toUnitId, value)),
      )
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryId])

  const swap = () => {
    const previousFrom = fromText
    const previousTo = toText
    setFromUnitId(toUnitId)
    setToUnitId(fromUnitId)
    setFromText(previousTo === '' ? '1' : previousTo)
    setToText(previousFrom)
    setEditing('from')
  }

  const changeFromUnit = (id: string) => {
    setFromUnitId(id)
    const value = toNumber(fromText)
    if (category && value !== null) {
      setToText(formatNumber(convertUnit(category.id, id, toUnitId, value)))
    }
  }

  const changeToUnit = (id: string) => {
    setToUnitId(id)
    const value = toNumber(fromText)
    if (category && value !== null) {
      setToText(formatNumber(convertUnit(category.id, fromUnitId, id, value)))
    }
  }

  if (!category) {
    return (
      <div className="p-2 text-sm text-muted-foreground">
        Unknown converter category.
      </div>
    )
  }

  const fromUnit = category.units.find((unit) => unit.id === fromUnitId)
  const toUnit = category.units.find((unit) => unit.id === toUnitId)
  const rate = (() => {
    if (!category || !fromUnit || !toUnit) return null
    try {
      return convertUnit(category.id, fromUnit.id, toUnit.id, 1)
    } catch {
      return null
    }
  })()

  return (
    <div className="flex flex-col gap-3" data-testid="converter-tool">
      {/* from */}
      <label className="flex flex-col gap-1.5">
        <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
          From
        </span>
        <div className="flex items-stretch gap-2">
          <input
            type="text"
            inputMode="decimal"
            value={fromText}
            onChange={(event) => updateFrom(event.target.value)}
            data-testid="converter-from-input"
            className={inputClass}
          />
          <select
            value={fromUnitId}
            onChange={(event) => changeFromUnit(event.target.value)}
            data-testid="converter-from-unit"
            className={cn(selectClass, 'w-32 shrink-0 self-stretch')}
          >
            {category.units.map((unit) => (
              <option key={unit.id} value={unit.id}>
                {unit.symbol}
              </option>
            ))}
          </select>
        </div>
      </label>

      <div className="flex items-center justify-center">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={swap}
          title="Swap units"
          className="h-8 w-8 rounded-full px-0 text-muted-foreground"
        >
          <ArrowLeftRight className="h-4 w-4" />
        </Button>
      </div>

      {/* to */}
      <label className="flex flex-col gap-1.5">
        <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
          To
        </span>
        <div className="flex items-stretch gap-2">
          <input
            type="text"
            inputMode="decimal"
            value={toText}
            onChange={(event) => updateTo(event.target.value)}
            data-testid="converter-to-input"
            className={inputClass}
          />
          <select
            value={toUnitId}
            onChange={(event) => changeToUnit(event.target.value)}
            data-testid="converter-to-unit"
            className={cn(selectClass, 'w-32 shrink-0 self-stretch')}
          >
            {category.units.map((unit) => (
              <option key={unit.id} value={unit.id}>
                {unit.symbol}
              </option>
            ))}
          </select>
        </div>
      </label>

      {/* conversion line */}
      <div
        aria-live="polite"
        data-testid="converter-result"
        className="flex min-h-9 items-center justify-end gap-1.5 rounded-lg border border-slate-200/80 bg-muted/40 px-3 py-2 font-mono text-xs dark:border-white/10"
      >
        {rate !== null && (
          <span className="mr-auto text-[11px] text-muted-foreground">
            1 {fromUnit?.symbol} = {formatNumber(rate)} {toUnit?.symbol}
          </span>
        )}
        {conversion ? (
          <span className="text-sm font-semibold text-sky-700 dark:text-sky-300">
            {formatNumber(conversion.input)} {fromUnit?.symbol} ={' '}
            {formatNumber(conversion.result)} {toUnit?.symbol}
          </span>
        ) : (
          <span className="text-muted-foreground">Enter an amount</span>
        )}
      </div>
    </div>
  )
}
