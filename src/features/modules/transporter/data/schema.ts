import { ActiveInactiveStatusSchema } from '@/types/active-inactive-status';
import { z } from 'zod';
import { accountLedgerSchema } from '../../account_ledger/data/schema';
import { addressSchema } from '../../address/data/schema';




export const transporterSchema: z.ZodType<any> = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1),
  code: z.string().nullish(),
  gstin: z.string().nullish(),
  pan: z.string().nullish(),
  licenseNo: z.string().nullish(),
  vehicleType: z.string().nullish(),
  contactPerson: z.string().nullish(),
  contactNo: z.string().nullish(),
  phone: z.string().nullish(),
  email: z.string().nullish(),
  status: ActiveInactiveStatusSchema.default('active'),
  accountLedger: z.lazy(() => accountLedgerSchema).optional().nullish(),
  address: z.lazy(() => addressSchema).nullable().nullish(),

})
export type Transporter = z.infer<typeof transporterSchema>
export const transporterListSchema = z.array(transporterSchema)
export type TransporterList = z.infer<typeof transporterListSchema>



export const formSchema = z
  .object({
    name: z.string().min(1, { message: 'Name is required.' }),
    code: z.string(),
    status: z.string().min(1, { message: 'Status is required.' }),
    gstin: z.string().nullish(),
    pan: z.string().nullish(),
    licenseNo: z.string().nullish(),
    vehicleType: z.string().nullish(),
    contactPerson: z.string().nullish(),
    contactNo: z.string().nullish(),
    phone: z.string().nullish(),
    email: z.string().nullish(),
    accountGroupId: z.coerce.number().nullish(),
    accountLedger: accountLedgerSchema.optional().nullish(),
    address: addressSchema.optional().nullish(),

    isEdit: z.boolean(),
  })

export type TransporterForm = z.infer<typeof formSchema>