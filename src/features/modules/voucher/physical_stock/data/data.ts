import type { PhysicalStockVoucherForm } from './schema'

const PhysicalStockDefaultValues: PhysicalStockVoucherForm = {
  voucherNo: 'new',
  voucherDate: new Date(),
  referenceNo: '',
  referenceDate: null,
  voucherTypeId: 2007,
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
  module: 'physical_stock',
  voucherType: null,
  isEdit: false,
}

export default PhysicalStockDefaultValues
