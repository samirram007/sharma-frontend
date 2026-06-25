export interface PurchaseEntryInput {
    id?: number | null
    voucherId?: number | null
    accountLedgerId: number
    debit?: number | null
    remarks?: string | null
}

export interface PurchaseCreditLedgerInput {
    id: number
    name: string
    code: string
    ledgerableType?: string | null
    ledgerableId?: number | null
}

export const calculateTotalDebit = (entries: PurchaseEntryInput[]) =>
    entries.reduce((sum, entry) => sum + Number(entry?.debit || 0), 0)

export const buildPurchaseVoucherEntries = (params: {
    entries: PurchaseEntryInput[]
    selectedCreditLedger: PurchaseCreditLedgerInput
    currentVoucherId?: number | null
    totalDebit: number
}) => {
    const { entries, selectedCreditLedger, currentVoucherId, totalDebit } = params

    const debitEntries = entries
        .filter(
            (entry) =>
                Number(entry.accountLedgerId) > 0 && Number(entry.debit || 0) > 0
        )
        .map((entry, index) => ({
            id: entry.id ?? null,
            voucherId: entry.voucherId ?? currentVoucherId ?? null,
            entryOrder: index + 2,
            accountLedgerId: Number(entry.accountLedgerId),
            debit: Number(entry.debit || 0),
            credit: 0,
            remarks: entry.remarks ?? null,
        }))

    const creditEntry = {
        id: null,
        voucherId: currentVoucherId ?? null,
        entryOrder: 1,
        accountLedgerId: selectedCreditLedger.id,
        debit: 0,
        credit: Number(totalDebit || 0),
        remarks: 'Header credit account',
    }

    return [creditEntry, ...debitEntries]
}

