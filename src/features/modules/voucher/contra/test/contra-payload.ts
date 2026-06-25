export interface ContraEntryInput {
    id?: number | null
    voucherId?: number | null
    accountLedgerId: number
    credit?: number | null
    remarks?: string | null
}

export interface ContraDebitLedgerInput {
    id: number
    name: string
    code: string
    ledgerableType?: string | null
    ledgerableId?: number | null
}

export const calculateTotalCredit = (entries: ContraEntryInput[]) =>
    entries.reduce((sum, entry) => sum + Number(entry?.credit || 0), 0)

export const buildContraVoucherEntries = (params: {
    entries: ContraEntryInput[]
    selectedDebitLedger: ContraDebitLedgerInput
    currentVoucherId?: number | null
    totalCredit: number
}) => {
    const { entries, selectedDebitLedger, currentVoucherId, totalCredit } = params

    const creditEntries = entries
        .filter(
            (entry) =>
                Number(entry.accountLedgerId) > 0 && Number(entry.credit || 0) > 0
        )
        .map((entry, index) => ({
            id: entry.id ?? null,
            voucherId: entry.voucherId ?? currentVoucherId ?? null,
            entryOrder: index + 2,
            accountLedgerId: Number(entry.accountLedgerId),
            debit: 0,
            credit: Number(entry.credit || 0),
            remarks: entry.remarks ?? null,
        }))

    const debitEntry = {
        id: null,
        voucherId: currentVoucherId ?? null,
        entryOrder: 1,
        accountLedgerId: selectedDebitLedger.id,
        debit: Number(totalCredit || 0),
        credit: 0,
        remarks: 'Header debit account',
    }

    return [debitEntry, ...creditEntries]
}
