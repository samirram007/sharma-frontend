import { ActiveInactiveStatusSchema } from '@/types/active-inactive-status';
import { z } from 'zod';




export const companyTypeSchema = z.object({
  id: z.number().int().positive().nullish(),
  name: z.string().min(1),
  code: z.string().min(1),
  description: z.string().optional(),
  status: ActiveInactiveStatusSchema.default('active'),


})
export type CompanyType = z.infer<typeof companyTypeSchema>
export const companyTypeListSchema = z.array(companyTypeSchema)
export type CompanyTypeList = z.infer<typeof companyTypeListSchema>



export const formSchema = z
  .object({
    name: z
      .string()
      .min(1, { message: 'Name is required.' }),
    code: z
      .string()
      .min(1, { message: 'Role is required.' }),
    status: z
      .string()
      .min(1, { message: 'Status is required.' }),
    description: z.string().min(1, { message: 'Description is required.' }),

    isEdit: z.boolean(),
  })

export type CompanyForm = z.infer<typeof formSchema>