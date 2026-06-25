import { z } from 'zod';
import { countrySchema } from '../../country/data/schema';




export const stateSchema = z.object({
  id: z.number().int().positive().nullish(),
  name: z.string().min(1),
  code: z.string().min(1),
  gstCode: z.string().nullish(),
  countryId: z.number().int(),
  country: countrySchema.nullish(),

})
export type State = z.infer<typeof stateSchema>
export const stateListSchema = z.array(stateSchema)
export type StateList = z.infer<typeof stateListSchema>



export const formSchema = z
  .object({
    id: z.number().int().positive().nullish(),
    name: z
      .string()
      .min(1, { message: 'Name is required.' }),
    code: z
      .string()
      .min(1, { message: 'code is required.' }),
    gstCode: z.string().nullish(),
    countryId: z
      .number().int()
      .min(1, { message: 'Country is required' }),
    isEdit: z.boolean(),
  })

export type StateForm = z.infer<typeof formSchema>