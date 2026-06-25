import { z } from 'zod';
import { accountNatureSchema } from '../../account_nature/data/schema';



const accountGroupStatusSchema = z.union([
  z.literal('active'),
  z.literal('inactive'),])
export type accountGroupStatus = z.infer<typeof accountGroupStatusSchema>


export const accountGroupSchema: z.ZodType<any> = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1),
  code: z.string().min(1),
  description: z.string().optional(),
  status: accountGroupStatusSchema,
  parentId: z.number().int().positive().optional().nullish(),
  parent: z.lazy(() => accountGroupSchema).optional().nullish(),
  accountNatureId: z.number().int().positive(),
  accountNature: accountNatureSchema
})
export type AccountGroup = z.infer<typeof accountGroupSchema>

export const accountGroupListSchema = z.array(accountGroupSchema)
export type AccountGroupList = z.infer<typeof accountGroupListSchema>


export const formSchema = z
  .object({
    name: z
      .string()
      .min(1, { message: 'Name is required.' }),
    code: z
      .string()
      .min(1, { message: 'Role is required.' }),
    status: z
      .string()
      .min(1, { message: 'Status is required.' }),
    accountNatureId: z.number().int().positive().min(1, { message: 'Account Nature ID is required.' }),
    description: z.string().min(1, { message: 'Description is required.' }),
    parentId: z.number().int().positive().optional().nullish(),
    parent: z.lazy(() => accountGroupSchema).optional().nullish(),
    isEdit: z.boolean(),
  })