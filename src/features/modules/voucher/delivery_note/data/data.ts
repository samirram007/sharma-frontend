import { stockJournalDefaultValues } from "../../data-schema/data";
import type { VoucherDispatchDetailForm } from "../../data-schema/voucher-schema";
import type { DeliveryNoteForm } from "./schema";


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
    orderNumber: null,
    paymentTerms: null,
    otherReferences: null,
    termsOfDelivery: null,
    receiptDocNo: null,
    dispatchedThrough: null,
    destination: null,
    destinationSecondary: null,
    carrierName: null,
    billOfLadingNo: null,
    billOfLadingDate: null,
    motorVehicleNo: null,
    distance: null,
    distanceUnitId: 2,
    rate: null,
    rateUnitId: 16,
    totalFare: null,
    quantity: null,
    weight: null,
    weightUnitId: 16,
    volume: null,
    volumeUnitId: 10,
    freightBasis: 'weight',
    loadingCharges: null,
    unloadingCharges: null,
    packingCharges: null,
    insuranceCharges: null,
    otherCharges: null,
    billingPreference: 'advance' as const,
    freightCharges: null, 

}



const deliveryNoteDefaultValues: DeliveryNoteForm = {
    voucherNo: "new",
    voucherDate: new Date(),
    referenceNo: "",
    referenceDate: null,
    voucherTypeId: 2001,
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
export default deliveryNoteDefaultValues;

