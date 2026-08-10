import { describe, expect, it } from 'vitest'
import {
  DEFAULT_MOVEMENT_TYPE,
  normalizeStockJournalMovementType,
  resolveMovementType,
} from './movement-type'
import type { StockJournalForm } from './voucher-schema'
import { stockJournalEntryDefaultValues } from '../receipt_note/data/data'

describe('new stock journal lines default to OUT (consumption)', () => {
    it('resolves to "out" when no movement type has been set yet', () => {
        expect(resolveMovementType()).toBe('out')
        expect(DEFAULT_MOVEMENT_TYPE).toBe('out')
    })

    it('resolves to "out" when the voucher-level context is an empty string', () => {
        // Mirrors the real mount-timing case: the first row is appended
        // before the POS context default ('out') has been applied.
        expect(resolveMovementType('')).toBe('out')
        expect(resolveMovementType('', null, undefined)).toBe('out')
    })

    it('preserves an explicit OUT (consumption) selection', () => {
        expect(resolveMovementType('out')).toBe('out')
    })

    it('preserves an explicit IN (production) selection', () => {
        expect(resolveMovementType('in')).toBe('in')
    })

    it('lets the parent entry movement type win over the voucher-level context', () => {
        expect(resolveMovementType('in', 'out')).toBe('in')
        expect(resolveMovementType('out', 'in')).toBe('out')
    })

    it('skips blank candidates and uses the first real value', () => {
        expect(resolveMovementType('', '', 'in')).toBe('in')
    })

    it('builds a new stock journal entry row defaulting to "out"', () => {
        // The stock journal entry form appends rows as:
        //   { ...stockJournalEntryDefaultValues, movementType: resolveMovementType(movementType) }
        // where the POS context value is still '' on first mount.
        const newEntry = {
            ...stockJournalEntryDefaultValues,
            movementType: resolveMovementType(''),
        }
        expect(newEntry.movementType).toBe('out')
    })
})

describe('normalizeStockJournalMovementType', () => {
    const legacyStockJournal = {
        id: 1,
        journalNo: 'RN-001',
        type: 'in',
        stockJournalEntries: [
            {
                id: 10,
                movementType: 'out',
                stockJournalGodownEntries: [
                    { id: 100, movementType: 'out' },
                    null,
                    { id: 101, movementType: 'in' },
                ],
            },
            null,
            { id: 11, movementType: 'out', stockJournalGodownEntries: [] },
        ],
    } as unknown as StockJournalForm

    it('returns undefined for null/undefined stock journals', () => {
        expect(normalizeStockJournalMovementType(null, 'in')).toBeUndefined()
        expect(normalizeStockJournalMovementType(undefined, 'in')).toBeUndefined()
    })

    it('normalizes entry and godown-row movement types to the target type', () => {
        const result = normalizeStockJournalMovementType(
            legacyStockJournal,
            'in',
        )
        expect(result?.stockJournalEntries?.[0]?.movementType).toBe('in')
        expect(
            result?.stockJournalEntries?.[0]?.stockJournalGodownEntries?.[0]
                ?.movementType,
        ).toBe('in')
        expect(
            result?.stockJournalEntries?.[0]?.stockJournalGodownEntries?.[2]
                ?.movementType,
        ).toBe('in')
        expect(result?.stockJournalEntries?.[2]?.movementType).toBe('in')
    })

    it('preserves null entries and null godown rows', () => {
        const result = normalizeStockJournalMovementType(
            legacyStockJournal,
            'in',
        )
        expect(result?.stockJournalEntries?.[1]).toBeNull()
        expect(
            result?.stockJournalEntries?.[0]?.stockJournalGodownEntries?.[1],
        ).toBeNull()
    })

    it('does not mutate the input object', () => {
        normalizeStockJournalMovementType(legacyStockJournal, 'in')
        expect(legacyStockJournal.stockJournalEntries?.[0]?.movementType).toBe(
            'out',
        )
        expect(
            legacyStockJournal.stockJournalEntries?.[0]
                ?.stockJournalGodownEntries?.[0]?.movementType,
        ).toBe('out')
    })
})
