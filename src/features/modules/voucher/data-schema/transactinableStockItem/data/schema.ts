import { z } from 'zod';




export const transactionLedgerSchema = z.object({
  id: z.number().int().positive().nullish(),
  name: z.string().min(1).nullish(),
  accountGroupId: z.number().int().nullish(),
  accountBalance: z.coerce.number().nullish(),
})

export type TransactionLedgerForm = z.infer<typeof transactionLedgerSchema>



export type TransactionLedger = z.infer<typeof transactionLedgerSchema>
export const transactionLedgerListSchema = z.array(transactionLedgerSchema)
export type TransactionLedgerList = z.infer<typeof transactionLedgerListSchema>

