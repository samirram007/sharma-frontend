import { ActiveInactiveStatusSchema } from '@/types/active-inactive-status';

import { z } from 'zod';




export const currencySchema = z.object({
  id: z.number().int().positive().nullish(),
  name: z.string().min(1),
  code: z.string().min(1),
  symbol: z.string().min(1),
  status: ActiveInactiveStatusSchema.default('active'),
  country: z.string().optional(),
  exchangeRate: z.string().nullish(),
  decimalPlaces: z.string().optional(),
  format: z.string().optional(),
  thousandsSeparator: z.string().optional(),
  decimalSeparator: z.string().optional(),
  symbolPosition: z.string().optional(),

})
export type Currency = z.infer<typeof currencySchema>
export const currencyListSchema = z.array(currencySchema)
export type CurrencyList = z.infer<typeof currencyListSchema>



export const formSchema = z
  .object({
    id: z.number().int().positive().nullish(),
    name: z.string().min(1, { message: 'Name is required.' }),
    code: z.string().min(1, { message: 'Role is required.' }),
    symbol: z.string().min(1, { message: 'Symbol is required.' }),
    status: z.string().min(1, { message: 'Status is required.' }),
    country: z.string().optional(),
    exchangeRate: z.string().nullish(),
    decimalPlaces: z.string().optional(),
    format: z.string().optional(),
    thousandsSeparator: z.string().optional(),
    decimalSeparator: z.string().optional(),
    symbolPosition: z.string().optional(),
    isEdit: z.boolean(),
  })

export type CurrencyForm = z.infer<typeof formSchema>