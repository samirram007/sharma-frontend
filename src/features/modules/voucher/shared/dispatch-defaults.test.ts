import { describe, expect, it } from 'vitest'
import {
  computeStockJournalWeight,
  resolveDispatchWeight,
} from './dispatch-defaults'

describe('computeStockJournalWeight — calculated weight from stock journal', () => {
  it('sums the actual quantities across stock-journal entries', () => {
    expect(
      computeStockJournalWeight({
        stockJournal: {
          stockJournalEntries: [
            { actualQuantity: 12.5 },
            { actualQuantity: 5.5 },
            { actualQuantity: 2 },
          ],
        },
      }),
    ).toBe(20)
  })

  it('coerces string decimals returned by the API', () => {
    expect(
      computeStockJournalWeight({
        stockJournal: {
          stockJournalEntries: [
            { actualQuantity: '12.5' },
            { actualQuantity: '7.5' },
          ],
        },
      }),
    ).toBe(20)
  })

  it('treats nullish and non-numeric quantities as zero', () => {
    expect(
      computeStockJournalWeight({
        stockJournal: {
          stockJournalEntries: [
            { actualQuantity: 10 },
            { actualQuantity: null },
            { actualQuantity: undefined },
            {},
            null,
          ],
        },
      }),
    ).toBe(10)
  })

  it('returns 0 for a voucher without a stock journal or entries', () => {
    expect(computeStockJournalWeight({})).toBe(0)
    expect(computeStockJournalWeight({ stockJournal: null })).toBe(0)
    expect(
      computeStockJournalWeight({ stockJournal: { stockJournalEntries: [] } }),
    ).toBe(0)
    expect(computeStockJournalWeight(null)).toBe(0)
    expect(computeStockJournalWeight(undefined)).toBe(0)
  })
})

describe('resolveDispatchWeight — dispatch-detail weight defaulting', () => {
  it('uses the saved dispatch-detail weight when set', () => {
    expect(
      resolveDispatchWeight({
        voucherDispatchDetail: { weight: 18.25 },
        stockJournal: {
          stockJournalEntries: [{ actualQuantity: 20 }],
        },
      }),
    ).toBe(18.25)
  })

  it('falls back to the calculated weight when nothing is saved', () => {
    expect(
      resolveDispatchWeight({
        voucherDispatchDetail: { weight: null },
        stockJournal: {
          stockJournalEntries: [
            { actualQuantity: '10' },
            { actualQuantity: '8' },
          ],
        },
      }),
    ).toBe(18)
  })

  it('falls back to the calculated weight when the saved weight is zero', () => {
    expect(
      resolveDispatchWeight({
        voucherDispatchDetail: { weight: 0 },
        stockJournal: {
          stockJournalEntries: [{ actualQuantity: 7 }],
        },
      }),
    ).toBe(7)
  })

  it('falls back to 0 when neither a saved nor a calculated weight exists', () => {
    expect(
      resolveDispatchWeight({ voucherDispatchDetail: { weight: null } }),
    ).toBe(0)
    expect(resolveDispatchWeight({})).toBe(0)
    expect(resolveDispatchWeight(null)).toBe(0)
  })

  it('coerces string weights from the dispatch detail', () => {
    expect(
      resolveDispatchWeight({
        voucherDispatchDetail: { weight: '18.5' },
        stockJournal: { stockJournalEntries: [{ actualQuantity: 20 }] },
      }),
    ).toBe(18.5)
  })
})
