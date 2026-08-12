import type { ContraVoucherForm } from './schema'

const contraDefaultValues: ContraVoucherForm = {
  voucherNo: 'new',
  voucherDate: new Date(),
  referenceNo: '',
  referenceDate: null,
  voucherTypeId: 1001,
  stockJournalId: null,
  stockJournal: null,
  voucherEntries: [
    {
      entryOrder: 1,
      accountLedgerId: 0,
      debit: 0,
      credit: 0,
      remarks: '',
    },
  ],
  party: null,
  partyLedger: null,
  transactionLedger: null,
  voucherDispatchDetail: null,
  amount: 0,
  remarks: '',
  module: 'contra',
  voucherType: null,
  isEdit: false,
}

export default contraDefaultValues
