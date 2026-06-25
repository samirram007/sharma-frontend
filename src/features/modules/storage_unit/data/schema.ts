import { z } from 'zod'



import { addressSchema } from '../../address/data/schema'
import { ActiveInactiveStatusSchema } from '@/types/active-inactive-status'
import { stockUnitSchema } from '../../stock_unit/data/schema'

export const storageunitSchema = z.object({
  id: z.number().int().positive().nullish(),
  name: z.string().min(1),
  code: z.string().nullish(),
  description: z.string().nullish(),
  status: ActiveInactiveStatusSchema.default('active'),
  icon: z.string().nullish(),
  storageUnitType: z.string().nullish(),
  storageUnitCategory: z.string().nullish(),
  parentId: z.number().int().positive().nullish(),
  isVirtual: z.boolean(),
  isMobile: z.boolean(),
  capacityValue: z.number().int().positive().nullish(),
  capacityUnitId: z.number().int().positive().nullish(),
  temperatureMin: z.number().nullish(),
  temperatureMax: z.number().nullish(),
  ourStockWithThirdParty: z.boolean(),
  thirdPartyStockWithUs: z.boolean(),
  parent: z.any().optional().nullable(),
  capacityUnit: z
    .lazy(() => stockUnitSchema)
    .nullable()
    .nullish(),


  address: z
    .lazy(() => addressSchema)
    .nullable()
    .nullish(),


})
export type StorageUnit = z.infer<typeof storageunitSchema>
export const storageUnitListSchema = z.array(storageunitSchema)
export type StorageUnitList = z.infer<typeof storageUnitListSchema>

export const formSchema = storageunitSchema.extend({

  parent: z.lazy(() => storageunitSchema).optional().nullish(),
  isEdit: z.boolean(),
}).omit({ id: true })

export type StorageUnitForm = z.infer<typeof formSchema>


// {
//     "data": [
//         {
//             "id": 1,
//             "name": "Main Storage Unit",
//             "code": "SU-1",
//             "description": "Main Storage Unit Description",
//             "status": "active",
//             "icon": "fas fa-box",
//             "storageUnitType": "FACILITY",
//             "storageUnitCategory": "PHYSICAL",
//             "parentId": null,
//             "isVirtual": false,
//             "isMobile": false,
//             "capacityValue": null,
//             "capacityUnitId": null,
//             "temperatureMin": null,
//             "temperatureMax": null,
//             "ourStockWithThirdParty": false,
//             "thirdPartyStockWithUs": false,
//             "parent": null,
//             "capacityUnit": null
//         }
//     ],
//     "status": true,
//     "code": 200,
//     "message": "Records fetched successfully (1 record(s))"
// }