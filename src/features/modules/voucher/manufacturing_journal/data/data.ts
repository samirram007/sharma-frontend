import type { ManufacturingJournalVoucherForm } from './schema'

const ManufacturingJournalDefaultValues: ManufacturingJournalVoucherForm = {
    voucherNo: 'new',
    voucherDate: new Date(),
    referenceNo: '',
    referenceDate: null,
    voucherTypeId: 2006,
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
    module: 'manufacturing_journal',
    voucherType: null,
    isEdit: false,
}

export default ManufacturingJournalDefaultValues
