/**
 * Pure logic for the Programmer calculator: integer arithmetic + bitwise
 * operators over BigInt, with base rendering (HEX/DEC/OCT/BIN) and word-size
 * clamping (QWORD/DWORD/WORD/BYTE). No React, no DOM.
 */

export type IntBase = 2 | 8 | 10 | 16
export type WordBits = 8 | 16 | 32 | 64

export const WORD_LABELS: Record<WordBits, string> = {
  8: 'BYTE',
  16: 'WORD',
  32: 'DWORD',
  64: 'QWORD',
}

export const BASE_LABELS: Record<IntBase, string> = {
  2: 'BIN',
  8: 'OCT',
  10: 'DEC',
  16: 'HEX',
}

const ALLOWED_DIGITS: Record<IntBase, string> = {
  2: '01',
  8: '01234567',
  10: '0123456789',
  16: '0123456789ABCDEFabcdef',
}

/** Validate that a text is made only of digits valid in `base`. */
export function isBaseDigits(text: string, base: IntBase): boolean {
  if (text.startsWith('-')) text = text.slice(1)
  return text.split('').every((ch) => ALLOWED_DIGITS[base].includes(ch))
}

/** Parse digits typed in `base` into a BigInt (leading "-" allowed). */
export function parseDigits(text: string, base: IntBase): bigint {
  const negative = text.startsWith('-')
  const body = negative ? text.slice(1) : text
  if (!body) throw new Error('Nothing entered')
  if (!isBaseDigits(body, base)) {
    throw new Error(`Invalid ${BASE_LABELS[base]} digits`)
  }
  return parseUnsigned(body, base) * (negative ? -1n : 1n)
}

function parseUnsigned(digits: string, base: IntBase): bigint {
  let value = 0n
  for (const ch of digits) {
    const digit = Number.parseInt(ch, base)
    value = value * BigInt(base) + BigInt(digit)
  }
  return value
}

const mask = (bits: WordBits): bigint => (1n << BigInt(bits)) - 1n

/** Wrap a value into the signed range of the current word size. */
export function toSignedWord(value: bigint, bits: WordBits): bigint {
  const wrapped = value & mask(bits)
  const signBit = 1n << BigInt(bits - 1)
  return wrapped >= signBit ? wrapped - (1n << BigInt(bits)) : wrapped
}

/** Wrap a value into the unsigned range of the current word size. */
export function toUnsignedWord(value: bigint, bits: WordBits): bigint {
  return value & mask(bits)
}

/**
 * Render a value in `base` honouring the word size: non-decimal bases show
 * the two's-complement (unsigned) pattern, decimal shows the signed value.
 */
export function formatInBase(
  value: bigint,
  base: IntBase,
  bits: WordBits,
): string {
  if (base === 10) return toSignedWord(value, bits).toString()
  const unsigned = toUnsignedWord(value, bits)
  return unsigned.toString(base).toUpperCase()
}

export type BinaryOp =
  '+' | '-' | '*' | '/' | '%' | '&' | '|' | '^' | '<<' | '>>'

export const BINARY_OP_LABELS: Record<BinaryOp, string> = {
  '+': '+',
  '-': '−',
  '*': '×',
  '/': '÷',
  '%': 'MOD',
  '&': 'AND',
  '|': 'OR',
  '^': 'XOR',
  '<<': 'Lsh',
  '>>': 'Rsh',
}

/** Apply a binary operator (operands already word-clamped where required). */
export function applyBinaryOp(a: bigint, b: bigint, op: BinaryOp): bigint {
  switch (op) {
    case '+':
      return a + b
    case '-':
      return a - b
    case '*':
      return a * b
    case '/':
      if (b === 0n) throw new Error('Division by zero')
      return a / b
    case '%':
      if (b === 0n) throw new Error('Division by zero')
      return a % b
    case '&':
      return a & b
    case '|':
      return a | b
    case '^':
      return a ^ b
    case '<<': {
      if (b < 0n || b > 63n) throw new Error('Shift must be 0–63')
      return a << b
    }
    case '>>': {
      if (b < 0n || b > 63n) throw new Error('Shift must be 0–63')
      return a >> b
    }
  }
}

export type UnaryOp = 'not' | 'neg'

/** Apply a unary operator on a word-sized value. */
export function applyUnaryOp(
  value: bigint,
  op: UnaryOp,
  bits: WordBits,
): bigint {
  if (op === 'not') return toSignedWord(~toUnsignedWord(value, bits), bits)
  return toSignedWord(-toSignedWord(value, bits), bits)
}

/** Digits that may be typed/appended in a base. */
export function digitSet(base: IntBase): string {
  return ALLOWED_DIGITS[base].toUpperCase()
}
