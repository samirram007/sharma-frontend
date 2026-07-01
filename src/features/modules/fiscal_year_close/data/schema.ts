import { z } from 'zod'

export const closePreviewSchema = z.object({
  fiscalYear: z.object({
    id: z.number(),
    name: z.string(),
    startDate: z.string(),
    endDate: z.string(),
  }),
  totalVouchers: z.number(),
  totalLedgersWithBalance: z.number(),
  totalStockItems: z.number(),
  totalGodowns: z.number(),
  isClosed: z.boolean(),
})

export type ClosePreview = z.infer<typeof closePreviewSchema>

export const closeResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  closingAccountVoucherId: z.number().optional(),
  closingStockVoucherId: z.number().optional(),
})

export type CloseResponse = z.infer<typeof closeResponseSchema>
