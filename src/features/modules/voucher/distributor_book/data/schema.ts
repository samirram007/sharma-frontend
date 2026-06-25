
import z, { boolean } from "zod";
import { voucherSchema } from "../../data-schema/voucher-schema";
import { voucherReferenceSchema } from "../../freight/data/schema";




export const distributorBookSchema = z.object({
    id: z.number().int().positive(),
    name: z.string().min(1),
    debit: z.coerce.number().nullish(),
    credit: z.coerce.number().nullish(),
    balance: z.coerce.number().nullish(),

})
export type DistributorBookSchema = z.infer<typeof distributorBookSchema>

export const distributorBookListSchema = z.array(distributorBookSchema)
export type DistributorBookList = z.infer<typeof distributorBookListSchema>

export const distributorBookDetailsSchema = voucherSchema.extend({
    voucherReferences: z.array(z.lazy(() => voucherReferenceSchema.nullish())),
    referencedBy: z.array(z.lazy(() => voucherReferenceSchema.nullish())),
    report: boolean().default(true),
})
export type DistributorBookDetailsSchema = z.infer<typeof distributorBookDetailsSchema>

export const distributorBookDetailsListSchema = z.array(distributorBookDetailsSchema)
export type DistributorBookDetailsList = z.infer<typeof distributorBookDetailsListSchema>