import { ActiveInactiveStatusSchema } from '@/types/active-inactive-status';
import { z } from 'zod';
import { appModuleSchema } from '../../app_module/data/schema';


export const appModuleFeatureSchema: z.ZodType<any> = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1),
  code: z.string().optional().nullish(),
  description: z.string().nullish(),
  status: ActiveInactiveStatusSchema.default('active'),
  icon: z.string().optional().nullish(),
  appModuleId: z.number().int().positive().optional().nullish(),
  appModule: z.lazy(() => appModuleSchema).optional().nullish(),
  action: z.string().nullish(),
})

export type AppModuleFeature = z.infer<typeof appModuleFeatureSchema>

export const appModuleFeatureListSchema = z.array(appModuleFeatureSchema)
export type AppModuleFeatureList = z.infer<typeof appModuleFeatureListSchema>


export const formSchema = z.object({
  name: z.string().min(1, { message: 'Name is required.' }),
  code: z.string().min(1, { message: 'Code is required.' }).nullish(),
  status: z.string().min(1, { message: 'Status is required.' }),
  appModuleId: z.coerce.number().int().positive(),
  description: z.string().min(1, { message: 'Description is required.' }).nullish(),
  icon: z.string().optional().nullish(),
  appModule: z.lazy(() => appModuleSchema).optional().nullish(),
  action: z.string().nullish(),
  isEdit: z.boolean(),
})