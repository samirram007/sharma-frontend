export const stockJournalGodownEntryDefaultValues = {
    id: null,
    stockJournalEntryId: null,
    godownId: undefined,
    batchNo: '',
    mfgDate: null,
    expiryDate: null,
    serialNo: '',
    actualQuantity: 0,
    billingQuantity: 0,
    rate: 0,
    rateUnitRatio: 1,
    discountPercentage: 0,
    discount: 0,
    amount: 0,
    movementType: 'out',
    stockItem: undefined,
    stockUnit: undefined,
    remarks: undefined,
    godown: undefined
}
export const stockJournalEntryDefaultValues = {

    id: null,
    stockJournalId: undefined,
    stockItemId: undefined,
    stockItem: undefined,
    stockUnitId: undefined,
    alternateStockUnitId: undefined,
    unitRatio: 0,
    itemCost: 0,
    actualQuantity: 0,
    billingQuantity: 0,
    rate: 0,
    rateUnitId: undefined,
    rateUnitRatio: 1,
    discountPercentage: 0,
    discount: 0,
    amount: 0,
    movementType: 'out',
    stockUnit: undefined,
    rateUnit: undefined,
    godown: undefined,
    alternateStockUnit: undefined,
    stockJournalGodownEntries: []

}
export const stockJournalDefaultValues = {


    id: undefined,
    journalNo: "",
    journalDate: null,
    voucherId: undefined,
    type: "out",
    remarks: "",
    stockJournalEntries: [],

    // stockJournalEntryDefaultValues


}