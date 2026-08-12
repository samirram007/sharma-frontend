import type { CreditNoteVoucherForm } from './schema'

const CreditNoteDefaultValues: CreditNoteVoucherForm = {
  voucherNo: 'new',
  voucherDate: new Date(),
  referenceNo: '',
  referenceDate: null,
  voucherTypeId: 1008,
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
  module: 'credit_note',
  voucherType: null,
  isEdit: false,
}

export default CreditNoteDefaultValues
