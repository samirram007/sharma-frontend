import { z } from 'zod'

// ── Shared detail entry ──

export const VoucherDetailSchema = z.object({
  voucherId: z.number(),
  voucherNo: z.string(),
  voucherDate: z.string().nullable(),
  partyName: z.string().nullable(),
  itemId: z.number().nullable(),
  itemName: z.string().nullable(),
  unitCode: z.string().nullable(),
  unitName: z.string().nullable(),
  noOfDecimalPlaces: z.number().nullable(),
  movementType: z.string(),
  actualQuantity: z.number(),
  billingQuantity: z.number(),
  amount: z.number(),
  godownName: z.string(),
  carrierName: z.string().nullable(),
  motorVehicleNo: z.string().nullable(),
  dispatchedThrough: z.string().nullable(),
  source: z.string().nullable(),
  destination: z.string().nullable(),
  billOfLadingNo: z.string().nullable(),
  billOfLadingDate: z.string().nullable(),
  receiptDocNo: z.string().nullable(),
  weight: z.number(),
  volume: z.number(),
  paymentStatus: z.string().nullable(),
})

export type VoucherDetail = z.infer<typeof VoucherDetailSchema>

// ── Godown-wise report ──

export const GodownWiseReportItemSchema = z.object({
  godownId: z.number(),
  godownName: z.string(),
  godownCode: z.string(),
  totalEntries: z.number(),
  totalInwardQuantity: z.number(),
  totalOutwardQuantity: z.number(),
  totalClosingQuantity: z.number(),
  totalInwardBillingQuantity: z.number(),
  totalOutwardBillingQuantity: z.number(),
  totalBillingClosingQuantity: z.number(),
  totalAmount: z.number(),
  voucherDetails: z.array(VoucherDetailSchema),
})

export type GodownWiseReportItem = z.infer<typeof GodownWiseReportItemSchema>

export const GodownWiseReportSchema = z.array(GodownWiseReportItemSchema)

// ── Zone-wise report ──

export const ZoneWiseReportItemSchema = z.object({
  zoneId: z.number().nullable(),
  zoneName: z.string(),
  zoneCode: z.string().nullable(),
  totalEntries: z.number(),
  totalInwardQuantity: z.number(),
  totalOutwardQuantity: z.number(),
  totalClosingQuantity: z.number(),
  totalInwardBillingQuantity: z.number(),
  totalOutwardBillingQuantity: z.number(),
  totalBillingClosingQuantity: z.number(),
  totalAmount: z.number(),
  godownDetails: z.array(VoucherDetailSchema),
})

export type ZoneWiseReportItem = z.infer<typeof ZoneWiseReportItemSchema>

export const ZoneWiseReportSchema = z.array(ZoneWiseReportItemSchema)

// ── API response wrapper (from SuccessCollection) ──

export const ApiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.literal(true),
    code: z.number(),
    message: z.string(),
    data: dataSchema,
  })

// ── Pre-built API response schemas ──

export const GodownWiseApiResponseSchema = ApiResponseSchema(
  GodownWiseReportSchema,
)
export type GodownWiseApiResponse = z.infer<typeof GodownWiseApiResponseSchema>

export const ZoneWiseApiResponseSchema = ApiResponseSchema(ZoneWiseReportSchema)
export type ZoneWiseApiResponse = z.infer<typeof ZoneWiseApiResponseSchema>
