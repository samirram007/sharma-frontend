import type { RejectionInVoucherForm } from './schema'

const RejectionInDefaultValues: RejectionInVoucherForm = {
    voucherNo: 'new',
    voucherDate: new Date(),
    referenceNo: '',
    referenceDate: null,
    voucherTypeId: 2003,
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
    module: 'rejection_in',
    voucherType: null,
    isEdit: false,
}

export default RejectionInDefaultValues
