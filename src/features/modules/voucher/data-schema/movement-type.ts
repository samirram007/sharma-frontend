import type { StockJournalForm } from './voucher-schema'

/**
 * The movement type applied to a newly created stock journal line.
 * New lines default to OUT (consumption) — raw materials / inputs are
 * consumed first; users toggle rows to IN (production) for finished goods.
 */
export const DEFAULT_MOVEMENT_TYPE = 'out'

/**
 * Resolves the movement type for a new stock journal line from a set of
 * candidate values (e.g. the parent entry value, then the voucher-level
 * context type). The first non-empty candidate wins; when none are set,
 * new lines fall back to `DEFAULT_MOVEMENT_TYPE` ('out').
 */
export function resolveMovementType(
    ...candidates: Array<string | null | undefined>
): string {
    const resolved = candidates.find(
        (candidate) => typeof candidate === 'string' && candidate.trim() !== '',
    )

    return resolved ?? DEFAULT_MOVEMENT_TYPE
}

/**
 * Normalizes every stock journal entry (and its godown rows) to a single
 * movement type when a voucher loads in edit mode.
 *
 * Vouchers saved before the "IN ⇒ free-text batch" fix may carry stale
 * `movementType: 'out'` rows (the first entry used to be auto-created as
 * OUT). For single-movement vouchers — Opening Stock, Purchase, Receipt
 * Note (IN); Delivery Note, Sales (OUT) — every row must match the voucher
 * type, so re-saves send the correct payload. Null entries/godown rows are
 * preserved; a null/undefined stock journal yields undefined.
 *
 * Callers should pass the voucher's movement type explicitly (e.g. 'in' for
 * Opening Stock / Purchase / Receipt Note); the default matches the module's
 * OUT convention.
 */
export function normalizeStockJournalMovementType(
    stockJournal?: StockJournalForm | null,
    movementType: string = DEFAULT_MOVEMENT_TYPE,
): StockJournalForm | undefined {
    if (!stockJournal) return undefined

    const normalized = movementType || DEFAULT_MOVEMENT_TYPE

    return {
        ...stockJournal,
        stockJournalEntries: (stockJournal.stockJournalEntries ?? []).map(
            (entry) => {
                if (!entry) return entry
                return {
                    ...entry,
                    movementType: normalized,
                    stockJournalGodownEntries: (
                        entry.stockJournalGodownEntries ?? []
                    ).map((godownEntry) =>
                        godownEntry
                            ? { ...godownEntry, movementType: normalized }
                            : godownEntry,
                    ),
                }
            },
        ),
    }
}
