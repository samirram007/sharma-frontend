import { ActiveInactiveStatusSchema } from '@/types/active-inactive-status';
import { z } from 'zod';
import { appModuleFeatureListSchema } from '../../app_module_feature/data/schema';


export const appModuleSchema: z.ZodType<any> = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1),
  code: z.string().optional().nullish(),
  description: z.string().nullish(),
  status: ActiveInactiveStatusSchema.default('active'),
  features: z.lazy(() => appModuleFeatureListSchema).optional().nullable(),


})

export type AppModule = z.infer<typeof appModuleSchema>

export const appModuleListSchema = z.array(appModuleSchema)
export type AppModuleList = z.infer<typeof appModuleListSchema>


export const formSchema = z.object({
  name: z.string().min(1, { message: 'Name is required.' }),
  code: z.string().min(1, { message: 'Code is required.' }).nullish(),
  status: z.string().min(1, { message: 'Status is required.' }),

  description: z.string().min(1, { message: 'Description is required.' }).nullish(),

  isEdit: z.boolean(),
})