import { describe, expect, it } from 'vitest'
import contraDefaultValues from '../data/data'
import {
    buildContraVoucherEntries,
    calculateTotalCredit,
} from './contra-payload'

describe('contra defaults', () => {
    it('starts with exactly one voucher entry row', () => {
        expect(contraDefaultValues.voucherEntries).toHaveLength(1)
        expect(contraDefaultValues.voucherEntries[0].entryOrder).toBe(1)
    })
})

describe('contra payload mapping', () => {
    it('builds debit header entry first and credit lines after it', () => {
        const entries = [
            { accountLedgerId: 201, credit: 1200, remarks: 'line 1' },
            { accountLedgerId: 0, credit: 500, remarks: 'invalid row' },
            { accountLedgerId: 202, credit: 300, remarks: 'line 2' },
        ]

        const totalCredit = calculateTotalCredit(entries)

        const mapped = buildContraVoucherEntries({
            entries,
            selectedDebitLedger: {
                id: 101,
                name: 'Main Cash',
                code: 'CASH001',
            },
            currentVoucherId: 77,
            totalCredit,
        })

        expect(mapped).toHaveLength(3)

        expect(mapped[0]).toMatchObject({
            entryOrder: 1,
            accountLedgerId: 101,
            debit: 2000,
            credit: 0,
            voucherId: 77,
        })

        expect(mapped[1]).toMatchObject({
            entryOrder: 2,
            accountLedgerId: 201,
            debit: 0,
            credit: 1200,
        })

        expect(mapped[2]).toMatchObject({
            entryOrder: 3,
            accountLedgerId: 202,
            debit: 0,
            credit: 300,
        })
    })
})
