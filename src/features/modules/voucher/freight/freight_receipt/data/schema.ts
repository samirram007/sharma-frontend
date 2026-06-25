import z from "zod"

export const freightReceiptSchema = z.object({
    receiptId: z.number().optional(),
    freightId: z.number(),
    receiptNo: z.string().nullish(),
    receiptDate: z.date(),
    amount: z.coerce.number(),
    remarks: z.string().nullish(),
    partyLedgerId: z.number(),
    transactionLedgerId: z.number(),
    paymentMode: z.enum(['cash', 'cheque', 'bank_transfer', 'credit_card', 'other']),

})
export type FreightReceiptForm = z.infer<typeof freightReceiptSchema>
