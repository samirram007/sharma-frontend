import { QuantityTypeEnum } from '@/features/enums/schema';
import { ActiveInactiveStatusSchema } from '@/types/active-inactive-status';
import { z } from 'zod';
import { uniqueQuantityCodeSchema } from '../../unique_quantity_code/data/schema';


export const stockUnitSchema: z.ZodType<any> = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1),
  code: z.string().min(1),
  description: z.string().nullish(),
  status: ActiveInactiveStatusSchema.default('active'),
  icon: z.string().nullish(),
  unitType: z.enum(['simple', 'compound']),
  quantityType: QuantityTypeEnum.optional().nullish(),
  uniqueQuantityCodeId: z.number().int().positive().optional().nullish(),
  primaryStockUnitId: z.number().int().positive().optional().nullish(),
  secondaryStockUnitId: z.number().int().positive().optional().nullish(),
  conversionFactor: z.coerce.number().min(0).optional().nullable(),
  noOfDecimalPlaces: z.coerce.number().min(0).max(6).optional().nullish(),
  primaryStockUnit: z.lazy(() => stockUnitSchema).nullish(),
  secondaryStockUnit: z.lazy(() => stockUnitSchema).nullish(),
  uniqueQuantityCode: z.lazy(() => uniqueQuantityCodeSchema).nullish(),

})

export type StockUnit = z.infer<typeof stockUnitSchema>

export const stockUnitListSchema = z.array(stockUnitSchema)
export type StockUnitList = z.infer<typeof stockUnitListSchema>


// export const formSchema = z.object({
//   name: z.string().min(1, { message: "Name is required." }),
//   code: z.string().min(1, { message: "Code is required." }),
//   status: z.string().min(1, { message: 'Status is required.' }),
//   description: z.string().nullish(),
//   icon: z.string().nullish(),
//   unitType: z.enum(["simple", "compound"]), 
//   uniqueQuantityCodeId: z.number().int().positive().optional().nullish(),
//   primaryStockUnitId: z.number().int().positive().optional().nullish(),
//   secondaryStockUnitId: z.number().int().positive().optional().nullish(),
//   conversionFactor: z.coerce.number().min(0).optional().nullish(),
//   noOfDecimalPlaces: z.coerce.number().min(0).optional().nullish(),
//   isEdit: z.boolean(),
// })


export const formSchema = z.discriminatedUnion("unitType", [
  z.object({
    unitType: z.literal("simple"),
    code: z.string().min(1, "Code is required"),
    name: z.string().min(1, "Name is required"),
    uniqueQuantityCodeId: z.number().int().positive().optional().nullish(),
    noOfDecimalPlaces: z.coerce.number().min(0).optional().nullish(),

    uniqueQuantityCode: z.lazy(() => uniqueQuantityCodeSchema).nullish(),
    isEdit: z.boolean(),
  }),
  z.object({
    unitType: z.literal("compound"),
    name: z.string(),
    code: z.string(),
    primaryStockUnitId: z.number().int().positive(),
    conversionFactor: z.coerce.number().min(0.0001),
    secondaryStockUnitId: z.number().int().positive(),
    primaryStockUnit: z.lazy(() => stockUnitSchema).nullish(),
    secondaryStockUnit: z.lazy(() => stockUnitSchema).nullish(),
    isEdit: z.boolean(),
  }),
]);

export type StockUnitForm = z.infer<typeof formSchema>