import type { JournalVoucherForm } from './schema'

const journalDefaultValues: JournalVoucherForm = {
    voucherNo: 'new',
    voucherDate: new Date(),
    referenceNo: '',
    referenceDate: null,
    voucherTypeId: 1004,
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
        {
            entryOrder: 2,
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
    module: 'journal',
    voucherType: null,
    isEdit: false,
}

export default journalDefaultValues
