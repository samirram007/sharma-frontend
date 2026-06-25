import { z } from 'zod';




export const countrySchema = z.object({
  id: z.number().int().positive().optional(),   // better than nullish
  name: z.string().min(1, "Country name is required"),
  phoneCode: z.string().min(1, "Phone code is required"),
  isoCode: z.string().optional(),

})
export type Country = z.infer<typeof countrySchema>
export const countryListSchema = z.array(countrySchema)
export type CountryList = z.infer<typeof countryListSchema>



export const formSchema = z
  .object({
    id: z.number().int().positive().optional(),   // better than nullish
    name: z.string().min(1, { message: 'Name is required.' }),
    phoneCode: z.string().min(1, { message: 'Phone code is required.' }),
    isoCode: z.string().nullish(),

    isEdit: z.boolean(),
  })

export type CountryForm = z.infer<typeof formSchema>