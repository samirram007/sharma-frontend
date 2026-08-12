import type { OpeningStockVoucherForm } from './schema'

export const openingStockJournalDefaultValues = {
  id: undefined,
  journalNo: '',
  journalDate: null,
  voucherId: undefined,
  // The stock journal type for OPNSK vouchers is the module code 'OPNSK'
  // (same convention as 'conv' for conversion journals). The backend also
  // stamps it on save, so this just keeps the payload honest.
  type: 'OPNSK',
  remarks: '',
  stockJournalEntries: [],
}

const OpeningStockDefaultValues: OpeningStockVoucherForm = {
  voucherNo: 'new',
  voucherDate: new Date(),
  referenceNo: '',
  referenceDate: null,
  // Resolved at runtime from the backend — the OPNSK id is not stable across
  // databases (see OPENING_STOCK_VOUCHER_TYPE_CODE in schema.ts).
  voucherTypeId: null,
  stockJournalId: null,
  stockJournal: openingStockJournalDefaultValues,
  voucherEntries: [],
  party: null,
  partyLedger: null,
  transactionLedger: null,
  voucherDispatchDetail: null,
  amount: 0,
  remarks: '',
  module: 'opening_stock',
  voucherType: null,
  isEdit: false,
}

export default OpeningStockDefaultValues
