import type { RejectionOutVoucherForm } from './schema'

const RejectionOutDefaultValues: RejectionOutVoucherForm = {
  voucherNo: 'new',
  voucherDate: new Date(),
  referenceNo: '',
  referenceDate: null,
  voucherTypeId: 2004,
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
  module: 'rejection_out',
  voucherType: null,
  isEdit: false,
}

export default RejectionOutDefaultValues
