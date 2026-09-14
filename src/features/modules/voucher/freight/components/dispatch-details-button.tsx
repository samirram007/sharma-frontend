import { useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { Resolver } from 'react-hook-form'
import VoucherDispatchDetail02 from './voucher-dispatch-detail02'
import FreightProvider from '../contexts/freight-context'
import { voucherDispatchDefaultValues } from '../../delivery_note/data/data'
import { formSchema, type FreightForm } from '../data/schema'
import { resolveDispatchWeight } from '../../shared/dispatch-defaults'
import type { VoucherDispatchDetailForm } from '@/features/modules/voucher/data-schema/voucher-schema'
import type { VoucherSchema } from '@/features/modules/voucher/data-schema/voucher-schema'

type DispatchDetailsButtonProps = {
  /** The delivery note (or any voucher with dispatch detail) to edit. */
  data: VoucherSchema
  /** Labeled trigger text; defaults to the compact "D" icon-style button. */
  triggerLabel?: string
}

/**
 * Self-contained "Dispatch Details" trigger for contexts outside the Freight
 * grid (e.g. the delivery note summary dialog). It builds the FreightForm the
 * dispatch editor expects straight from the voucher's dispatch detail and
 * supplies the FreightProvider the editor's section-visibility config lives in.
 *
 * Save persists via the voucher_dispatch_details API and invalidates the
 * freight queries; callers should refresh their own lists on close if needed.
 */
const DispatchDetailsButton = ({
  data,
  triggerLabel,
}: DispatchDetailsButtonProps) => {
  const defaultValues = useMemo<FreightForm>(() => {
    const dd = data.voucherDispatchDetail
    return {
      deliveryNoteId: data.id ?? null,
      transporter: dd?.carrierName ?? '',
      vehicleType: dd?.dispatchedThrough ?? '',
      vehicleNumber: dd?.motorVehicleNo ?? '',
      source:
        dd?.source ??
        data.stockJournal?.stockJournalEntries?.[0]
          ?.stockJournalGodownEntries?.[0]?.godown?.name ??
        '',
      destination: dd?.destination ?? '',
      quantity: dd?.quantity ?? null,
      // No saved weight → default to the calculated weight (sum of the stock
      // journal entries' actual quantities), matching the freight grid's
      // Bill cell so the dialog opens with the note's computed weight.
      weight: resolveDispatchWeight(data),
      weightUnitId: dd?.weightUnitId ?? 16,
      volume: dd?.volume ?? 0,
      volumeUnitId: dd?.volumeUnitId ?? 10,
      distance: dd?.distance ?? null,
      distanceUnitId: 2,
      freightBasis: dd?.freightBasis ?? 'weight',
      rate: dd?.rate ?? 0,
      rateUnitId: dd?.rateUnitId ?? 16,
      loadingCharges: dd?.loadingCharges ?? 0,
      unloadingCharges: dd?.unloadingCharges ?? 0,
      packingCharges: dd?.packingCharges ?? 0,
      insuranceCharges: dd?.insuranceCharges ?? 0,
      otherCharges: dd?.otherCharges ?? 0,
      discount: dd?.discount ?? 0,
      freightCharges: dd?.freightCharges ?? 0,
      totalFare: dd?.totalFare ?? 0,
      dispatchSourceId:
        data.stockJournal?.stockJournalEntries?.[0]
          ?.stockJournalGodownEntries?.[0]?.godownId ?? null,
      paymentStatus: null,
      isEdit: true,
    }
  }, [data])

  const form = useForm<FreightForm>({
    resolver: zodResolver(formSchema) as Resolver<FreightForm>,
    defaultValues,
  })

  const voucherDispatchDefaultValuesWithVoucher =
    useMemo<VoucherDispatchDetailForm>(() => {
      const dd = data.voucherDispatchDetail
      return {
        ...voucherDispatchDefaultValues,
        ...(dd ?? {}),
        voucherId: data.id ?? null,
      }
    }, [data])

  return (
    <FreightProvider>
      <VoucherDispatchDetail02
        form={form}
        voucherDispatchDefaultValues={voucherDispatchDefaultValuesWithVoucher}
        triggerLabel={triggerLabel}
      />
    </FreightProvider>
  )
}

export default DispatchDetailsButton
