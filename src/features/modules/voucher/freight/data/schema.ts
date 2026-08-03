
import { z } from 'zod';
import { deliveryNoteSchema } from '../../delivery_note/data/schema';
import { voucherSchema } from '../../data-schema/voucher-schema';
import { companySchema } from '@/features/modules/company/data/schema';
import { accountLedgerSchema } from '@/features/modules/account_ledger/data/schema';
import { voucherTypeSchema } from '@/features/modules/voucher_type/data/schema';

export const freightSchema = deliveryNoteSchema.extend({
  // Add any additional fields specific to Freight if necessary
  voucherReferences: z.array(z.object({
    id: z.number().int().positive().nullish(),
    voucherId: z.number().int().positive().nullish(),
    refVoucherId: z.number().int().positive().nullish(),
    voucher: z.lazy(() => voucherSchema.nullish()),
    referenceVoucher: z.lazy(() => voucherSchema.nullish()),
  })),
  company: companySchema.nullish(),
});

export type FreightSchema = z.infer<typeof freightSchema>

export const freightListSchema = z.array(freightSchema)
export type FreightListSchema = z.infer<typeof freightListSchema>

// Dipika Starting

export const ledgerSchema = z.object({
  id: z.number().int().positive().nullish(),
  name: z.string(),
  code: z.string(),
  currentBalance: z.number().optional(),
});

const voucherEntrySchema = z.object({
  id: z.number().int().positive().nullish(),
  entryOrder: z.number().int().positive().nullish(),
  debit: z.string(),
  credit: z.string(),
  accountLedger: accountLedgerSchema,
});

export const voucherReferenceSchema = z.lazy(() =>
  z.object({
    id: z.number().int().positive().nullish(),
    voucherId: z.number().int().positive().nullish(),
    refVoucherId: z.number().int().positive().nullish(),
    voucher: voucherSchema.nullish(),
    referenceVoucher: voucherSchema.nullish(),
    type: z.string().nullable(),
  })
);

export const freightVoucherBaseSchema = z.object({
  id: z.number().int().positive().nullish(),
  voucherNo: z.string(),
  voucherDate: z.string(),
  referenceNo: z.string().nullable(),
  referenceDate: z.string().nullable(),
  module: z.literal("freight"),
  remarks: z.string().nullable(),
  status: z.string(),
  amount: z.number(),
  paymentStatus: z.string(),
  company: companySchema.nullish(),
  partyLedger: accountLedgerSchema.nullish(),
  voucherEntries: z.array(voucherEntrySchema),
  voucherType: voucherTypeSchema.nullish(),
});

export const freightVoucherSchema = z.lazy(() =>
  freightVoucherBaseSchema.extend({
    voucherReferences: z.array(voucherReferenceSchema).optional(),
  })
);

export const freightVoucherListSchema = z.array(freightVoucherSchema);

export type FreightVoucherSchema = z.infer<typeof freightVoucherSchema>;
export type FreightVoucherListSchema = z.infer<typeof freightVoucherListSchema>;


// Dipika Ending

export const formSchema = z.object({
  deliveryNoteId: z.number().int().positive().nullish(),
  transporter: z.string().min(1),
  vehicleType: z.string().min(1),
  vehicleNumber: z.string().min(1),
  source: z.string().min(1),
  destination: z.string().min(1),
  quantity: z.coerce.number().int().positive().nullish(),
  weight: z.coerce.number().nullish(),
  weightUnitId: z.number().int().positive().nullish(),
  volume: z.coerce.number().nullish(),
  volumeUnitId: z.number().int().positive().nullish(),
  distance: z.coerce.number().nullish(),
  distanceUnitId: z.number().int().positive().nullish(),
  freightBasis: z.string().min(1),
  rate: z.coerce.number().min(0),
  rateUnitId: z.number().int().positive(),
  freightCharges: z.coerce.number().min(0),
  totalFare: z.coerce.number().min(0),
  dispatchSourceId: z.number().int().positive().nullish(),
  paymentStatus: z.string().nullish(),
  isEdit: z.boolean(),
})
export type FreightForm = z.infer<typeof formSchema>

/**
 * Minimal pagination metadata returned by the API (SuccessCollection::paginationMeta).
 * Only the fields needed for server-side pagination are exposed.
 */
export interface PaginationMeta {
  current_page: number
  last_page: number
  per_page: number
  total: number
}