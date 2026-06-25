import { z } from 'zod';



export const partySchema = z.object({
  id: z.number().int().positive().nullish(),
  name: z.string().min(1).nullish(),
  code: z.string().min(1).nullish(),
  gstin: z.string().min(1).nullish(),
  pan: z.string().min(1).nullish(),
  contactPerson: z.string().min(1).nullish(),
  contactNo: z.string().min(1).nullish(),
  phone: z.string().min(1).nullish(),
  email: z.string().min(1).nullish(),


})

export type PartyForm = z.infer<typeof partySchema>

export const partyLedgerFormSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1),
  code: z.string().min(1),
  accountGroupId: z.number().int().nullish(),
  accountBalance: z.coerce.number().nullish(),
  ledgerableId: z.number().int().nullish(),
  ledgerableType: z.string().nullish(),
  ledgerable: partySchema.nullish(),
})
export type PartyLedgerForm = z.infer<typeof partyLedgerFormSchema>
export type PartyLedger = z.infer<typeof partyLedgerFormSchema>

export const partyListSchema = z.array(partyLedgerFormSchema)
export type PartyList = z.infer<typeof partyLedgerFormSchema>

