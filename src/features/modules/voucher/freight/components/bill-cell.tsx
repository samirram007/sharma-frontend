import { useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { lowerCase } from 'lodash'
import { formSchema } from '../data/schema'
import { useFreightMutation } from '../data/queryOptions'
import { computeFare } from '../../shared/freight-fare'
import { resolveDispatchWeight } from '../../shared/dispatch-defaults'
import { useFreight } from '../contexts/freight-context'
import { voucherDispatchDefaultValues } from '../../delivery_note/data/data'
import VoucherDispatchDetail01 from './voucher-dispatch-detail01'
import VoucherDispatchDetail02 from './voucher-dispatch-detail02'
import type { FreightForm, FreightSchema } from '../data/schema'
import type { VoucherSchema } from '../../data-schema/voucher-schema'
import type { CellContext } from '@tanstack/react-table'
import type { Resolver } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Form } from '@/components/ui/form'

export default function BillCell({ row }: CellContext<VoucherSchema, unknown>) {
  const data = row.original
  const { config, openPrint } = useFreight()
  const { mutate: saveFreight, isPending } = useFreightMutation()

  // Defaults for the Dispatch Details dialog: the saved dispatch detail wins,
  // but null fields must NOT override the base defaults' unit ids (e.g.
  // weightUnitId 16 / rateUnitId 10) — stripping nulls keeps weight, rate and
  // units reading correctly when the dialog opens on a partially filled row.
  const dispatchDefaults = useMemo(() => {
    const dd = data.voucherDispatchDetail as
      | (Record<string, unknown> & { voucherId?: number | null })
      | null
      | undefined
    const cleaned = dd
      ? Object.fromEntries(Object.entries(dd).filter(([, v]) => v !== null))
      : {}
    return {
      ...voucherDispatchDefaultValues,
      voucherId: dd?.voucherId ?? data.id,
      ...cleaned,
    }
  }, [data])

  const form = useForm<FreightForm>({
    resolver: zodResolver(formSchema) as Resolver<FreightForm>,
    defaultValues: {
      deliveryNoteId: data.id,
      transporter: data.voucherDispatchDetail?.carrierName || '',
      source:
        data.voucherDispatchDetail?.source ||
        data.stockJournal?.stockJournalEntries?.[0]
          ?.stockJournalGodownEntries?.[0]?.godown?.name ||
        '',
      destination: data.voucherDispatchDetail?.destination || '',
      distance: data.voucherDispatchDetail?.distance || 0,
      vehicleNumber: data.voucherDispatchDetail?.motorVehicleNo || '',
      weight: resolveDispatchWeight(data),
      weightUnitId: data.voucherDispatchDetail?.weightUnitId || 16,
      volume: data.voucherDispatchDetail?.volume || 0,
      volumeUnitId: data.voucherDispatchDetail?.volumeUnitId || 10,
      freightBasis: data.voucherDispatchDetail?.freightBasis || 'weight',
      rate: data.voucherDispatchDetail?.rate || 0,
      rateUnitId: data.voucherDispatchDetail?.rateUnitId || 16,
      loadingCharges: data.voucherDispatchDetail?.loadingCharges || 0,
      unloadingCharges: data.voucherDispatchDetail?.unloadingCharges || 0,
      packingCharges: data.voucherDispatchDetail?.packingCharges || 0,
      insuranceCharges: data.voucherDispatchDetail?.insuranceCharges || 0,
      otherCharges: data.voucherDispatchDetail?.otherCharges || 0,
      discount: data.voucherDispatchDetail?.discount || 0,
      freightCharges: data.voucherDispatchDetail?.freightCharges || 0,
      totalFare: data.voucherDispatchDetail?.totalFare || 0,
      dispatchSourceId:
        data.stockJournal?.stockJournalEntries?.[0]
          ?.stockJournalGodownEntries?.[0]?.godownId || null,
      isEdit: false,
    },
  })

  const distance = form.watch('distance')
  const volume = form.watch('volume')
  const weight = form.watch('weight')
  const freightBasis = form.watch('freightBasis')
  const rate = form.watch('rate')
  const loadingCharges = form.watch('loadingCharges')
  const unloadingCharges = form.watch('unloadingCharges')
  const packingCharges = form.watch('packingCharges')
  const insuranceCharges = form.watch('insuranceCharges')
  const otherCharges = form.watch('otherCharges')
  const discount = form.watch('discount')

  // Total fare = base fare (weight/volume/distance × rate) + additional
  // charges − discount — mirrors computeFare in shared/freight-fare (rounded
  // to 2dp, floored at 0) so the Freight Bill and its print match the
  // Dispatch Details calculator exactly.
  useEffect(() => {
    const base =
      lowerCase(freightBasis) === 'distance'
        ? (Number(distance) || 0) * (Number(rate) || 0)
        : lowerCase(freightBasis) === 'volume'
          ? (Number(volume) || 0) * (Number(rate) || 0)
          : (Number(weight) || 0) * (Number(rate) || 0)

    const additional =
      (Number(loadingCharges) || 0) +
      (Number(unloadingCharges) || 0) +
      (Number(packingCharges) || 0) +
      (Number(insuranceCharges) || 0) +
      (Number(otherCharges) || 0)

    // Weight basis: computeFare is authoritative (base = weight × rate and it
    // floors at 0 + rounds to 2dp). Distance/volume: same formula with that
    // basis's multiplier, since computeFare derives its base from weight.
    const totalFare =
      lowerCase(freightBasis) === 'weight'
        ? computeFare({
            rate,
            weight,
            loadingCharges,
            unloadingCharges,
            packingCharges,
            insuranceCharges,
            otherCharges,
            discount,
          }).totalFare
        : Math.max(0, base + additional - (Number(discount) || 0))

    form.setValue('freightCharges', base)
    form.setValue('totalFare', Math.round(totalFare * 100) / 100)
  }, [
    distance,
    weight,
    volume,
    freightBasis,
    rate,
    loadingCharges,
    unloadingCharges,
    packingCharges,
    insuranceCharges,
    otherCharges,
    discount,
    form,
  ])

  // When the row's dispatch details change — e.g. after saving via the "D"
  // dialog (which invalidates + refetches the grid) — sync the freight bill
  // form so the Freight Bill and its print use the freshly saved fare,
  // additional charges and discount instead of stale mount-time values.
  useEffect(() => {
    const dd = data.voucherDispatchDetail
    if (!dd) return

    const sync: Array<{ field: keyof FreightForm; value: string | number }> = []
    if (dd.carrierName)
      sync.push({ field: 'transporter', value: dd.carrierName })
    if (dd.motorVehicleNo)
      sync.push({ field: 'vehicleNumber', value: dd.motorVehicleNo })
    if (dd.source) sync.push({ field: 'source', value: dd.source })
    if (dd.destination)
      sync.push({ field: 'destination', value: dd.destination })
    if (dd.weight != null)
      sync.push({ field: 'weight', value: Number(dd.weight) })
    if (dd.rate != null) sync.push({ field: 'rate', value: Number(dd.rate) })
    if (dd.loadingCharges != null)
      sync.push({ field: 'loadingCharges', value: Number(dd.loadingCharges) })
    if (dd.unloadingCharges != null)
      sync.push({
        field: 'unloadingCharges',
        value: Number(dd.unloadingCharges),
      })
    if (dd.packingCharges != null)
      sync.push({ field: 'packingCharges', value: Number(dd.packingCharges) })
    if (dd.insuranceCharges != null)
      sync.push({
        field: 'insuranceCharges',
        value: Number(dd.insuranceCharges),
      })
    if (dd.otherCharges != null)
      sync.push({ field: 'otherCharges', value: Number(dd.otherCharges) })
    if (dd.discount != null)
      sync.push({ field: 'discount', value: Number(dd.discount) })

    if (sync.length === 0) return

    const current = form.getValues()
    const changed = sync.some(
      ({ field, value }) => Number(current[field] ?? 0) !== Number(value),
    )
    if (!changed) return

    sync.forEach(({ field, value }) => form.setValue(field as any, value))
  }, [data.voucherDispatchDetail, form])

  const handleFreightBill = () => {
    const formData = form.getValues()

    // Build dispatchDetail from current form values so the print validation
    // uses what the user actually entered — not stale row data. Includes the
    // additional charges + discount so the FareBreakdown on the print shows
    // the full breakdown (weight × rate + charges − discount).
    const dispatchDetail = {
      carrierName: formData.transporter,
      motorVehicleNo: formData.vehicleNumber,
      source: formData.source,
      destination: formData.destination,
      weight: formData.weight,
      freightBasis: formData.freightBasis,
      rate: formData.rate,
      loadingCharges: formData.loadingCharges,
      unloadingCharges: formData.unloadingCharges,
      packingCharges: formData.packingCharges,
      insuranceCharges: formData.insuranceCharges,
      otherCharges: formData.otherCharges,
      discount: formData.discount,
      freightCharges: formData.freightCharges,
      totalFare: formData.totalFare,
      // Include the unit so the print header can show e.g. "23.000 Mt".
      weightUnit: data.voucherDispatchDetail?.weightUnit,
      weightUnitId: data.voucherDispatchDetail?.weightUnitId,
      rateUnitId: data.voucherDispatchDetail?.rateUnitId,
    }

    saveFreight(formData, {
      onSuccess: (res) => {
        const freight = res?.data as FreightSchema | undefined
        if (!freight) return
        // The print dialog lives in the FreightProvider, not in this cell:
        // saving invalidates the grid query, and the refetch used to unmount
        // this BillCell (skeleton rows), discarding the dialog mid-open.
        openPrint({ freight, dispatchDetail })
      },
    })
  }

  return (
    <>
      <Form {...form}>
        <div className="flex justify-start items-center gap-2">
          {config.find((c) => c.key === 'freight_method')?.value === 1 ? (
            <VoucherDispatchDetail01
              form={form}
              voucherDispatchDefaultValues={dispatchDefaults}
            />
          ) : (
            <VoucherDispatchDetail02
              form={form}
              voucherDispatchDefaultValues={dispatchDefaults}
            />
          )}
          {data.id && (
            <Button
              type="button"
              className="focus:bg-slate-950 focus:text-zinc-50"
              variant="outline"
              size="sm"
              onClick={handleFreightBill}
              disabled={
                isPending || Number(data.voucherDispatchDetail?.totalFare) <= 0
              }
              title={
                Number(data.voucherDispatchDetail?.totalFare) > 0
                  ? 'Generate Freight Bill'
                  : 'Enter freight details before generating a bill'
              }
            >
              Freight Bill
            </Button>
          )}
        </div>
      </Form>
    </>
  )
}
