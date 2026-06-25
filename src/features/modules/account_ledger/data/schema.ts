import { z } from 'zod';
import { accountGroupSchema } from '../../account_group/data/schema';



const accountLedgerStatusSchema = z.union([
  z.literal('active'),
  z.literal('inactive'),])
export type accountLedgerStatus = z.infer<typeof accountLedgerStatusSchema>


export const accountLedgerSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1),
  code: z.string().min(1),
  description: z.string().nullish(),
  status: accountLedgerStatusSchema,
  accountGroupId: z.coerce.number().int().positive(),
  accountGroup: accountGroupSchema.nullish(),
  ledgerableId: z.number().nullish(),
  ledgerableType: z.string().nullish(),
  ledgerable: z.any().nullish(),
})
export type AccountLedger = z.infer<typeof accountLedgerSchema>

export const accountLedgerListSchema = z.array(accountLedgerSchema)
export type AccountLedgerList = z.infer<typeof accountLedgerListSchema>


export const formSchema = z
  .object({
    name: z.string().min(1, { message: 'Name is required.' }),
    code: z.string().min(1, { message: 'Role is required.' }),
    status: z.string().min(1, { message: 'Status is required.' }),
    accountGroupId: z.coerce.number().int().positive().min(1, { message: 'Account Group ID is required.' }),

    description: z.string().min(1, { message: 'Description is required.' }),
    isEdit: z.boolean(),
  })

export type AccountLedgerForm = z.infer<typeof formSchema>