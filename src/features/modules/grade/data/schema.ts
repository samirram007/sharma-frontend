import { ActiveInactiveStatusSchema } from '@/types/active-inactive-status';
import { z } from 'zod';




export const gradeSchema: z.ZodType<any> = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1),
  code: z.string().min(1),
  status: ActiveInactiveStatusSchema.default('active'),

})
export type Grade = z.infer<typeof gradeSchema>
export const gradeListSchema = z.array(gradeSchema)
export type GradeList = z.infer<typeof gradeListSchema>



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
    isEdit: z.boolean(),
  })

export type GradeForm = z.infer<typeof formSchema>