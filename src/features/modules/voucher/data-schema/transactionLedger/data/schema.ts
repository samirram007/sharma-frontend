import { z } from 'zod';




export const transactionableStockItemSchema = z.object({
  id: z.number().int().positive().nullish(),
  name: z.string().min(1).nullish(),
  code: z.string().min(1).nullish(),
  description: z.string().min(1).nullish(),
  unitId: z.number().int().nullish(),
  rate: z.coerce.number().nullish(),
})

export type PurchasableStockItemForm = z.infer<typeof transactionableStockItemSchema>



export type PurchasableStockItem = z.infer<typeof transactionableStockItemSchema>
export const transactionableStockItemListSchema = z.array(transactionableStockItemSchema)
export type PurchasableStockItemList = z.infer<typeof transactionableStockItemListSchema>

