import { z } from 'zod';
import { companySchema } from '../../company/data/schema';




const baseFiscalYearSchema = z.object({
  id: z.number().int().positive().nullish(),
  name: z.string().min(1),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  status: z.string(),
  companyId: z.number().int().positive(),
  company: companySchema.nullish(),
  assessmentYear: z.string().nullish(),
});

export const fiscalYearSchema = baseFiscalYearSchema.refine((data) => data.endDate > data.startDate, {
  message: "End Date must be after Start Date",
  path: ["endDate"],
})
// .transform((data) => {
//   const startYear = data.startDate.getFullYear();
//   const endYear = data.endDate.getFullYear();

//   const assessmentYear = `${startYear}-${endYear}`;

//   return {
//     ...data,
//     assessmentYear,
//     // Convert dates back to "yyyy-MM-dd"
//     startDateFormatted: format(data.startDate, "yyyy-MM-dd"),
//     endDateFormatted: format(data.endDate, "yyyy-MM-dd"),
//   };
// });

export type FiscalYear = z.infer<typeof fiscalYearSchema>
export const fiscalYearListSchema = z.array(fiscalYearSchema)
export type FiscalYearList = z.infer<typeof fiscalYearListSchema>


export const formSchema = baseFiscalYearSchema
  .omit({ id: true })
  .extend({
    isEdit: z.boolean().default(false),
    status: z.string(),
  });


export type FiscalYearForm = z.infer<typeof formSchema>