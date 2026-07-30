import { godownSchema } from '@/features/modules/godown/data/schema';
import { stockItemSchema } from '@/features/modules/stock_item/data/schema';
import { stockUnitSchema } from '@/features/modules/stock_unit/data/schema';
import { z } from 'zod';
import { stateSchema } from '../../state/data/schema';
import { countrySchema } from '../../country/data/schema';
import { voucherTypeSchema } from '../../voucher_type/data/schema';



export const stockJournalGodownEntrySchema = z.object({
    id: z.number().int().positive().nullish(),
    stockJournalEntryId: z.number().int().positive().nullish(),
    godownId: z.number().int().positive().nullish(),
    batchNo: z.string().nullish(),
    mfgDate: z.coerce.date().nullish(),
    expiryDate: z.coerce.date().nullish(),
    serialNo: z.string().nullish(),
    actualQuantity: z.coerce.number().nonnegative(),
    billingQuantity: z.coerce.number().nonnegative(),
    rate: z.coerce.number().nonnegative().nullish(),
    discountPercentage: z.coerce.number().nonnegative().nullish(),
    discount: z.coerce.number().nonnegative().nullish(),
    amount: z.coerce.number().nullish(),
    movementType: z.string().min(1).nullish(),
    remarks: z.string().min(1).nullish(),
    godown: z.lazy(() => godownSchema.nullish()),
    stockItem: z.lazy(() => stockItemSchema.nullish()),
    stockUnit: z.lazy(() => stockUnitSchema.nullish()),
    rateUnit: z.lazy(() => stockUnitSchema.nullish()),
})
export type StockJournalGodownEntryForm = z.infer<typeof stockJournalGodownEntrySchema>
export const stockJournalEntrySchema = z.object({
    id: z.number().int().positive().nullish(),
    stockJournalId: z.number().int().positive().nullish(),
    stockItemId: z.number().int().positive().nullish(),
    stockUnitId: z.number().int().positive().nullish(),
    alternateStockUnitId: z.number().int().positive().nullish(),
    unitRatio: z.coerce.number().nonnegative().nullish(),
    itemCost: z.coerce.number().nonnegative().nullish(),
    actualQuantity: z.coerce.number().nonnegative().nullish(),
    billingQuantity: z.coerce.number().nonnegative().nullish(),
    rate: z.coerce.number().nonnegative().nullish(),
    rateUnitId: z.number().int().nonnegative().nullish(),
    rateUnitRatio: z.coerce.number().nonnegative().nullish(),
    discountPercentage: z.coerce.number().nonnegative().nullish(),
    discount: z.coerce.number().nonnegative().nullish(),
    amount: z.coerce.number().nullish(),
    movementType: z.string().min(1).nullish(),
    stockItem: z.lazy(() => stockItemSchema.nullish()),
    stockUnit: z.lazy(() => stockUnitSchema.nullish()),
    rateUnit: z.lazy(() => stockUnitSchema.nullish()),
    stockJournalGodownEntries: z.array(stockJournalGodownEntrySchema.nullish()),
    // remarks: z.string().nullish(),
    alternateStockUnit: z.lazy(() => stockUnitSchema.nullish())
})

export type StockJournalEntryForm = z.infer<typeof stockJournalEntrySchema>


export const stockJournalSchema = z.object({
    id: z.number().int().positive().nullish(),
    journalNo: z.string().min(1).nullish(),
    journalDate: z.coerce.date().nullish(),
    voucherId: z.number().int().nullish(),
    type: z.string().nullish(),
    remarks: z.string().nullish(),
    stockJournalEntries: z.array(stockJournalEntrySchema.nullish()),
})
export type StockJournalForm = z.infer<typeof stockJournalSchema>


export const voucherEntrySchema = z.object({
    id: z.number().int().positive().nullish(),
    voucherId: z.number().int().positive().nullish(),
    entryOrder: z.number(),
    accountLedgerId: z.number().int(),
    debit: z.coerce.number().nullish(),
    credit: z.coerce.number().nullish(),
    remarks: z.string().nullish()
})

export type VoucherEntryForm = z.infer<typeof voucherEntrySchema>
export const partySchema = z.object({
    id: z.number().int().positive().nullish(),
    name: z.string().min(1).nullish(),
    mailingName: z.string().nullish(),
    line1: z.string().nullish(),
    line2: z.string().nullish(),
    line3: z.string().nullish(),
    stateId: z.number().int().nullish(),
    state: stateSchema.nullish(),
    countryId: z.number().int().nullish(),
    country: countrySchema.nullish(),
    gstRegistrationTypeId: z.number().int().nullish(),
    gstin: z.string().nullish(),
    placeOfSupplyStateId: z.number().int().nullish(),

})
export type PartyForm = z.infer<typeof partySchema>

export const billingPreference = ['advance', 'current', 'due'] as const;
export type BillingPreference = (typeof billingPreference)[number];

export const billingPreferenceSchema = z.enum(billingPreference);
export type BillingPreferenceForm = z.infer<typeof billingPreferenceSchema>

export const voucherDispatchDetailSchema = z.object({
    id: z.number().int().positive().nullish(),
    voucherId: z.number().int().positive().nullish(),
    orderNumber: z.string().nullish(),
    paymentTerms: z.string().nullish(),
    otherReferences: z.string().nullish(),
    termsOfDelivery: z.string().nullish(),
    receiptDocNo: z.string().nullish(),
    dispatchedThrough: z.string().nullish(),
    source: z.string().nullish(),
    destination: z.string().nullish(),
    destinationSecondary: z.string().nullish(),
    carrierName: z.string().nullish(),
    billOfLadingNo: z.string().nullish(),
    billOfLadingDate: z.coerce.date().nullish(),
    motorVehicleNo: z.string().nullish(),
    distance: z.coerce.number().nullish(),
    distanceUnitId: z.number().int().positive().nullish(),
    rate: z.coerce.number().nullish(), 
    rateUnitId: z.number().int().nonnegative().nullish(),
    quantity: z.coerce.number().nullish(),
    weight: z.coerce.number().nullish(),
    weightUnitId: z.number().int().positive().nullish(),
    weightUnit: z.lazy(() => stockUnitSchema.nullish()),
    volume: z.coerce.number().nullish(),
    volumeUnitId: z.number().int().positive().nullish(),
    freightBasis: z.string().nullish(),
    loadingCharges: z.coerce.number().nullish(),
    unloadingCharges: z.coerce.number().nullish(),
    packingCharges: z.coerce.number().nullish(),
    insuranceCharges: z.coerce.number().nullish(),
    otherCharges: z.coerce.number().nullish(),
    freightCharges: z.coerce.number().nullish(),
    totalFare: z.coerce.number().nullish(),
    billingPreference: billingPreferenceSchema.nullish(),
    isEdit: z.boolean().nullish(),



})
export type VoucherDispatchDetailForm = z.infer<typeof voucherDispatchDetailSchema>

export const transactionLedgerSchema = z.object({
    id: z.number().int().positive(),
    name: z.string().min(1),
    code: z.string().nullish(),
    ledgerableType: z.string().nullish(),
    ledgerableId: z.coerce.number().int().nullish(),
    currentBalance: z.coerce.number().nullish(),
})
export const partyLedgerSchema = z.object({
    id: z.number().int().positive(),
    name: z.string().min(1),
    code: z.string().nullish(),
    ledgerableType: z.string().nullish(),
    ledgerableId: z.coerce.number().int().nullish(),
    currentBalance: z.coerce.number().nullish(),
})
export const voucherSchema = z.object({
    id: z.number().int().positive().nullish(),
    voucherNo: z.string().min(1).nullish(),
    voucherDate: z.coerce.date(),
    referenceNo: z.string().nullish(),
    referenceDate: z.coerce.date().nullish(),
    voucherTypeId: z.number().int(),
    voucherType: z.lazy(() => voucherTypeSchema.nullish()),
    module: z.string().nullish(),
    stockJournalId: z.number().int().nullish(),
    stockJournal: z.lazy(() => stockJournalSchema.nullish()),
    voucherEntries: z.array(z.lazy(() => voucherEntrySchema)),
    party: partySchema.nullish(),
    partyLedger: z.lazy(() => partyLedgerSchema.nullish()),
    transactionLedger: transactionLedgerSchema.nullish(),
    voucherDispatchDetail: voucherDispatchDetailSchema.nullish(),
    amount: z.coerce.number().nullish(),
    remarks: z.string().nullish(),

})
export type VoucherSchema = z.infer<typeof voucherSchema>
export const voucherListSchema = z.array(voucherSchema)
export type VoucherList = z.infer<typeof voucherListSchema>



export const formSchema = z
    .object({
        voucherNo: z.string().min(1).nullish(),
        voucherDate: z.coerce.date(),
        referenceNo: z.string().min(1).nullish(),
        referenceDate: z.coerce.date().nullish(),
        voucherTypeId: z.number().int(),
        stockJournalId: z.number().int().nullish(),
        stockJournal: stockJournalSchema.nullish(),
        voucherEntries: z.array(voucherEntrySchema.nullish()),
        party: partySchema.nullish(),
        partyLedger: partyLedgerSchema.nullish(),
        transactionLedger: transactionLedgerSchema.nullish(),
        voucherDispatchDetail: voucherDispatchDetailSchema.nullish(),
        amount: z.coerce.number().nullish(),
        remarks: z.string().nullish(),
        isEdit: z.boolean(),
    })

export type VoucherForm = z.infer<typeof formSchema>