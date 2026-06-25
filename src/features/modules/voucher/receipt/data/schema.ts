import { voucherTypeSchema } from '@/features/modules/voucher_type/data/schema';
import { z } from 'zod';
import { voucherSchema } from '../../data-schema/voucher-schema';
import { companySchema } from '@/features/modules/company/data/schema';
import { fiscalYearSchema } from '@/features/modules/fiscal_year/data/schema';


export const receiptSchema = voucherSchema.extend({
  voucherType: voucherTypeSchema,
  company: companySchema.nullish(),
  fiscalYear: fiscalYearSchema.nullish(),

});

export type ReceiptSchema = z.infer<typeof receiptSchema>

export const receiptListSchema = z.array(receiptSchema)
export type ReceiptList = z.infer<typeof receiptListSchema>


export const formSchema = receiptSchema.extend({
  isEdit: z.boolean(),
}).omit({ id: true, company: true, fiscalYear: true, voucherType: true });
export type ReceiptForm = z.infer<typeof formSchema>