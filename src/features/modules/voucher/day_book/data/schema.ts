import { voucherTypeSchema } from '@/features/modules/voucher_type/data/schema';
import { z } from 'zod';
import { voucherSchema } from '../../data-schema/voucher-schema';
import { companySchema } from '@/features/modules/company/data/schema';
import { fiscalYearSchema } from '@/features/modules/fiscal_year/data/schema';

export const voucherReferenceSchema = z.object({
  id: z.number().int().positive().nullish(),
  voucherId: z.number().int().positive().nullish(),
  refVoucherId: z.number().int().positive().nullish(),
  type: z.string().nullable(),
})

export const dayBookSchema = voucherSchema.extend({
  voucherType: voucherTypeSchema,
  company: companySchema.nullish(),
  fiscalYear: fiscalYearSchema.nullish(),
  referencedBy: z.array(voucherReferenceSchema).nullish(),
  paymentStatus: z.string().nullish(),
});

export type DayBookSchema = z.infer<typeof dayBookSchema>

export const dayBookListSchema = z.array(dayBookSchema)
export type DayBookList = z.infer<typeof dayBookListSchema>


export const formSchema = dayBookSchema.extend({
  isEdit: z.boolean(),
}).omit({ id: true, company: true, fiscalYear: true, voucherType: true });
export type DayBookForm = z.infer<typeof formSchema>