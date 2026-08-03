import type { ConversionJournalVoucherForm } from './schema'

export const conversionJournalStockJournalDefaultValues = {
  id: undefined,
  journalNo: '',
  journalDate: null,
  voucherId: undefined,
  type: 'conv',
  remarks: '',
  stockJournalEntries: [],
}

const ConversionJournalDefaultValues: ConversionJournalVoucherForm = {
  voucherNo: 'new',
  voucherDate: new Date(),
  referenceNo: '',
  referenceDate: null,
  voucherTypeId: 2008,
  stockJournalId: null,
  stockJournal: conversionJournalStockJournalDefaultValues,
  voucherEntries: [],
  party: null,
  partyLedger: null,
  transactionLedger: null,
  voucherDispatchDetail: null,
  amount: 0,
  remarks: '',
  module: 'conversion_journal',
  voucherType: null,
  isEdit: false,
}

export default ConversionJournalDefaultValues
