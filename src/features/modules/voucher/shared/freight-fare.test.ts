import { describe, expect, it } from 'vitest'
import { computeFare, computeNetAdjustment, type FareInputs } from './freight-fare'
import { buildChargeRows } from './fare-breakdown'

describe('computeFare — Freight Calculator fare math', () => {
    it('computes the base fare as rate × weight', () => {
        const result = computeFare({ rate: 400, weight: 15 })
        expect(result.baseFare).toBe(6000)
        expect(result.totalFare).toBe(6000)
    })

    it('returns a zero base fare when rate or weight is missing or zero', () => {
        expect(computeFare({ rate: 400 }).baseFare).toBe(0)
        expect(computeFare({ weight: 15 }).baseFare).toBe(0)
        expect(computeFare({ rate: 0, weight: 15 }).baseFare).toBe(0)
        expect(computeFare({}).totalFare).toBe(0)
    })

    it('sums all additional charges into the total', () => {
        const result = computeFare({
            rate: 100,
            weight: 10,
            loadingCharges: 50,
            unloadingCharges: 30,
            packingCharges: 20,
            insuranceCharges: 10,
            otherCharges: 5,
        })
        expect(result.totalFare).toBe(1000 + 50 + 30 + 20 + 10 + 5)
    })

    it('subtracts discount from base fare + additional charges', () => {
        const result = computeFare({
            rate: 100,
            weight: 10,
            loadingCharges: 100,
            discount: 150,
        })
        expect(result.totalFare).toBe(1000 + 100 - 150)
    })

    it('floors the total at 0 when the discount exceeds the fare', () => {
        const result = computeFare({ rate: 100, weight: 10, discount: 5000 })
        expect(result.totalFare).toBe(0)
    })

    it('rounds the total to 2 decimal places', () => {
        // 33.333 × 3 = 99.999 → 100.00
        expect(computeFare({ rate: 33.333, weight: 3 }).totalFare).toBe(100)
        // Floating-point noise: 0.1 + 0.2 = 0.30000000000000004 → 0.3
        expect(
            computeFare({ rate: 0.1, weight: 1, loadingCharges: 0.2 })
                .totalFare,
        ).toBe(0.3)
    })

    it('coerces string inputs and treats null/undefined as zero', () => {
        const result = computeFare({
            rate: '100',
            weight: '10',
            loadingCharges: '50',
            discount: null,
            otherCharges: undefined,
        })
        expect(result.totalFare).toBe(1050)
    })
})

describe('computeNetAdjustment — FareBreakdown Net Adjustment math', () => {
    it('computes additional charges − discount', () => {
        const result = computeNetAdjustment({
            loadingCharges: 100,
            unloadingCharges: 50,
            packingCharges: 25,
            insuranceCharges: 10,
            otherCharges: 5,
            discount: 80,
        })
        expect(result).toBe(100 + 50 + 25 + 10 + 5 - 80)
    })

    it('ignores the base freight charges (like FareBreakdown subtracting the base row)', () => {
        const withBase = computeNetAdjustment({
            freightCharges: 9999,
            loadingCharges: 100,
            discount: 40,
        })
        const withoutBase = computeNetAdjustment({
            loadingCharges: 100,
            discount: 40,
        })
        expect(withBase).toBe(withoutBase)
        expect(withBase).toBe(100 - 40)
    })

    it('returns a negative value when discount exceeds additional charges', () => {
        expect(
            computeNetAdjustment({ loadingCharges: 100, discount: 300 }),
        ).toBe(-200)
    })

    it('returns zero when there are no charges and no discount', () => {
        expect(computeNetAdjustment({})).toBe(0)
        expect(computeNetAdjustment(undefined)).toBe(0)
        expect(computeNetAdjustment(null)).toBe(0)
    })

    it('matches totalFare − baseFare when the fare is not floored', () => {
        const input = {
            rate: 100,
            weight: 10,
            loadingCharges: 50,
            discount: 30,
        }
        const { baseFare, totalFare } = computeFare(input)
        expect(computeNetAdjustment(input)).toBe(totalFare - baseFare)
    })

    it('coerces string inputs', () => {
        expect(
            computeNetAdjustment({ loadingCharges: '50', discount: '10' }),
        ).toBe(40)
    })
})

describe('computeFare matches the printed FareBreakdown', () => {
    it('equals sum(printed rows) − discount for the same dispatch detail', () => {
        // A dispatch detail as the Freight Calculator would save it:
        // freightCharges = rate × weight, plus the additional charges.
        const dispatchDetail: FareInputs = {
            rate: 100,
            weight: 10,
            freightCharges: 1000,
            loadingCharges: 50,
            unloadingCharges: 30,
            packingCharges: 20,
            insuranceCharges: 10,
            otherCharges: 5,
            discount: 80,
        }

        const { rows, discount } = buildChargeRows(dispatchDetail)
        const rowsTotal = rows.reduce((sum, row) => sum + row.value, 0)

        // The print shows every row plus "Less: Discount", so the implied
        // total is rowsTotal − discount — which computeFare must reproduce.
        expect(computeFare(dispatchDetail).totalFare).toBe(
            rowsTotal - discount,
        )
    })

    it('stays consistent when some charges are zero (they are not printed)', () => {
        const dispatchDetail: FareInputs = {
            rate: 40,
            weight: 5,
            freightCharges: 200,
            loadingCharges: 0,
            insuranceCharges: 25,
            discount: 10,
        }

        const { rows, discount } = buildChargeRows(dispatchDetail)
        // Zero-value charges are filtered out of the print rows.
        expect(rows.some((row) => row.label === 'Loading Charges')).toBe(false)

        const rowsTotal = rows.reduce((sum, row) => sum + row.value, 0)
        expect(computeFare(dispatchDetail).totalFare).toBe(
            rowsTotal - discount,
        )
    })

    it('agrees with the print breakdown net adjustment figure', () => {
        const dispatchDetail: FareInputs = {
            loadingCharges: 100,
            packingCharges: 20,
            discount: 30,
        }

        const { rows, freightCharges, discount } =
            buildChargeRows(dispatchDetail)
        const rowsTotal = rows.reduce((sum, row) => sum + row.value, 0)

        // Print net adjustment = sum(rows) − base freight row − discount.
        expect(computeNetAdjustment(dispatchDetail)).toBe(
            rowsTotal - freightCharges - discount,
        )
    })
})
