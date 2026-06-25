import { useEffect, useState } from 'react'
import {  useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { lowerCase } from 'lodash'
import { formSchema } from '../data/schema'
import { useFreightMutation } from '../data/queryOptions'
import { useFreight } from '../contexts/freight-context'
import { voucherDispatchDefaultValues } from '../../delivery_note/data/data'
import VoucherDispatchDetail01 from './voucher-dispatch-detail01'
import VoucherDispatchDetail02 from './voucher-dispatch-detail02'
import PrintFreightDialog from './print-freight-dialog'
import type { FreightForm, FreightSchema } from '../data/schema'
import type { VoucherSchema } from '../../data-schema/voucher-schema'
import type { CellContext } from '@tanstack/react-table'
import type {Resolver} from 'react-hook-form';
import { Button } from '@/components/ui/button'
import { Form } from '@/components/ui/form'

export default function BillCell({ row }: CellContext<VoucherSchema, unknown>) {
  const data = row.original
  const { config } = useFreight()
  const { mutate: saveFreight, isPending } = useFreightMutation()
  const [freightData, setFreightData] = useState<FreightSchema | null>(null)
  const [printDialogOpen, setPrintDialogOpen] = useState(false)
  const [printDispatchDetail, setPrintDispatchDetail] = useState<Record<string, unknown> | null>(null)

  const form = useForm<FreightForm>({
    resolver: zodResolver(formSchema) as Resolver<FreightForm>,
    defaultValues: {
      deliveryNoteId: data.id,
      transporter: data.voucherDispatchDetail?.carrierName || '',
      source:
        data.voucherDispatchDetail?.source ||
        data.stockJournal?.stockJournalEntries?.[0]?.stockJournalGodownEntries?.[0]?.godown?.name ||
        '',
      destination: data.voucherDispatchDetail?.destination || '',
      distance: data.voucherDispatchDetail?.distance || 0,
      vehicleNumber: data.voucherDispatchDetail?.motorVehicleNo || '',
      weight:
        data.voucherDispatchDetail?.weight ||
        data.stockJournal?.stockJournalEntries?.reduce(
          (sum: number, entry: any) => sum + (Number(entry.actualQuantity) || 0),
          0,
        ) ||
        0,
      weightUnitId: data.voucherDispatchDetail?.weightUnitId || 16,
      volume: data.voucherDispatchDetail?.volume || 0,
      volumeUnitId: data.voucherDispatchDetail?.volumeUnitId || 10,
      freightBasis: data.voucherDispatchDetail?.freightBasis || 'weight',
      rate: data.voucherDispatchDetail?.rate || 0,
      rateUnitId: data.voucherDispatchDetail?.rateUnitId || 16,
      freightCharges: data.voucherDispatchDetail?.freightCharges || 0,
      totalFare: data.voucherDispatchDetail?.totalFare || 0,
      dispatchSourceId:
        data.stockJournal?.stockJournalEntries?.[0]?.stockJournalGodownEntries?.[0]?.godownId || null,
      isEdit: false,
    },
  })

  const distance = form.watch('distance')
  const volume = form.watch('volume')
  const weight = form.watch('weight')
  const freightBasis = form.watch('freightBasis')
  const rate = form.watch('rate')

  useEffect(() => {
    if (lowerCase(freightBasis) === 'distance') {
      const totalFare = distance! * rate
      form.setValue('totalFare', totalFare)
      form.setValue('freightCharges', totalFare)
    } else if (lowerCase(freightBasis) === 'weight') {
      const totalFare = weight! * rate
      form.setValue('totalFare', totalFare)
      form.setValue('freightCharges', totalFare)
    } else if (lowerCase(freightBasis) === 'volume') {
      const totalFare = volume! * rate
      form.setValue('totalFare', totalFare)
      form.setValue('freightCharges', totalFare)
    }
  }, [distance, weight, volume, freightBasis, rate, form])

  const handleFreightBill = () => {
    const formData = form.getValues()

    // Build dispatchDetail from current form values so the print validation
    // uses what the user actually entered — not stale row data
    setPrintDispatchDetail({
      carrierName: formData.transporter,
      motorVehicleNo: formData.vehicleNumber,
      source: formData.source,
      destination: formData.destination,
      weight: formData.weight,
      freightBasis: formData.freightBasis,
      rate: formData.rate,
      totalFare: formData.totalFare,
    })

    saveFreight(formData, {
      onSuccess: (res) => {
        setFreightData(res?.data as FreightSchema ?? null)
        setPrintDialogOpen(true)
      },
    })
  }

  return (
    <>
      {printDialogOpen && freightData && (
        <PrintFreightDialog
          open={printDialogOpen}
          onOpenChange={setPrintDialogOpen}
          freightData={freightData}
          dispatchDetail={printDispatchDetail ?? data.voucherDispatchDetail as Record<string, unknown> | null | undefined}
        />
      )}
      <Form {...form}>
        <div className='flex justify-start items-center gap-2'>
          {config.find((c) => c.key === 'freight_method')?.value === 1 ? (
            <VoucherDispatchDetail01
              form={form}
              voucherDispatchDefaultValues={{
                ...voucherDispatchDefaultValues,
                voucherId: data.voucherDispatchDetail?.voucherId,
                ...data.voucherDispatchDetail,
              }}
            />
          ) : (
            <VoucherDispatchDetail02
              form={form}
              voucherDispatchDefaultValues={{
                ...voucherDispatchDefaultValues,
                voucherId: data.voucherDispatchDetail?.voucherId,
                ...data.voucherDispatchDetail,
              }}
            />
          )}
          {Number(data.voucherDispatchDetail?.totalFare) > 0 && data.id && (
            <Button
              type='button'
              className='focus:bg-slate-950 focus:text-zinc-50'
              variant='outline'
              size='sm'
              onClick={handleFreightBill}
              disabled={isPending}
            >
              Freight Bill
            </Button>
          )}
        </div>
      </Form>
    </>
  )
}
