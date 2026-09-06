import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  BASE_LABELS,
  WORD_LABELS,
  applyBinaryOp,
  applyUnaryOp,
  digitSet,
  formatInBase,
  isBaseDigits,
  parseDigits,
  toSignedWord,
  type BinaryOp,
  type IntBase,
  type UnaryOp,
  type WordBits,
} from '@/lib/programmer'

/** Programmer calculator: integer + bitwise math in HEX/DEC/OCT/BIN. */

type Token =
  | { type: 'number'; value: bigint }
  | { type: 'op'; value: string }
  | { type: 'paren'; value: '(' | ')' }

/** Precedence of binary ops (low to high). */
const OP_PRECEDENCE: string[][] = [
  ['|'],
  ['^'],
  ['&'],
  ['<<', '>>'],
  ['+', '-'],
  ['*', '/', '%'],
]

function lex(expression: string, base: IntBase): Token[] {
  const tokens: Token[] = []
  let i = 0
  while (i < expression.length) {
    const ch = expression[i]
    if (ch === ' ') {
      i++
      continue
    }
    if (digitSet(base).includes(ch)) {
      let j = i
      while (j < expression.length && digitSet(base).includes(expression[j]))
        j++
      tokens.push({
        type: 'number',
        value: parseDigits(expression.slice(i, j), base),
      })
      i = j
      continue
    }
    if (ch === '(' || ch === ')') {
      tokens.push({ type: 'paren', value: ch })
      i++
      continue
    }
    const two = expression.slice(i, i + 2)
    if (two === '<<' || two === '>>') {
      tokens.push({ type: 'op', value: two })
      i += 2
      continue
    }
    if ('+-*/%&|^~'.includes(ch)) {
      tokens.push({ type: 'op', value: ch })
      i++
      continue
    }
    throw new Error(`Unexpected character "${ch}"`)
  }
  return tokens
}

/** Evaluate a token stream to a word-clamped BigInt. */
function evaluateTokens(tokens: Token[], bits: WordBits): bigint {
  let pos = 0

  const peek = () => tokens[pos]
  const next = () => tokens[pos++]
  const expectParen = (value: string) => {
    const token = next()
    if (token?.type !== 'paren' || token.value !== value) {
      throw new Error('Mismatched parentheses')
    }
  }

  const clamp = (value: bigint) => toSignedWord(value, bits)

  const parseNumber = (): bigint => {
    const token = next()
    if (!token) throw new Error('Incomplete expression')
    if (token.type === 'number') return clamp(token.value)
    if (token.type === 'paren' && token.value === '(') {
      const inner = parseOr()
      expectParen(')')
      return inner
    }
    if (token.type === 'paren') throw new Error('Mismatched parentheses')
    throw new Error(`Unexpected "${token.value}"`)
  }

  const parseUnary = (): bigint => {
    const token = peek()
    if (token?.type === 'op' && (token.value === '-' || token.value === '~')) {
      next()
      const operand = parseUnary()
      return token.value === '-'
        ? clamp(-operand)
        : clamp(applyUnaryOp(operand, 'not', bits))
    }
    return parseNumber()
  }

  const parseLevel = (level: number): bigint => {
    if (level >= OP_PRECEDENCE.length) return parseUnary()
    const ops = OP_PRECEDENCE[level]
    let value = parseLevel(level + 1)
    for (;;) {
      const token = peek()
      if (token?.type !== 'op' || !ops.includes(token.value)) break
      next()
      const rhs = parseLevel(level + 1)
      value = clamp(applyBinaryOp(value, rhs, token.value as BinaryOp))
    }
    return value
  }

  const parseOr = () => parseLevel(0)

  const result = parseOr()
  const rest = peek()
  if (rest !== undefined) {
    throw new Error('Unexpected extra input')
  }
  return result
}

export default function ProgrammerCalculator() {
  const [base, setBase] = useState<IntBase>(10)
  const [word, setWord] = useState<WordBits>(64)
  const [expression, setExpression] = useState('')
  const [lastResult, setLastResult] = useState<bigint | null>(null)
  const [error, setError] = useState<string | null>(null)

  const digits = useMemo(() => digitSet(base).split(''), [base])
  const [fresh, setFresh] = useState(false)

  // Live value for the secondary base readouts.
  const liveValue = useMemo(() => {
    if (expression) {
      try {
        return toSignedWord(evaluateTokens(lex(expression, base), word), word)
      } catch {
        return lastResult
      }
    }
    return lastResult
  }, [expression, base, word, lastResult])

  const append = (text: string) => {
    setError(null)
    setFresh(false)
    setExpression((current) => current + text)
  }

  const digitPress = (digit: string) => {
    setError(null)
    // Right after equals/result, typing a digit starts a brand-new number.
    if (fresh) {
      setFresh(false)
      setExpression(digit)
      return
    }
    setExpression((current) => current + digit)
  }

  const clearAll = () => {
    setError(null)
    setExpression('')
    setLastResult(null)
    setFresh(false)
  }

  const backspace = () => {
    setError(null)
    setFresh(false)
    setExpression((current) => current.slice(0, -1))
  }

  const unaryPress = (op: UnaryOp) => {
    setError(null)
    setFresh(false)
    if (!expression) {
      if (lastResult !== null) {
        setLastResult(applyUnaryOp(lastResult, op, word))
      }
      return
    }
    try {
      const value = toSignedWord(
        evaluateTokens(lex(expression, base), word),
        word,
      )
      const result = applyUnaryOp(value, op, word)
      setExpression(formatInBase(result, base, word))
      setLastResult(result)
    } catch (err) {
      setError((err as Error).message)
    }
  }

  const equals = () => {
    setError(null)
    try {
      const value = evaluateTokens(lex(expression || '0', base), word)
      const result = toSignedWord(value, word)
      setLastResult(result)
      setExpression(formatInBase(result, base, word))
      setFresh(true)
    } catch (err) {
      setError((err as Error).message)
    }
  }

  const switchBase = (nextBase: IntBase) => {
    // Re-render a pure current value into the new base; keep expressions as-is.
    const text = expression.trim()
    if (text && !/[+\-*/%&|^~()]/.test(text) && isBaseDigits(text, base)) {
      const value = toSignedWord(parseDigits(text, base), word)
      setExpression(formatInBase(value, nextBase, word))
    } else if (!text && lastResult !== null) {
      setExpression(formatInBase(lastResult, nextBase, word))
    }
    setBase(nextBase)
    setError(null)
  }

  const switchWord = (nextWord: WordBits) => {
    setWord(nextWord)
    setError(null)
    if (lastResult !== null) {
      const clamped = toSignedWord(lastResult, nextWord)
      setLastResult(clamped)
      setExpression(formatInBase(clamped, base, nextWord))
    }
  }

  const readoutValue = liveValue ?? 0n

  const keypadKeys: Array<{
    label: string
    action: () => void
    wide?: boolean
  }> = [
    { label: 'C', action: clearAll },
    { label: '⌫', action: backspace },
    { label: '(', action: () => append('(') },
    { label: ')', action: () => append(')') },
    ...digits.map((digit) => ({
      label: digit,
      action: () => digitPress(digit),
    })),
    { label: '+', action: () => append('+') },
    { label: '−', action: () => append('-') },
    { label: '×', action: () => append('*') },
    { label: '÷', action: () => append('/') },
    { label: 'MOD', action: () => append('%') },
    { label: 'AND', action: () => append('&') },
    { label: 'OR', action: () => append('|') },
    { label: 'XOR', action: () => append('^') },
    { label: 'Lsh', action: () => append('<<') },
    { label: 'Rsh', action: () => append('>>') },
    { label: 'NOT', action: () => unaryPress('not') },
  ]

  return (
    <div className="flex flex-col gap-3" data-testid="programmer-tool">
      {/* base + word chips */}
      <div className="flex flex-wrap items-center gap-1.5">
        <div className="flex items-center gap-0.5 rounded-lg border border-slate-200/80 p-0.5 dark:border-white/10">
          {([16, 10, 8, 2] as IntBase[]).map((candidate) => (
            <button
              key={candidate}
              type="button"
              data-testid={`calc-base-${candidate}`}
              onClick={() => switchBase(candidate)}
              className={cn(
                'h-6 rounded-md px-2 font-mono text-[10px] font-semibold',
                base === candidate
                  ? 'bg-gradient-to-r from-sky-600 to-indigo-600 text-white'
                  : 'text-muted-foreground hover:bg-slate-200/70 dark:hover:bg-slate-700/70',
              )}
            >
              {BASE_LABELS[candidate]}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-0.5 rounded-lg border border-slate-200/80 p-0.5 dark:border-white/10">
          {([64, 32, 16, 8] as WordBits[]).map((candidate) => (
            <button
              key={candidate}
              type="button"
              data-testid={`calc-word-${candidate}`}
              onClick={() => switchWord(candidate)}
              className={cn(
                'h-6 rounded-md px-2 font-mono text-[10px] font-semibold',
                word === candidate
                  ? 'bg-gradient-to-r from-sky-600 to-indigo-600 text-white'
                  : 'text-muted-foreground hover:bg-slate-200/70 dark:hover:bg-slate-700/70',
              )}
            >
              {WORD_LABELS[candidate]}
            </button>
          ))}
        </div>
      </div>

      {/* main readout */}
      <div className="flex flex-col gap-1 rounded-lg border border-slate-200/80 bg-muted/40 px-3 py-2 font-mono dark:border-white/10">
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
            {BASE_LABELS[base]}
          </span>
          <span className="text-[10px] text-muted-foreground">{word} bit</span>
        </div>
        <div
          data-testid="programmer-entry"
          className="min-h-9 break-words text-right text-2xl leading-9 text-foreground"
        >
          {expression || formatInBase(liveValue ?? 0n, base, word)}
        </div>
        <div aria-live="polite" className="min-h-4 text-right text-[11px]">
          {error && <span className="text-red-500">{error}</span>}
        </div>
      </div>

      {/* secondary bases */}
      <div className="grid grid-cols-4 gap-1 rounded-lg border border-slate-200/80 bg-muted/20 p-1.5 font-mono text-[10px] dark:border-white/10">
        {(
          [
            ['HEX', 16],
            ['DEC', 10],
            ['OCT', 8],
            ['BIN', 2],
          ] as const
        ).map(([label, valueBase]) => (
          <div key={label} className="flex min-w-0 flex-col gap-0.5 px-1">
            <span className="text-muted-foreground">{label}</span>
            <span className="truncate text-right text-xs font-semibold text-foreground">
              {formatInBase(readoutValue, valueBase, word)}
            </span>
          </div>
        ))}
      </div>

      {/* keypad */}
      <div className="grid grid-cols-4 gap-1.5">
        {keypadKeys.map((key) => (
          <Button
            key={key.label}
            type="button"
            variant="outline"
            onClick={key.action}
            data-key={key.label}
            className={cn(
              'h-10 px-0 text-sm font-medium',
              key.label === 'C' &&
                'text-red-500 hover:text-red-500 dark:text-red-400 dark:hover:text-red-400',
              key.label.length > 2 && 'text-[11px] font-semibold',
              (key.label === 'NOT' ||
                key.label === 'AND' ||
                key.label === 'OR' ||
                key.label === 'XOR' ||
                key.label === 'Lsh' ||
                key.label === 'Rsh' ||
                key.label === 'MOD') &&
                'text-[11px] text-sky-700 dark:text-sky-300',
            )}
          >
            {key.label}
          </Button>
        ))}
        <Button
          type="button"
          data-testid="calc-programmer-equals"
          onClick={equals}
          className="col-span-4 h-10 border-0 bg-gradient-to-r from-sky-600 to-indigo-600 px-0 text-base font-semibold !text-white hover:!text-white hover:from-sky-500 hover:to-indigo-500"
        >
          =
        </Button>
      </div>
    </div>
  )
}
