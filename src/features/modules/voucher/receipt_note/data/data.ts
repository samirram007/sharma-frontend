import type { VoucherDispatchDetailForm } from "../../data-schema/voucher-schema";
import type { ReceiptNoteForm } from "./schema";

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
    movementType: 'in',
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
    movementType: 'in',
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
    type: "in",
    remarks: "",
    stockJournalEntries: [],

    // stockJournalEntryDefaultValues


}
export const partyDefaultValues = {
    name: "",
    mailingName: "",
    line1: "",
    line2: "",
    line3: "",
    stateId: 36,
    countryId: 76,
    gstRegistrationTypeId: 1,
    gstin: "",
    placeOfSupplyStateId: 36,
}
export const voucherDispatchDefaultValues: VoucherDispatchDetailForm = {
    id: null,
    voucherId: null,
    orderNumber: '',
    paymentTerms: '',
    otherReferences: '',
    termsOfDelivery: '',
    receiptDocNo: '',
    dispatchedThrough: '',
    destination: '',
    carrierName: '',
    billOfLadingNo: '',
    billOfLadingDate: null,
    motorVehicleNo: '',


}



const receiptNoteDefaultValues: ReceiptNoteForm = {
    voucherNo: "new",
    voucherDate: new Date(),
    referenceNo: "",
    referenceDate: null,
    voucherTypeId: 2002,
    partyLedger: undefined,
    transactionLedger: undefined,
    stockJournalId: null,
    remarks: "",
    stockJournal: stockJournalDefaultValues,
    party: partyDefaultValues,
    voucherDispatchDetail: voucherDispatchDefaultValues,
    voucherEntries: [],
    isEdit: false,
}
export default receiptNoteDefaultValues;

