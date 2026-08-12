import { ActiveInactiveStatusSchema } from '@/types/active-inactive-status'
import { z } from 'zod'
import { addressSchema } from '../../address/data/schema'

export const godownSchema: z.ZodType<any> = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1),
  code: z.string().min(1),
  description: z.string().nullish(),
  status: ActiveInactiveStatusSchema.default('active'),
  parentId: z.number().int().positive().optional().nullish(),
  parent: z
    .lazy(() => godownSchema)
    .optional()
    .nullish(),
  address: z
    .lazy(() => addressSchema)
    .nullable()
    .nullish(),
  storageUnitType: z.string().default('GODOWN'),
  ourStockWithThirdParty: z.boolean(),
  thirdPartyStockWithUs: z.boolean(),
})
export type Godown = z.infer<typeof godownSchema>
export const godownListSchema = z.array(godownSchema)
export type GodownList = z.infer<typeof godownListSchema>

export const formSchema = z.object({
  name: z.string().min(1, { message: 'Name is required.' }),
  code: z.string().min(1, { message: 'Role is required.' }),
  status: z.string().min(1, { message: 'Status is required.' }),
  parentId: z.number().int().positive().optional().nullish(),
  description: z.string().nullish(),
  address: z
    .lazy(() => addressSchema)
    .nullable()
    .nullish(),
  storageUnitType: z.string().default('GODOWN'),
  ourStockWithThirdParty: z.boolean(),
  thirdPartyStockWithUs: z.boolean(),
  isEdit: z.boolean(),
})

export type GodownForm = z.infer<typeof formSchema>
