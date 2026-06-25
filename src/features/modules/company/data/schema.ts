
import { z } from 'zod'
import { companyTypeSchema } from '../../company_type/data/schema'

import { currencySchema } from '../../currency/data/schema'

import { addressSchema } from '../../address/data/schema'
import { ActiveInactiveStatusSchema } from '@/types/active-inactive-status'

export const companySchema = z.object({
  id: z.number().int().positive().nullish(),
  name: z.string().min(1),
  mailingName: z.string().min(1),
  code: z.string().min(1),
  phoneNo: z.string().nullish(),
  mobileNo: z.string().nullish(),
  email: z.string().nullish(),
  website: z.string().nullish(),
  cinNo: z.string().nullish(),
  tinNo: z.string().nullish(),
  tanNo: z.string().nullish(),
  gstNo: z.string().nullish(),
  panNo: z.string().nullish(),
  currencyId: z.number().int().positive().nullish(),
  companyTypeId: z.number().int(),
  currency: currencySchema.nullish(),
  companyType: companyTypeSchema.nullish(),
  status: ActiveInactiveStatusSchema.default('active'),
  address: z
    .lazy(() => addressSchema)
    .nullable()
    .nullish(),
})
export type Company = z.infer<typeof companySchema>
export const companyListSchema = z.array(companySchema)
export type CompanyList = z.infer<typeof companyListSchema>

export const formSchema = z.object({
  name: z.string().min(1, { message: 'Name is required.' }),
  code: z.string().min(1, { message: 'Code is required.' }),
  mailingName: z.string().min(1, { message: 'Mailing Name is required.' }),

  status: z.string().min(1, { message: 'Status is required.' }),
  companyTypeId: z
    .number()
    .int()
    .min(1, { message: 'Company Type is required' }),
  phoneNo: z.string().nullish(),
  mobileNo: z.string().nullish(),
  email: z.string().nullish(),
  website: z.string().nullish(),
  cinNo: z.string().nullish(),
  tinNo: z.string().nullish(),
  tanNo: z.string().nullish(),
  gstNo: z.string().nullish(),
  panNo: z.string().nullish(),
  address: z
    .lazy(() => addressSchema)
    .nullable()
    .nullish(),
  currencyId: z.number().int().positive().nullish(),
  isEdit: z.boolean(),
})

export type CompanyForm = z.infer<typeof formSchema>