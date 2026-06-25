import { z } from 'zod';
import { countrySchema } from '../../country/data/schema';
import { stateSchema } from '../../state/data/schema';




export const addressSchema: z.ZodType<any> = z.object({
  id: z.number().int().positive().nullish(),
  line1: z.string().nullable().optional(),
  line2: z.string().nullable().optional(),
  landmark: z.string().nullable().optional(),
  postOffice: z.string().nullable().optional(),
  district: z.string().nullable().optional(),
  city: z.string().nullable().optional(),
  stateId: z.number().nullish(),
  countryId: z.number().nullish(),
  state: stateSchema.nullable().optional(),
  country: countrySchema.nullable().optional(),
  postalCode: z.string().nullable().optional(),
  latitude: z.string().nullable().optional(),
  longitude: z.string().nullable().optional(),
  addressType: z.string().nullable().optional(),
  isPrimary: z.coerce.boolean().nullable().optional(),
  addressable: z.object({
    addressableId: z.number().nullish(),
    addressableType: z.string().nullish(),
  }).nullable().optional()
})
export type Address = z.infer<typeof addressSchema>
export const addressListSchema = z.array(addressSchema)
export type AddressList = z.infer<typeof addressListSchema>



export const formSchema = z
  .object({
    line1: z.string(),
    line2: z.string().nullable().optional(),
    landmark: z.string().nullable().optional(),
    postOffice: z.string().nullable().optional(),
    district: z.string().nullable().optional(),
    city: z.string().nullable().optional(),
    stateId: z.number().nullish(),
    countryId: z.number().nullish(),
    country: countrySchema.nullable().optional(),
    state: stateSchema.nullable().optional(),
    postalCode: z.string({ message: 'Postal code is required.' })
      .max(6, { message: 'Postal code must be at most 6 characters long.' })
      .nullable().optional(),
    latitude: z.string().nullable().optional(),
    longitude: z.string().nullable().optional(),
    addressType: z.string().nullable().optional(),
    isPrimary: z.coerce.boolean().nullable().optional(),
    addressable: z.object({
      addressableId: z.number().nullish(),
      addressableType: z.number().nullish(),
    }),
    isEdit: z.boolean(),
  })

export type AddressForm = z.infer<typeof formSchema>