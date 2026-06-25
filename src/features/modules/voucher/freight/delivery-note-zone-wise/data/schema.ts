// Re-export the same schema used by freight zone-wise report — data structure is identical
export {
  VoucherDetailSchema,
  ZoneWiseReportItemSchema,
  ZoneWiseReportSchema,
  ApiResponseSchema,
  ZoneWiseApiResponseSchema,
} from '../../zone-wise/data/schema'

export type {
  VoucherDetail,
  ZoneWiseReportItem,
  ZoneWiseApiResponse,
} from '../../zone-wise/data/schema'
