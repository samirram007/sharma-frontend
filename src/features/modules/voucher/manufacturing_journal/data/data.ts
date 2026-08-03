import type { ManufacturingJournalVoucherForm } from './schema'

export const manufacturingJournalStockJournalDefaultValues = {
  id: undefined,
  journalNo: '',
  journalDate: null,
  voucherId: undefined,
  type: 'in',
  remarks: '',
  stockJournalEntries: [],
}

const ManufacturingJournalDefaultValues: ManufacturingJournalVoucherForm = {
  voucherNo: 'new',
  voucherDate: new Date(),
  referenceNo: '',
  referenceDate: null,
  voucherTypeId: 2006,
  stockJournalId: null,
  stockJournal: manufacturingJournalStockJournalDefaultValues,
  voucherEntries: [],
  party: null,
  partyLedger: null,
  transactionLedger: null,
  voucherDispatchDetail: null,
  amount: 0,
  remarks: '',
  module: 'manufacturing_journal',
  voucherType: null,
  isEdit: false,
}

export default ManufacturingJournalDefaultValues
