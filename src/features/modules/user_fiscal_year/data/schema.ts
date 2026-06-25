import { z } from 'zod';
import { fiscalYearSchema } from '../../fiscal_year/data/schema';
import { userSchema } from '../../user/data/schema';





export const userFiscalYearSchema: z.ZodType<any> = z.object({
    id: z.number().int().positive(),
    userId: z.number().int().positive(),
    fiscalYearId: z.number().int().positive(),
    user: userSchema.nullish(),
    fiscalYear: fiscalYearSchema.nullish(),

})
export type UserFiscalYear = z.infer<typeof userFiscalYearSchema>
export const userFiscalYearListSchema = z.array(userFiscalYearSchema)
export type UserFiscalYearList = z.infer<typeof userFiscalYearListSchema>



export const formSchema = z
    .object({
        userId: z.number().int().positive({ message: 'User is required.' }),
        fiscalYearId: z.number().int().positive({ message: 'Fiscal Year is required.' }),
        isEdit: z.boolean(),
    })

export type UserForm = z.infer<typeof formSchema>