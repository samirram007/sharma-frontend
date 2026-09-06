/**
 * Pure calculator engine shared by the footer calculator UI. No React, no DOM
 * — everything here is unit-testable.
 *
 * Three capabilities, one per calculator mode:
 *  - `evaluateBasic`    — arithmetic with + − × ÷ ( ) and a trailing %.
 *  - `evaluateAdvanced` — the same plus ^, π, e and Math.* functions; trig
 *    honours the DEG/RAD angle mode.
 *  - `solveEquation`    — symbolic solve for one variable, linear or
 *    quadratic (real roots), with implicit multiplication (2x, 2(x+1)).
 */

export type AngleMode = 'deg' | 'rad'

/** Maps pretty calculator glyphs (and a few paste-ables) to ASCII math. */
function normalize(expression: string): string {
  return expression
    .replace(/[×·]/g, '*')
    .replace(/÷/g, '/')
    .replace(/[−]/g, '-')
    .replace(/²/g, '^2')
    .replace(/³/g, '^3')
}

/**
 * Format a result the way a calculator would: no float noise (0.1 + 0.2 →
 * "0.3"), no trailing zeros, and exponential notation for extreme values.
 */
export function formatNumber(value: number): string {
  if (!Number.isFinite(value)) return String(value)
  if (Object.is(value, -0)) return '0'
  const abs = Math.abs(value)
  if (abs >= 1e15 || abs < 1e-9) {
    // Tidy exponential, e.g. 1e-10 → "1e-10", 1.2300000000000002e+21 → "1.23e+21"
    const [mantissa, exponent] = value.toExponential(8).split('e')
    return `${formatNumber(Number(mantissa))}e${Number(exponent)}`
  }
  return Number(value.toPrecision(12)).toString()
}

/* ─────────────────────────── Basic mode ─────────────────────────── */

/** Convert a trailing "50%" into "0.5" so the rest of the expression stands. */
function percentifyTrailing(expression: string): string {
  return expression.replace(
    /(\d+(?:\.\d+)?)%\s*$/,
    (_match, number: string) => `(${Number(number) / 100})`,
  )
}

const BASIC_CHARS = /^[0-9+\-*/().% ]+$/

/** Evaluate a basic arithmetic expression (safe characters only). */
export function evaluateBasic(expression: string): number {
  const sanitized = percentifyTrailing(normalize(expression).replace(/\s/g, ''))
  if (!sanitized) throw new Error('Nothing to calculate')
  if (!BASIC_CHARS.test(sanitized)) {
    throw new Error('Expression contains unsupported characters')
  }
  let value: unknown
  try {
    value = Function(`"use strict"; return (${sanitized})`)()
  } catch {
    throw new Error('Invalid expression')
  }
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new Error('Result is not a finite number')
  }
  return value
}

/* ───────────────────────── Advanced mode ────────────────────────── */

const FUNCTIONS: Record<string, string> = {
  sin: 'Math.sin',
  cos: 'Math.cos',
  tan: 'Math.tan',
  asin: 'Math.asin',
  acos: 'Math.acos',
  atan: 'Math.atan',
  sinh: 'Math.sinh',
  cosh: 'Math.cosh',
  tanh: 'Math.tanh',
  ln: 'Math.log',
  log: 'Math.log10',
  log2: 'Math.log2',
  sqrt: 'Math.sqrt',
  cbrt: 'Math.cbrt',
  abs: 'Math.abs',
  sign: 'Math.sign',
  exp: 'Math.exp',
  floor: 'Math.floor',
  ceil: 'Math.ceil',
  round: 'Math.round',
}

/** Functions whose *argument* is an angle (degrees → radians when in DEG). */
const ANGLE_ARG = new Set(['sin', 'cos', 'tan', 'sinh', 'cosh', 'tanh'])
/** Functions whose *result* is an angle (radians → degrees when in DEG). */
const ANGLE_RESULT = new Set(['asin', 'acos', 'atan'])

const CONSTANTS: Record<string, string> = { pi: 'Math.PI', e: 'Math.E' }

/** True when `ch` can start a number ('.' allowed only when a digit follows). */
function isNumberStart(ch: string, next: string | undefined): boolean {
  return (
    (ch >= '0' && ch <= '9') ||
    (ch === '.' && next !== undefined && next >= '0' && next <= '9')
  )
}

/** End index (exclusive) of the numeric literal starting at `from`, else `from`. */
function scanNumberEnd(source: string, from: number): number {
  if (!isNumberStart(source[from], source[from + 1])) return from
  let j = from
  let seenDot = false
  while (
    j < source.length &&
    ((source[j] >= '0' && source[j] <= '9') || (source[j] === '.' && !seenDot))
  ) {
    if (source[j] === '.') seenDot = true
    j++
  }
  if (j < source.length && (source[j] === 'e' || source[j] === 'E')) {
    let k = j + 1
    if (k < source.length && (source[k] === '+' || source[k] === '-')) k++
    if (k < source.length && source[k] >= '0' && source[k] <= '9') {
      while (k < source.length && source[k] >= '0' && source[k] <= '9') k++
      j = k
    }
  }
  return j
}

/**
 * Evaluate an advanced expression: numbers, + − × ÷, parentheses, ^, π/e and
 * a whitelisted set of Math functions. Unknown identifiers throw.
 */
export function evaluateAdvanced(
  expression: string,
  angle: AngleMode = 'deg',
): number {
  const source = percentifyTrailing(
    normalize(expression).replace(/\s/g, '').replace(/π/g, 'pi'),
  )
  if (!source) throw new Error('Nothing to calculate')

  const out: string[] = []
  // One entry per emitted '(': 0 plain, 1 convert the matching group's
  // argument from degrees, 2 convert the group's result back to degrees.
  const parenFlags: number[] = []
  let pendingAngle = 0
  let canUnary = true

  const pushParen = (flag: number) => {
    out.push('(')
    parenFlags.push(flag)
    pendingAngle = 0
    canUnary = true
  }

  let i = 0
  while (i < source.length) {
    const ch = source[i]

    if (ch === ' ') {
      i++
      continue
    }

    // Numbers — including leading-dot (.5) and trailing-dot (5.) forms.
    if (isNumberStart(ch, source[i + 1])) {
      let j = i
      let seenDot = false
      while (
        j < source.length &&
        ((source[j] >= '0' && source[j] <= '9') ||
          (source[j] === '.' && !seenDot))
      ) {
        if (source[j] === '.') seenDot = true
        j++
      }
      // Optional scientific exponent part (2e3, 1.5e-4).
      if (j < source.length && (source[j] === 'e' || source[j] === 'E')) {
        let k = j + 1
        if (k < source.length && (source[k] === '+' || source[k] === '-')) k++
        if (k < source.length && source[k] >= '0' && source[k] <= '9') {
          while (k < source.length && source[k] >= '0' && source[k] <= '9') k++
          j = k
        }
      }
      if (j === i || (source[i] === '.' && j === i + 1 && !seenDot)) {
        throw new Error('Invalid number')
      }
      out.push(source.slice(i, j))
      i = j
      canUnary = false
      continue
    }

    if (/[a-zA-Z_]/.test(ch)) {
      let j = i
      while (j < source.length && /[a-zA-Z0-9_]/.test(source[j])) j++
      const name = source.slice(i, j)
      i = j
      const constant = CONSTANTS[name]
      if (constant) {
        out.push(`(${constant})`)
        canUnary = false
        continue
      }
      const fn = FUNCTIONS[name]
      if (!fn) throw new Error(`Unknown function or symbol "${name}"`)
      if (source[i] !== '(') throw new Error(`Expected "(" after "${name}"`)
      out.push(fn)
      pendingAngle =
        angle === 'deg'
          ? ANGLE_ARG.has(name)
            ? 1
            : ANGLE_RESULT.has(name)
              ? 2
              : 0
          : 0
      canUnary = false // a function produces a value once applied
      continue
    }

    if (ch === '(') {
      pushParen(pendingAngle)
      i++
      continue
    }

    if (ch === ')') {
      const flag = parenFlags.pop()
      if (flag === undefined) throw new Error('Mismatched parentheses')
      if (flag === 1) {
        // Argument is an angle: sin(30) → Math.sin(30*Math.PI/180)
        out.push('*Math.PI/180')
        out.push(')')
      } else if (flag === 2) {
        // Result is an angle: asin(0.5) → Math.asin(0.5)*(180/Math.PI)
        out.push(')')
        out.push('*(180/Math.PI)')
      } else {
        out.push(')')
      }
      i++
      canUnary = false
      continue
    }

    if (ch === '^') {
      out.push('**')
      i++
      canUnary = true
      continue
    }

    if (ch === '+' || ch === '-') {
      if (ch === '-' && canUnary) {
        // A plain '-' is valid almost everywhere — the one case JS rejects is
        // a unary minus directly left of '^' ("-2**2" is a SyntaxError), so
        // parenthesize the numeric operand there ("(-2)**2").
        const operandEnd = scanNumberEnd(source, i + 1)
        if (operandEnd > i + 1 && source[operandEnd] === '^') {
          out.push(`(${source.slice(i + 1, operandEnd)})`)
          i = operandEnd
        } else {
          out.push('-')
          i++
        }
        canUnary = false
      } else {
        out.push(ch)
        i++
        canUnary = true
      }
      continue
    }

    if (ch === '*' || ch === '/') {
      out.push(ch)
      i++
      canUnary = true
      continue
    }

    throw new Error(`Unexpected character "${ch}"`)
  }

  if (parenFlags.length > 0) throw new Error('Mismatched parentheses')

  const js = out.join('')
  if (!js) throw new Error('Nothing to calculate')
  let value: unknown
  try {
    value = Function(`"use strict"; return (${js})`)()
  } catch {
    throw new Error('Invalid expression')
  }
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new Error('Result is not a finite number')
  }
  return value
}

/* ─────────────────────── Equation solver ────────────────────────── */

/**
 * A polynomial in the equation's variable kept as [x², x¹, x⁰]. Coefficients
 * beyond degree two are rejected, so only linear and quadratic equations are
 * supported.
 */
type Poly = [number, number, number]

const EPS = 1e-10

const polyConst = (value: number): Poly => [0, 0, value]
const VARIABLE: Poly = [0, 1, 0]
const polyDegree = (p: Poly): number =>
  Math.abs(p[0]) > EPS ? 2 : Math.abs(p[1]) > EPS ? 1 : 0

function polyAdd(a: Poly, b: Poly): Poly {
  return [a[0] + b[0], a[1] + b[1], a[2] + b[2]]
}

function polyNeg(a: Poly): Poly {
  return [-a[0], -a[1], -a[2]]
}

function polyMul(a: Poly, b: Poly): Poly {
  if (polyDegree(a) + polyDegree(b) > 2) {
    throw new Error('Only x and x² are supported in equations')
  }
  // Truncated polynomial product (terms beyond x² are rejected above).
  return [
    a[2] * b[0] + a[1] * b[1] + a[0] * b[2],
    a[1] * b[2] + a[2] * b[1],
    a[2] * b[2],
  ]
}

function polyDiv(a: Poly, b: Poly): Poly {
  if (polyDegree(b) > 0) {
    throw new Error("Can't divide by an expression that contains the variable")
  }
  if (Math.abs(b[2]) < EPS) throw new Error('Division by zero')
  const scale = 1 / b[2]
  return [a[0] * scale, a[1] * scale, a[2] * scale]
}

function polyPow(base: Poly, exponent: number): Poly {
  if (!Number.isInteger(exponent)) {
    throw new Error('Exponent must be a whole number')
  }
  if (exponent < 0) {
    throw new Error('Negative exponents are not supported')
  }
  if (polyDegree(base) === 0) {
    return polyConst(Math.pow(base[2], exponent))
  }
  if (exponent > 2) {
    throw new Error('Only x and x² are supported in equations')
  }
  let result: Poly = polyConst(1)
  for (let step = 0; step < exponent; step++) {
    result = polyMul(result, base)
  }
  return result
}

type Token =
  | { type: 'number'; value: number }
  | { type: 'variable'; value: string }
  | { type: 'operator'; value: '+' | '-' | '*' | '/' }
  | { type: 'power' }
  | { type: 'lparen' }
  | { type: 'rparen' }

function tokenizeEquation(source: string): {
  tokens: Token[]
  variables: Set<string>
} {
  const tokens: Token[] = []
  const variables = new Set<string>()
  let i = 0
  while (i < source.length) {
    const ch = source[i]
    if (ch === ' ') {
      i++
      continue
    }
    if (ch >= '0' && ch <= '9') {
      let j = i
      let seenDot = false
      while (
        j < source.length &&
        ((source[j] >= '0' && source[j] <= '9') ||
          (source[j] === '.' && !seenDot))
      ) {
        if (source[j] === '.') seenDot = true
        j++
      }
      const raw = source.slice(i, j)
      const value = Number(raw)
      if (!Number.isFinite(value)) throw new Error(`Invalid number "${raw}"`)
      tokens.push({ type: 'number', value })
      i = j
      continue
    }
    if (/[a-zA-Z]/.test(ch)) {
      if (source[i + 1] !== undefined && /[a-zA-Z0-9]/.test(source[i + 1])) {
        throw new Error(
          `Only single-letter variables are supported (found "${ch}${source[i + 1]}")`,
        )
      }
      variables.add(ch)
      tokens.push({ type: 'variable', value: ch })
      i++
      continue
    }
    if (ch === '^') {
      tokens.push({ type: 'power' })
      i++
      continue
    }
    if (ch === '(') {
      tokens.push({ type: 'lparen' })
      i++
      continue
    }
    if (ch === ')') {
      tokens.push({ type: 'rparen' })
      i++
      continue
    }
    if (ch === '+' || ch === '-' || ch === '*' || ch === '/') {
      tokens.push({ type: 'operator', value: ch })
      i++
      continue
    }
    throw new Error(`Unexpected character "${ch}"`)
  }
  return { tokens, variables }
}

/** Recursive-descent parser turning one side of the equation into a Poly. */
class EquationParser {
  private readonly tokens: Token[]
  private pos = 0

  constructor(tokens: Token[]) {
    this.tokens = tokens
  }

  private peek(): Token | undefined {
    return this.tokens[this.pos]
  }

  private next(): Token | undefined {
    return this.tokens[this.pos++]
  }

  private startsFactor(token: Token | undefined): boolean {
    return (
      token?.type === 'number' ||
      token?.type === 'variable' ||
      token?.type === 'lparen'
    )
  }

  /** expr := ['+'|'-'] term (('+'|'-') term)* */
  private expr(): Poly {
    let sign = 1
    let token = this.peek()
    if (
      token?.type === 'operator' &&
      (token.value === '+' || token.value === '-')
    ) {
      const signToken = this.next()
      if (
        signToken !== undefined &&
        signToken.type === 'operator' &&
        signToken.value === '-'
      ) {
        sign = -1
      }
      token = this.peek()
    }
    if (token === undefined || token.type === 'rparen') {
      throw new Error('Unexpected end of expression')
    }
    let value = sign === -1 ? polyNeg(this.term()) : this.term()
    for (;;) {
      token = this.peek()
      if (
        token?.type !== 'operator' ||
        (token.value !== '+' && token.value !== '-')
      ) {
        break
      }
      this.next()
      const rhs = this.term()
      value =
        token.value === '+' ? polyAdd(value, rhs) : polyAdd(value, polyNeg(rhs))
    }
    return value
  }

  /** term := factor (('*'|'/') factor | implicit-factor)* */
  private term(): Poly {
    let value = this.factor()
    for (;;) {
      const token = this.peek()
      if (
        token?.type === 'operator' &&
        (token.value === '*' || token.value === '/')
      ) {
        this.next()
        const rhs = this.factor()
        value = token.value === '*' ? polyMul(value, rhs) : polyDiv(value, rhs)
        continue
      }
      // Implicit multiplication: 2x, 2(x+1), (x+1)(x-1)
      if (this.startsFactor(token)) {
        value = polyMul(value, this.factor())
        continue
      }
      break
    }
    return value
  }

  /** factor := atom ('^' number)? */
  private factor(): Poly {
    const value = this.atom()
    const token = this.peek()
    if (token?.type === 'power') {
      this.next()
      const exponent = this.next()
      if (
        exponent === undefined ||
        exponent.type !== 'number' ||
        !Number.isInteger(exponent.value)
      ) {
        throw new Error('Exponent must be a whole number')
      }
      return polyPow(value, exponent.value)
    }
    return value
  }

  private atom(): Poly {
    const token = this.next()
    if (!token) throw new Error('Unexpected end of expression')
    if (token.type === 'number') return polyConst(token.value)
    if (token.type === 'variable') return VARIABLE
    if (token.type === 'lparen') {
      const inner = this.expr()
      const closing = this.next()
      if (closing?.type !== 'rparen') {
        throw new Error('Mismatched parentheses')
      }
      return inner
    }
    throw new Error('Unexpected operator')
  }

  parse(): Poly {
    const value = this.expr()
    const leftover = this.peek()
    if (leftover !== undefined) {
      if (leftover.type === 'rparen') throw new Error('Mismatched parentheses')
      const text =
        leftover.type === 'operator' || leftover.type === 'variable'
          ? leftover.value
          : leftover.type
      throw new Error(`Unexpected "${text}"`)
    }
    return value
  }
}

export type SolveResult =
  | { kind: 'linear'; variable: string; solution: number }
  | { kind: 'quadratic'; variable: string; solutions: [number, number] }
  | { kind: 'quadratic-double'; variable: string; solution: number }
  | { kind: 'identity'; variable: string }
  | { kind: 'none'; variable: string }

function realRoots(a: number, b: number, c: number): SolveResult | null {
  const discriminant = b * b - 4 * a * c
  if (discriminant < -EPS) return null
  if (Math.abs(discriminant) <= EPS) {
    return { kind: 'quadratic-double', variable: '', solution: -b / (2 * a) }
  }
  const root = Math.sqrt(discriminant)
  return {
    kind: 'quadratic',
    variable: '',
    solutions: [(-b + root) / (2 * a), (-b - root) / (2 * a)],
  }
}

/**
 * Solve an equation in a single variable (e.g. "2x + 3 = 7" → x = 2, or
 * "x^2 - 5x + 6 = 0" → x ∈ {2, 3}). Throws `Error` with a user-facing
 * message when the equation can't be parsed or is out of scope.
 */
export function solveEquation(rawEquation: string): SolveResult {
  const source = normalize(rawEquation).trim()
  if (!source) throw new Error('Enter an equation to solve')
  if (!source.includes('=')) {
    throw new Error('Missing "=" — try something like 2x + 3 = 7')
  }
  const sides = source.split('=')
  if (sides.length > 2) throw new Error('Only one "=" is allowed')

  // Tokenize and parse each side separately — '=' is a top-level separator,
  // never part of an expression.
  const parsedSides = sides.map((side) => {
    const { tokens, variables } = tokenizeEquation(side)
    if (tokens.length === 0) {
      throw new Error('Both sides of "=" need an expression')
    }
    return { poly: new EquationParser(tokens).parse(), variables }
  })

  const variables = new Set<string>()
  for (const side of parsedSides) {
    for (const name of side.variables) variables.add(name)
  }
  if (variables.size > 1) {
    throw new Error(
      `Only one variable is supported (found ${Array.from(variables)
        .map((v) => `"${v}"`)
        .join(' and ')})`,
    )
  }
  const variable = variables.size === 1 ? Array.from(variables)[0] : 'x'

  const lhs = parsedSides[0].poly
  const rhs = parsedSides[1].poly
  const difference: Poly = polyAdd(lhs, polyNeg(rhs))

  const degree = polyDegree(difference)
  if (degree === 2) {
    const result = realRoots(difference[0], difference[1], difference[2])
    if (result === null) {
      return { kind: 'none', variable }
    }
    return { ...result, variable }
  }
  if (degree === 1) {
    return {
      kind: 'linear',
      variable,
      solution: -difference[2] / difference[1],
    }
  }
  return Math.abs(difference[2]) <= EPS
    ? { kind: 'identity', variable }
    : { kind: 'none', variable }
}
