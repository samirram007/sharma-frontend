import { describe, expect, it } from 'vitest'
import {
  evaluateAdvanced,
  evaluateBasic,
  formatNumber,
  solveEquation,
} from './calculator-engine'

describe('formatNumber', () => {
  it('strips float noise and trailing zeros', () => {
    expect(formatNumber(0.1 + 0.2)).toBe('0.3')
    expect(formatNumber(2)).toBe('2')
    expect(formatNumber(2.5)).toBe('2.5')
    expect(formatNumber(-0)).toBe('0')
  })

  it('falls back to exponential for extreme magnitudes', () => {
    expect(formatNumber(1e-10)).toBe('1e-10')
    expect(formatNumber(1.5e21)).toBe('1.5e21')
    expect(formatNumber(-1.5e21)).toBe('-1.5e21')
  })
})

describe('evaluateBasic', () => {
  it('follows operator precedence', () => {
    expect(evaluateBasic('2+3*4')).toBe(14)
    expect(evaluateBasic('(2+3)*4')).toBe(20)
  })

  it('accepts calculator glyphs', () => {
    expect(evaluateBasic('(2+3)×4÷2')).toBe(10)
    expect(evaluateBasic('9−4')).toBe(5)
  })

  it('handles a trailing percent', () => {
    expect(evaluateBasic('200%')).toBe(2)
    expect(evaluateBasic('200 + 50%')).toBe(200.5)
  })

  it('rejects unsafe input and empty expressions', () => {
    expect(() => evaluateBasic('2+alert(1)')).toThrow()
    expect(() => evaluateBasic('')).toThrow()
    expect(() => evaluateBasic('1/0')).toThrow()
    expect(() => evaluateBasic('2+')).toThrow()
  })
})

describe('evaluateAdvanced', () => {
  it('supports powers and constants', () => {
    expect(evaluateAdvanced('2^10')).toBe(1024)
    expect(evaluateAdvanced('2^3^2')).toBe(512)
    expect(evaluateAdvanced('pi', 'rad')).toBeCloseTo(Math.PI, 10)
  })

  it('honours the DEG/RAD angle mode', () => {
    expect(evaluateAdvanced('sin(30)', 'deg')).toBeCloseTo(0.5, 10)
    expect(evaluateAdvanced('sin(pi/2)', 'rad')).toBeCloseTo(1, 10)
    expect(evaluateAdvanced('asin(0.5)', 'deg')).toBeCloseTo(30, 10)
    expect(evaluateAdvanced('cos(0)', 'deg')).toBeCloseTo(1, 10)
  })

  it('supports a whitelisted set of functions', () => {
    expect(evaluateAdvanced('sqrt(9)')).toBe(3)
    expect(evaluateAdvanced('abs(-3) + ln(e)')).toBeCloseTo(4, 10)
    expect(evaluateAdvanced('log(100)')).toBeCloseTo(2, 10)
  })

  it('rejects unknown symbols and malformed expressions', () => {
    expect(() => evaluateAdvanced('bogus(2)')).toThrow(/Unknown function/)
    expect(() => evaluateAdvanced('(2+3')).toThrow(/Mismatched/)
    expect(() => evaluateAdvanced('sin30', 'deg')).toThrow()
    expect(() => evaluateAdvanced('1/0')).toThrow()
  })
})

describe('solveEquation', () => {
  it('solves linear equations', () => {
    expect(solveEquation('2x + 3 = 7')).toEqual({
      kind: 'linear',
      variable: 'x',
      solution: 2,
    })
    expect(solveEquation('3x - 2 = 10')).toEqual({
      kind: 'linear',
      variable: 'x',
      solution: 4,
    })
    expect(solveEquation('x/2 = 5')).toEqual({
      kind: 'linear',
      variable: 'x',
      solution: 10,
    })
    expect(solveEquation('x = 7')).toEqual({
      kind: 'linear',
      variable: 'x',
      solution: 7,
    })
  })

  it('solves quadratics with real roots', () => {
    const result = solveEquation('x^2 - 5x + 6 = 0')
    expect(result).toMatchObject({ kind: 'quadratic', variable: 'x' })
    if (result.kind === 'quadratic') {
      expect(result.solutions.map((s) => Math.round(s)).sort()).toEqual([2, 3])
    }
    const double = solveEquation('x^2 - 4x + 4 = 0')
    expect(double).toMatchObject({ kind: 'quadratic-double', variable: 'x' })
    if (double.kind === 'quadratic-double') {
      expect(double.solution).toBeCloseTo(2, 8)
    }
    expect(solveEquation('x^2 + 1 = 0')).toMatchObject({
      kind: 'none',
      variable: 'x',
    })
  })

  it('handles variables on both sides and other letters', () => {
    expect(solveEquation('2x + 3 = x + 8')).toEqual({
      kind: 'linear',
      variable: 'x',
      solution: 5,
    })
    expect(solveEquation('t - 3 = 7')).toMatchObject({ variable: 't' })
    expect(solveEquation('2y = 10')).toEqual({
      kind: 'linear',
      variable: 'y',
      solution: 5,
    })
  })

  it('supports parentheses and implicit multiplication', () => {
    expect(solveEquation('3(x + 2) = 12')).toEqual({
      kind: 'linear',
      variable: 'x',
      solution: 2,
    })
    expect(solveEquation('(x + 1)(x - 3) = 0')).toMatchObject({
      kind: 'quadratic',
      variable: 'x',
    })
  })

  it('recognises identities and contradictions', () => {
    expect(solveEquation('x = x').kind).toBe('identity')
    expect(solveEquation('2x + 1 = 2x + 3').kind).toBe('none')
    expect(solveEquation('5 = 5').kind).toBe('identity')
  })

  it('throws helpful errors for out-of-scope input', () => {
    expect(() => solveEquation('2x + 3')).toThrow(/Missing "="/)
    expect(() => solveEquation('2x + y = 3')).toThrow(/Only one variable/)
    expect(() => solveEquation('x/0 = 2')).toThrow()
    expect(() => solveEquation('x^3 = 8')).toThrow(/Only x and x²/)
  })
})
