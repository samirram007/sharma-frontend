import { useMemo } from 'react'
import { IconCash, IconReceiptRupee } from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import FreightReceipt from '../freight_receipt'

export interface VoucherDetailLike {
  voucherId: number
  voucherNo: string
  voucherDate: string | null
  partyName: string | null
  dispatchedThrough?: string | null
  carrierName?: string | null
  motorVehicleNo?: string | null
  source?: string | null
  destination?: string | null
  billOfLadingNo?: string | null
  weight?: number
  volume?: number
  amount: number
  paymentStatus?: string | null
}

/** Build a compact dispatch summary label from voucher detail fields */
export function buildDispatchLabel(detail: VoucherDetailLike): string {
  const parts: string[] = []

  if (detail.dispatchedThrough) parts.push(detail.dispatchedThrough)
  if (detail.carrierName && !parts.includes(detail.carrierName))
    parts.push(detail.carrierName)
  if (detail.motorVehicleNo) parts.push(`V:${detail.motorVehicleNo}`)

  const route = [detail.source, detail.destination].filter(Boolean).join(' → ')
  if (route) parts.push(route)

  if (detail.billOfLadingNo) parts.push(`BL:${detail.billOfLadingNo}`)
  if ((detail.weight ?? 0) > 0)
    parts.push(`${(detail.weight ?? 0).toFixed(1)}kg`)
  if ((detail.volume ?? 0) > 0)
    parts.push(`${(detail.volume ?? 0).toFixed(1)}m³`)

  return parts.length > 0 ? parts.join(' | ') : '-'
}

/** Action button that opens the freight payment receipt dialog */
export function VoucherPaymentAction({
  detail,
}: {
  detail: VoucherDetailLike
}) {
  const adaptedFreight = useMemo(
    () => ({
      id: detail.voucherId,
      voucherNo: detail.voucherNo,
      voucherDate: detail.voucherDate ?? '',
      amount: detail.amount,
      partyLedger: detail.partyName
        ? { id: null, name: detail.partyName, code: '' }
        : null,
      paymentStatus: detail.paymentStatus ?? 'unpaid',
    }),
    [detail],
  )

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="h-6 text-[10px] px-1.5 gap-0.5">
          <IconCash className="h-3 w-3" />
          Pay
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-center underline decoration-1 decoration-gray-500">
            <IconReceiptRupee size={24} className="mr-2" />
            Freight Receipt
          </DialogTitle>
        </DialogHeader>
        <FreightReceipt freight={adaptedFreight as any} />
      </DialogContent>
    </Dialog>
  )
}
