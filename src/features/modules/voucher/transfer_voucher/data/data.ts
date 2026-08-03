import type { TransferVoucherVoucherForm } from './schema'

export const transferVoucherStockJournalDefaultValues = {
  id: undefined,
  journalNo: '',
  journalDate: null,
  voucherId: undefined,
  type: 'in',
  remarks: '',
  stockJournalEntries: [],
}

const TransferVoucherDefaultValues: TransferVoucherVoucherForm = {
  voucherNo: 'new',
  voucherDate: new Date(),
  referenceNo: '',
  referenceDate: null,
  voucherTypeId: 2005,
  stockJournalId: null,
  stockJournal: transferVoucherStockJournalDefaultValues,
  voucherEntries: [],
  party: null,
  partyLedger: null,
  transactionLedger: null,
  voucherDispatchDetail: null,
  amount: 0,
  remarks: '',
  module: 'transfer_voucher',
  voucherType: null,
  isEdit: false,
}

export default TransferVoucherDefaultValues
