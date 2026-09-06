/**
 * Parser/evaluator for a single-variable function f(x) used by the Graphing
 * calculator. Supports + − × ÷, ^, parentheses, implicit multiplication
 * (2x, x(, )(, 2(x+1)), the constants π/e, the variable x and the same
 * Math.* function set as the scientific calculator. Evaluated in radians.
 */

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
  exp: 'Math.exp',
  floor: 'Math.floor',
  ceil: 'Math.ceil',
  round: 'Math.round',
}

type Node =
  | { kind: 'number'; value: number }
  | { kind: 'x' }
  | { kind: 'unary'; operator: '-' | '+'; operand: Node }
  | { kind: 'binary'; operator: string; left: Node; right: Node }
  | { kind: 'function'; name: string; argument: Node }

function nodeValue(node: Node, x: number): number {
  switch (node.kind) {
    case 'number':
      return node.value
    case 'x':
      return x
    case 'unary':
      return node.operator === '-'
        ? -nodeValue(node.operand, x)
        : nodeValue(node.operand, x)
    case 'binary': {
      const left = nodeValue(node.left, x)
      const right = nodeValue(node.right, x)
      switch (node.operator) {
        case '+':
          return left + right
        case '-':
          return left - right
        case '*':
          return left * right
        case '/':
          return left / right
        case '^':
          return Math.pow(left, right)
        default:
          throw new Error(`Unknown operator ${node.operator}`)
      }
    }
    case 'function':
      return (Math as unknown as Record<string, (v: number) => number>)[
        node.name
      ](nodeValue(node.argument, x))
  }
}

interface Token {
  type: 'number' | 'x' | 'name' | 'operator' | 'lparen' | 'rparen'
  value?: string
}

function tokenize(source: string): Token[] {
  const tokens: Token[] = []
  let i = 0
  while (i < source.length) {
    const ch = source[i]
    if (ch === ' ') {
      i++
      continue
    }
    if (ch === 'x') {
      tokens.push({ type: 'x' })
      i++
      continue
    }
    if ((ch >= '0' && ch <= '9') || ch === '.') {
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
      if (!Number.isFinite(value) || raw === '.') {
        throw new Error(`Invalid number "${raw}"`)
      }
      tokens.push({ type: 'number', value: raw })
      i = j
      continue
    }
    if (/[a-zA-Z_]/.test(ch)) {
      let j = i
      while (j < source.length && /[a-zA-Z0-9_]/.test(source[j])) j++
      const name = source.slice(i, j)
      if (name === 'pi') {
        tokens.push({ type: 'number', value: String(Math.PI) })
      } else if (name === 'e') {
        tokens.push({ type: 'number', value: String(Math.E) })
      } else if (FUNCTIONS[name] || name === 'x') {
        // 'x' as a longer identifier is impossible (single char), handled above
        tokens.push({ type: 'name', value: name })
      } else {
        throw new Error(`Unknown symbol "${name}"`)
      }
      i = j
      continue
    }
    if ('+-*/^()'.includes(ch)) {
      const type = ch === '(' ? 'lparen' : ch === ')' ? 'rparen' : 'operator'
      tokens.push({ type, value: ch })
      i++
      continue
    }
    throw new Error(`Unexpected character "${ch}"`)
  }
  return tokens
}

/** Convert pretty glyphs before parsing. */
function normalize(expression: string): string {
  return expression
    .replace(/[×·]/g, '*')
    .replace(/÷/g, '/')
    .replace(/−/g, '-')
    .replace(/²/g, '^2')
    .replace(/³/g, '^3')
    .replace(/π/g, 'pi')
}

class FunctionParser {
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

  private startsOperand(token: Token | undefined): boolean {
    return (
      token?.type === 'number' ||
      token?.type === 'x' ||
      token?.type === 'name' ||
      token?.type === 'lparen'
    )
  }

  /** expr := term (('+'|'-') term)* */
  private expr(): Node {
    let node = this.term()
    for (;;) {
      const token = this.peek()
      if (
        token?.type !== 'operator' ||
        (token.value !== '+' && token.value !== '-')
      ) {
        break
      }
      this.next()
      const right = this.term()
      node = { kind: 'binary', operator: token.value!, left: node, right }
    }
    return node
  }

  /** term := factor (('*'|'/'|implicit) factor)* */
  private term(): Node {
    let node = this.factor()
    for (;;) {
      const token = this.peek()
      if (
        token?.type === 'operator' &&
        (token.value === '*' || token.value === '/')
      ) {
        this.next()
        const right = this.factor()
        node = { kind: 'binary', operator: token.value!, left: node, right }
        continue
      }
      if (this.startsOperand(token)) {
        // implicit multiplication: 2x, 2(x+1), (x+1)(x-1), x(x+2)
        const right = this.factor()
        node = { kind: 'binary', operator: '*', left: node, right }
        continue
      }
      break
    }
    return node
  }

  /** factor := unary (so exponent binds tighter than a leading minus: -x^2 = -(x²)) */
  private factor(): Node {
    return this.unary()
  }

  private unary(): Node {
    const token = this.peek()
    if (
      token?.type === 'operator' &&
      (token.value === '-' || token.value === '+')
    ) {
      this.next()
      return { kind: 'unary', operator: token.value, operand: this.unary() }
    }
    return this.power()
  }

  /** power := atom ('^' unary)? — right-associative exponent */
  private power(): Node {
    const base = this.atom()
    const token = this.peek()
    if (token?.type === 'operator' && token.value === '^') {
      this.next()
      const exponent = this.unary()
      return { kind: 'binary', operator: '^', left: base, right: exponent }
    }
    return base
  }

  private atom(): Node {
    const token = this.next()
    if (!token) throw new Error('Unexpected end of expression')
    if (token.type === 'number') {
      return { kind: 'number', value: Number(token.value) }
    }
    if (token.type === 'x') return { kind: 'x' }
    if (token.type === 'name') {
      const name = token.value!
      // a bare function name must be followed by '('
      const open = this.peek()
      if (open?.type !== 'lparen') {
        throw new Error(`Expected "(" after "${name}"`)
      }
      this.next()
      const argument = this.expr()
      const closing = this.next()
      if (closing?.type !== 'rparen') throw new Error('Mismatched parentheses')
      return { kind: 'function', name, argument }
    }
    if (token.type === 'lparen') {
      const inner = this.expr()
      const closing = this.next()
      if (closing?.type !== 'rparen') throw new Error('Mismatched parentheses')
      return inner
    }
    throw new Error('Unexpected token')
  }

  parse(): Node {
    const node = this.expr()
    if (this.peek() !== undefined) {
      if (this.peek()?.type === 'rparen')
        throw new Error('Mismatched parentheses')
      throw new Error('Unexpected extra input')
    }
    return node
  }
}

/**
 * Compile an f(x) expression into an evaluator. Throws with a user-facing
 * message when the expression can't be parsed. Returns null for non-finite
 * results so callers can skip those samples when plotting.
 */
export function parseFunction(expression: string): {
  evaluate: (x: number) => number | null
} {
  const source = normalize(expression).trim()
  if (!source) throw new Error('Enter a function like sin(x) or x^2 - 2x')
  const ast = new FunctionParser(tokenize(source)).parse()
  return {
    evaluate: (x: number) => {
      try {
        const value = nodeValue(ast, x)
        return Number.isFinite(value) ? value : null
      } catch {
        return null
      }
    },
  }
}
