import { useMemo, useState } from 'react'
import { cn } from '@/lib/utils'
import { diffDates, shiftDate, type ShiftUnit } from '@/lib/date-math'
import { format } from 'date-fns'

/** Date calculation tool: date difference and add/subtract, like Windows. */

const toInputDate = (date: Date) => format(date, 'yyyy-MM-dd')
const fromInput = (value: string): Date | null => {
  const parsed = new Date(`${value}T00:00:00`)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

export default function DateCalculator() {
  const [mode, setMode] = useState<'difference' | 'shift'>('difference')
  const today = new Date()

  // Difference mode
  const [fromText, setFromText] = useState(toInputDate(today))
  const [toText, setToText] = useState(toInputDate(today))

  // Shift mode
  const [startText, setStartText] = useState(toInputDate(today))
  const [amountText, setAmountText] = useState('1')
  const [unit, setUnit] = useState<ShiftUnit>('day')
  const [direction, setDirection] = useState<'add' | 'subtract'>('add')

  const span = useMemo(() => {
    const from = fromInput(fromText)
    const to = fromInput(toText)
    if (!from || !to) return null
    const result = diffDates(from, to)
    if (result.inverted) return { ...result, inverted: false }
    return result
  }, [fromText, toText])

  const shifted = useMemo(() => {
    const start = fromInput(startText)
    if (!start) return null
    const amount = Number(amountText)
    if (!Number.isFinite(amount)) return null
    const signed = direction === 'add' ? amount : -amount
    const result = shiftDate(start, signed, unit)
    if (Number.isNaN(result.getTime())) return null
    return {
      label: format(result, 'EEEE, dd MMM yyyy'),
      value: format(result, 'yyyy-MM-dd'),
    }
  }, [startText, amountText, unit, direction])

  const dateInputClass =
    'h-9 w-full rounded-md border border-slate-200 bg-white px-2 font-mono text-sm text-foreground outline-none transition-colors focus:border-sky-400 focus:ring-2 focus:ring-sky-500/30 dark:border-white/10 dark:bg-zinc-900 dark:focus:border-sky-500 dark:focus:ring-sky-400/25'

  return (
    <div className="flex flex-col gap-3" data-testid="date-tool">
      {/* mode selector */}
      <div className="flex items-center gap-1 rounded-lg border border-slate-200/80 p-1 dark:border-white/10">
        {(
          [
            ['difference', 'Difference'],
            ['shift', 'Add or subtract'],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            data-testid={`date-mode-${id}`}
            onClick={() => setMode(id)}
            className={cn(
              'h-7 flex-1 rounded-md px-2 text-xs font-semibold',
              mode === id
                ? 'bg-gradient-to-r from-sky-600 to-indigo-600 text-white'
                : 'text-muted-foreground hover:bg-slate-200/70 dark:hover:bg-slate-700/70',
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {mode === 'difference' ? (
        <>
          <div className="grid grid-cols-2 gap-2">
            <label className="flex flex-col gap-1">
              <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
                From
              </span>
              <input
                type="date"
                value={fromText}
                onChange={(event) => setFromText(event.target.value)}
                className={dateInputClass}
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
                To
              </span>
              <input
                type="date"
                value={toText}
                onChange={(event) => setToText(event.target.value)}
                className={dateInputClass}
              />
            </label>
          </div>

          <div className="flex flex-col gap-1.5 rounded-lg border border-slate-200/80 bg-muted/40 px-3 py-2 text-sm dark:border-white/10">
            {span ? (
              <>
                <div className="text-xl font-semibold text-foreground">
                  {span.years > 0 && (
                    <span>
                      {span.years} year{span.years === 1 ? '' : 's'},{' '}
                    </span>
                  )}
                  {span.months > 0 && (
                    <span>
                      {span.months} month{span.months === 1 ? '' : 's'},{' '}
                    </span>
                  )}
                  <span>
                    {span.days} day{span.days === 1 ? '' : 's'}
                  </span>
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-[11px] text-muted-foreground">
                  <span>
                    {span.totalDays} total day{span.totalDays === 1 ? '' : 's'}
                  </span>
                  <span>{Math.round(span.totalWeeks * 100) / 100} weeks</span>
                  <span>
                    {span.totalMonths} total month
                    {span.totalMonths === 1 ? '' : 's'}
                  </span>
                  <span>{span.totalHours.toLocaleString()} hours</span>
                  <span>{span.totalMinutes.toLocaleString()} minutes</span>
                  <span>{span.totalSeconds.toLocaleString()} seconds</span>
                </div>
              </>
            ) : (
              <span className="text-sm text-muted-foreground">
                Pick both dates to see the difference.
              </span>
            )}
          </div>
        </>
      ) : (
        <>
          <label className="flex flex-col gap-1">
            <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
              Date
            </span>
            <input
              type="date"
              value={startText}
              onChange={(event) => setStartText(event.target.value)}
              className={dateInputClass}
            />
          </label>

          <div className="flex items-end gap-2">
            <label className="flex min-w-0 flex-1 flex-col gap-1">
              <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
                Amount
              </span>
              <input
                type="number"
                value={amountText}
                onChange={(event) => setAmountText(event.target.value)}
                className={dateInputClass}
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
                Unit
              </span>
              <select
                value={unit}
                onChange={(event) => setUnit(event.target.value as ShiftUnit)}
                className={cn(dateInputClass, 'w-28')}
              >
                <option value="day">Days</option>
                <option value="week">Weeks</option>
                <option value="month">Months</option>
                <option value="year">Years</option>
              </select>
            </label>
          </div>

          <div className="flex items-center gap-1 rounded-lg border border-slate-200/80 p-1 dark:border-white/10">
            {(
              [
                ['add', 'Add'],
                ['subtract', 'Subtract'],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                data-testid={`date-direction-${id}`}
                onClick={() => setDirection(id)}
                className={cn(
                  'h-7 flex-1 rounded-md px-2 text-xs font-semibold',
                  direction === id
                    ? 'bg-gradient-to-r from-sky-600 to-indigo-600 text-white'
                    : 'text-muted-foreground hover:bg-slate-200/70 dark:hover:bg-slate-700/70',
                )}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-1 rounded-lg border border-slate-200/80 bg-muted/40 px-3 py-2 dark:border-white/10">
            {shifted ? (
              <>
                <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
                  Result
                </span>
                <span className="text-lg font-semibold text-foreground">
                  {shifted.label}
                </span>
                <span className="font-mono text-xs text-muted-foreground">
                  {shifted.value}
                </span>
              </>
            ) : (
              <span className="text-sm text-muted-foreground">
                Enter a date and amount to calculate.
              </span>
            )}
          </div>
        </>
      )}
    </div>
  )
}
