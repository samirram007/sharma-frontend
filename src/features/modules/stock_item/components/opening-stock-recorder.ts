import { toast } from 'sonner'
import {
  fetchOpeningStockByIdService,
  fetchOpeningStockService,
  fetchOpeningStockVoucherTypeService,
  storeOpeningStockService,
  updateOpeningStockService,
} from '@/features/modules/voucher/opening_stock/data/api'
import { getServerErrorMessage } from '@/utils/handle-server-error'

type OpeningStockInput = {
  itemId: number
  quantity: number
  rate?: number | null
  godownId: number
  stockUnitId?: number | null
  fyStartDate?: string | Date | null
  currentFyId?: number | null
}

/**
 * Record opening stock for a newly created stock item through the app's
 * existing Opening Stock (OPNSK voucher) pipeline.
 *
 * - If no opening stock voucher exists for the current fiscal year, one is
 *   created with this item as its first entry.
 * - If one already exists, this item is appended as a new entry (the voucher
 *   is re-posted via the update pipeline, which replaces its stock journal
 *   entries — so the existing entries are re-sent untouched).
 *
 * Quantities land in stock_journal_godown_entries with movement_type 'in',
 * which is exactly what StockSummary / stock reports count as opening stock.
 */
export async function recordOpeningStockForItem(
  input: OpeningStockInput,
): Promise<void> {
  const { itemId, quantity, rate, godownId, stockUnitId, fyStartDate, currentFyId } =
    input

  if (!quantity || quantity <= 0 || !godownId) return

  const amount = Math.round((quantity * (rate ?? 0)) * 100) / 100

  // Resolve the OPNSK voucher type id at runtime (not stable across DBs).
  const typeEnvelope = await fetchOpeningStockVoucherTypeService()
  const openingStockTypeId = typeEnvelope?.data?.id
  if (!openingStockTypeId) {
    toast.error('Opening Stock voucher type (OPNSK) is not configured.')
    return
  }

  // Parse the FY start date as local midnight to avoid UTC date-shifting.
  const voucherDate = fyStartDate
    ? new Date(`${new Date(fyStartDate).toISOString().slice(0, 10)}T00:00:00`)
    : new Date()

  const buildEntry = () => ({
    id: undefined,
    stockJournalId: undefined,
    stockItemId: itemId,
    stockUnitId: stockUnitId ?? undefined,
    unitRatio: 0,
    itemCost: 0,
    actualQuantity: quantity,
    billingQuantity: quantity,
    rate: rate ?? 0,
    rateUnitId: stockUnitId ?? undefined,
    rateUnitRatio: 1,
    discountPercentage: 0,
    discount: 0,
    amount,
    movementType: 'in',
    stockJournalGodownEntries: [
      {
        id: undefined,
        stockJournalEntryId: undefined,
        godownId,
        batchNo: null,
        mfgDate: null,
        expiryDate: null,
        serialNo: null,
        actualQuantity: quantity,
        billingQuantity: quantity,
        rate: rate ?? 0,
        amount,
        movementType: 'in',
      },
    ],
  })

  // Find the one existing opening stock voucher for this fiscal year.
  const listEnvelope = await fetchOpeningStockService(openingStockTypeId)
  const existing = (listEnvelope?.data ?? []).find(
    (v: { fiscalYearId?: number | null }) =>
      currentFyId == null || v.fiscalYearId === currentFyId,
  )

  if (existing?.id) {
    // Append: load the full voucher, re-send its entries untouched plus the
    // new one. The update pipeline replaces the stock journal entries.
    const detailEnvelope = await fetchOpeningStockByIdService(existing.id)
    const voucher = detailEnvelope?.data
    const journal = voucher?.stockJournal ?? {}
    const entries = (journal.stockJournalEntries ?? [])
      .filter(Boolean)
      .map((entry: Record<string, any>) => ({
        ...entry,
        stockJournalGodownEntries: (entry.stockJournalGodownEntries ?? [])
          .filter(Boolean)
          .map((ge: Record<string, any>) => ({
            ...ge,
            id: undefined,
            stockJournalEntryId: undefined,
          })),
      }))

    await updateOpeningStockService({
      ...voucher,
      id: existing.id,
      stockJournal: {
        ...journal,
        id: journal.id,
        journalNo: journal.journalNo ?? '',
        stockJournalEntries: [...entries, buildEntry()],
      },
      voucherTypeId: openingStockTypeId,
      module: 'opening_stock',
      voucherDate: voucher?.voucherDate ?? voucherDate,
      status: voucher?.status ?? 'active',
    })
    toast.success('Opening stock added to the existing opening stock voucher.')
  } else {
    await storeOpeningStockService({
      voucherNo: 'new',
      voucherDate,
      voucherTypeId: openingStockTypeId,
      module: 'opening_stock',
      status: 'active',
      remarks: 'Opening stock entered from new stock item form',
      effects_stock: true,
      stockJournal: {
        journalNo: '',
        journalDate: voucherDate,
        type: 'OPNSK',
        remarks: 'Opening stock entered from new stock item form',
        stockJournalEntries: [buildEntry()],
      },
      voucherEntries: [],
    })
    toast.success('Opening stock voucher created for the new item.')
  }
}

/**
 * Best-effort wrapper — the item is already saved at this point, so a failed
 * opening-stock post must not roll it back or block navigation; the user is
 * told to enter the quantity from the Opening Stock screen instead.
 */
export async function tryRecordOpeningStock(
  input: OpeningStockInput,
): Promise<void> {
  try {
    await recordOpeningStockForItem(input)
  } catch (error) {
    console.error('Failed to record opening stock:', error)
    toast.error(
      getServerErrorMessage(
        error,
        'Item saved, but opening stock could not be recorded. Please add it from Transactions → Opening Stock.',
      ),
      { duration: 8000 },
    )
  }
}
