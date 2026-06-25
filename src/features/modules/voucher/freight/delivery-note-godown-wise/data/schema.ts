// Re-export the godown-wise schema from zone-wise (it shares the same definition)
export type {
  GodownWiseReportItem,
  GodownWiseApiResponse,
  VoucherDetail,
} from '../../zone-wise/data/schema'

export {
  GodownWiseReportItemSchema,
  GodownWiseReportSchema,
  GodownWiseApiResponseSchema,
  VoucherDetailSchema,
} from '../../zone-wise/data/schema'
