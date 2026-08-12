import type { PaymentVoucherForm } from './schema'

const paymentDefaultValues: PaymentVoucherForm = {
  voucherNo: 'new',
  voucherDate: new Date(),
  referenceNo: '',
  referenceDate: null,
  voucherTypeId: 1002,
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
  module: 'payment',
  voucherType: null,
  isEdit: false,
}

export default paymentDefaultValues
