import { z } from 'zod';

const accountingEffectsSchema = z.union([
  z.literal('debit'),
  z.literal('credit'),
])
export type accountingEffects = z.infer<typeof accountingEffectsSchema>

const accountNatureStatusSchema = z.union([
  z.literal('active'),
  z.literal('inactive'),])
export type accountNatureStatus = z.infer<typeof accountNatureStatusSchema>


export const accountNatureSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1),
  code: z.string().min(1),
  description: z.string().optional(),
  status: accountNatureStatusSchema,
  accountingEffect: accountingEffectsSchema.optional(),

})
export type AccountNature = z.infer<typeof accountNatureSchema>
export const accountNatureListSchema = z.array(accountNatureSchema)
export type AccountNatureList = z.infer<typeof accountNatureListSchema>



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
    accountingEffect: z
      .string()
      .min(1, { message: 'Accounting effect is required.' })
      .optional(),
    isEdit: z.boolean(),
  })

export type AccountNatureForm = z.infer<typeof formSchema>