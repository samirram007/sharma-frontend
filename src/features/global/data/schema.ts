import z from "zod";

export const formSchemaReportingPeriod = z.object({
    startDate: z.coerce.date().nullable(),
    endDate: z.coerce.date().nullable(),
})
export type ReportingPeriodForm = z.infer<typeof formSchemaReportingPeriod>;