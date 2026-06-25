import { describe, expect, it } from 'vitest'
import purchaseOrderDefaultValues from '../data/data'
import {
    buildPurchaseOrderVoucherEntries,
    calculateTotalDebit,
} from '../pos/purchase-order-payload'

describe('purchase order defaults', () => {
    it('starts with exactly one voucher entry row', () => {
        expect(purchaseOrderDefaultValues.voucherEntries).toHaveLength(1)
        expect(purchaseOrderDefaultValues.voucherEntries[0].entryOrder).toBe(1)
    })
})

describe('purchase order payload mapping', () => {
    it('builds header credit first and debit lines after it', () => {
        const entries = [
            { accountLedgerId: 201, debit: 500, remarks: 'item 1' },
            { accountLedgerId: 0, debit: 300, remarks: 'invalid row' },
            { accountLedgerId: 202, debit: 200, remarks: 'item 2' },
        ]

        const totalDebit = calculateTotalDebit(entries)

        const mapped = buildPurchaseOrderVoucherEntries({
            entries,
            selectedCreditLedger: {
                id: 101,
                name: 'Supplier Account',
                code: 'SUP001',
            },
            currentVoucherId: 55,
            totalDebit,
        })

        // invalid row (accountLedgerId=0) filtered out → 1 credit + 2 debit = 3
        expect(mapped).toHaveLength(3)

        expect(mapped[0]).toMatchObject({
            entryOrder: 1,
            accountLedgerId: 101,
            debit: 0,
            credit: 1000,
            voucherId: 55,
        })

        expect(mapped[1]).toMatchObject({
            entryOrder: 2,
            accountLedgerId: 201,
            debit: 500,
            credit: 0,
            voucherId: 55,
        })

        expect(mapped[2]).toMatchObject({
            entryOrder: 3,
            accountLedgerId: 202,
            debit: 200,
            credit: 0,
            voucherId: 55,
        })
    })
})
