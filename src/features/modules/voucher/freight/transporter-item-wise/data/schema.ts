import { z } from 'zod'

// ── Flat entry row (one per stock journal entry per voucher per transporter) ──

export const TransporterItemEntrySchema = z.object({
  voucherId: z.number(),
  voucherNo: z.string(),
  voucherDate: z.string().nullable(),
  partyName: z.string(),
  source: z.string(),
  destination: z.string(),
  vehicleNumber: z.string(),
  carrierName: z.string(),
  itemName: z.string(),
  unitCode: z.string(),
  noOfDecimalPlaces: z.number(),
  actualQuantity: z.number(),
  billingQuantity: z.number(),
  amount: z.number(),
  paymentStatus: z.string(),
  totalFare: z.number(),
})

export type TransporterItemEntry = z.infer<typeof TransporterItemEntrySchema>

// ── Transporter grouping with flat entry list ──

export const TransporterItemWiseItemSchema = z.object({
  transporterName: z.string(),
  vehicleNumber: z.string(),
  totalVouchers: z.number(),
  totalQuantity: z.number(),
  totalAmount: z.number(),
  entries: z.array(TransporterItemEntrySchema),
})

export type TransporterItemWiseItem = z.infer<
  typeof TransporterItemWiseItemSchema
>

export const TransporterItemWiseSchema = z.array(TransporterItemWiseItemSchema)

// ── API response wrapper ──

export const ApiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.literal(true),
    code: z.number(),
    message: z.string(),
    data: dataSchema,
  })

export const TransporterItemWiseApiResponseSchema = ApiResponseSchema(
  TransporterItemWiseSchema,
)
export type TransporterItemWiseApiResponse = z.infer<
  typeof TransporterItemWiseApiResponseSchema
>
