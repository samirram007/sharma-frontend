import { godownSchema } from '@/features/modules/godown/data/schema';
import { stockItemSchema } from '@/features/modules/stock_item/data/schema';
import { stockUnitSchema } from '@/features/modules/stock_unit/data/schema';
import { z } from 'zod';


export const stockJournalGodownEntrySchema = z.object({
    id: z.number().int().positive().nullish(),
    stockJournalEntryId: z.number().int().positive().nullish(),
    godownId: z.number().int().positive().nullish(),
    batchNo: z.string().nullish(),
    mfgDate: z.coerce.date().nullish(),
    expiryDate: z.coerce.date().nullish(),
    serialNo: z.string().nullish(),
    actualQuantity: z.number(),
    billingQuantity: z.number(),
    rate: z.coerce.number().nullish(),
    discountPercentage: z.number().int().positive().nullish(),
    discount: z.number().int().positive().nullish(),
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
    unitRatio: z.number().int().positive().nullish(),
    itemCost: z.number().int().positive().nullish(),
    actualQuantity: z.number().int().positive().nullish(),
    billingQuantity: z.number().int().positive().nullish(),
    rate: z.number().int().positive().nullish(),
    rateUnitId: z.number().int().positive().nullish(),
    rateUnitRatio: z.number().int().positive().nullish(),
    discountPercentage: z.number().int().positive().nullish(),
    discount: z.number().int().positive().nullish(),
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
    voucherId: z.string().min(1).nullish(),
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
    countryId: z.number().int().nullish(),
    gstRegistrationTypeId: z.number().int().nullish(),
    gstin: z.string().nullish(),
    placeOfSupplyStateId: z.number().int().nullish(),

})
export type PartyForm = z.infer<typeof partySchema>

export const voucherDispatchDetailSchema = z.object({
    id: z.number().int().positive().nullish(),
    voucherId: z.string().min(1).nullish(),
    orderNumber: z.string().nullish(),
    paymentTerms: z.string().nullish(),
    otherReferences: z.string().nullish(),
    termsOfDelivery: z.string().nullish(),
    receiptDocNo: z.string().nullish(),
    dispatchedThrough: z.string().nullish(),
    destination: z.string().nullish(),
    carrierName: z.string().nullish(),
    billOfLadingNo: z.string().nullish(),
    billOfLadingDate: z.coerce.date().nullish(),
    motorVehicleNo: z.string().nullish(),


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
export const deliveryNoteSchema = z.object({
    id: z.number().int().positive().nullish(),
    voucherNo: z.string().min(1).nullish(),
    voucherDate: z.coerce.date(),
    referenceNo: z.string().min(1).nullish(),
    referenceDate: z.coerce.date().nullish(),
    voucherTypeId: z.number().int(),
    stockJournalId: z.number().int().nullish(),
    stockJournal: z.lazy(() => stockJournalSchema.nullish()),
    voucherEntries: z.array(z.lazy(() => voucherEntrySchema)),
    party: partySchema.nullish(),
    partyLedger: partyLedgerSchema.nullish(),
    transactionLedger: transactionLedgerSchema.nullish(),
    voucherDispatchDetail: voucherDispatchDetailSchema.nullish(),
    amount: z.coerce.number().nullish(),
    remarks: z.string().nullish()
})
export type DeliveryNoteSchema = z.infer<typeof deliveryNoteSchema>
export const deliveryNoteListSchema = z.array(deliveryNoteSchema)
export type DeliveryNoteList = z.infer<typeof deliveryNoteListSchema>



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

export type DeliveryNoteForm = z.infer<typeof formSchema>