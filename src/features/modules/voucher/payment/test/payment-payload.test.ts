import { describe, expect, it } from 'vitest'
import paymentDefaultValues from '../data/data'
import {
    buildPaymentVoucherEntries,
    calculateTotalDebit,
} from '../pos/payment-payload'

describe('payment defaults', () => {
    it('starts with exactly one voucher entry row', () => {
        expect(paymentDefaultValues.voucherEntries).toHaveLength(1)
        expect(paymentDefaultValues.voucherEntries[0].entryOrder).toBe(1)
    })
})

describe('payment payload mapping', () => {
    it('builds header credit first and debit lines after it', () => {
        const entries = [
            { accountLedgerId: 301, debit: 900, remarks: 'line 1' },
            { accountLedgerId: 0, debit: 700, remarks: 'invalid row' },
            { accountLedgerId: 302, debit: 100, remarks: 'line 2' },
        ]

        const totalDebit = calculateTotalDebit(entries)

        const mapped = buildPaymentVoucherEntries({
            entries,
            selectedCreditLedger: {
                id: 101,
                name: 'Personal Main',
                code: 'PER001',
            },
            currentVoucherId: 88,
            totalDebit,
        })

        expect(mapped).toHaveLength(3)

        expect(mapped[0]).toMatchObject({
            entryOrder: 1,
            accountLedgerId: 101,
            debit: 0,
            credit: 1700,
            voucherId: 88,
        })

        expect(mapped[1]).toMatchObject({
            entryOrder: 2,
            accountLedgerId: 301,
            debit: 900,
            credit: 0,
        })

        expect(mapped[2]).toMatchObject({
            entryOrder: 3,
            accountLedgerId: 302,
            debit: 100,
            credit: 0,
        })
    })
})
