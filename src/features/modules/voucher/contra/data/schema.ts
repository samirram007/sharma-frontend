import { z } from 'zod'

import { voucherSchema } from '../../data-schema/voucher-schema'

export const CONTRA_VOUCHER_TYPE_ID = 1001

export const contraVoucherSchema = voucherSchema
export type ContraVoucher = z.infer<typeof contraVoucherSchema>
export const contraVoucherListSchema = z.array(contraVoucherSchema)
export type ContraVoucherList = z.infer<typeof contraVoucherListSchema>

export const contraFormSchema = contraVoucherSchema
  .extend({
    isEdit: z.boolean().optional(),
  })
  .omit({
    id: true,
  })
export type ContraVoucherForm = z.infer<typeof contraFormSchema>

export const contraSchema = z.object({
  id: z.number().int().positive().nullish(),
  name: z.string().min(1),
  code: z.string().min(1),
})
export type Contra = z.infer<typeof contraSchema>
export const contraListSchema = z.array(contraSchema)
export type ContraList = z.infer<typeof contraListSchema>

export const formSchema = z.object({
  name: z.string().min(1, { message: 'Name is required.' }),
  code: z.string().min(1, { message: 'Role is required.' }),
  isEdit: z.boolean(),
})

export type ContraForm = z.infer<typeof formSchema>
