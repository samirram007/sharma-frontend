import { z } from 'zod'

export const godownDetailSchema = z.object({
  godownId: z.number().int().positive(),
  godownName: z.string().min(1),
  godownCode: z.string().nullable(),
  openingQuantity: z.coerce.number().nullish(),
  openingAmount: z.coerce.number().nullish(),
  inwardQuantity: z.coerce.number().nullish(),
  inwardAmount: z.coerce.number().nullish(),
  outwardQuantity: z.coerce.number().nullish(),
  outwardAmount: z.coerce.number().nullish(),
  closingQuantity: z.coerce.number().nullish(),
  closingAmount: z.coerce.number().nullish(),
  unitCode: z.string().nullable(),
  noOfDecimalPlaces: z.number().int().min(0).max(6).nullable(),
})

export type GodownDetailSchema = z.infer<typeof godownDetailSchema>

export const FreightGodownWiseListSchema = z.array(godownDetailSchema)
export type FreightGodownWiseListSchema = z.infer<
  typeof FreightGodownWiseListSchema
>
