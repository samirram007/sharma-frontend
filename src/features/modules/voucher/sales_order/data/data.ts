import type { SalesOrderVoucherForm } from './schema'

const salesOrderDefaultValues: SalesOrderVoucherForm = {
    voucherNo: 'new',
    voucherDate: new Date(),
    referenceNo: '',
    referenceDate: null,
    voucherTypeId: 5002,
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
    module: 'sales_order',
    voucherType: null,
    isEdit: false,
}

export default salesOrderDefaultValues
