import { IconCash, IconReceiptRupee } from '@tabler/icons-react'
import FreightReceipt from '../freight_receipt'
import type { Row } from '@tanstack/react-table'
import type { FreightVoucherSchema } from '../data/schema'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

interface PaymentProcessProps<TData> {
  row: Row<TData>
}

export default function PaymentProcessDialog<TData>({
  row,
}: PaymentProcessProps<TData>) {
  const voucher = row.original as FreightVoucherSchema
  console.log('voucher', voucher)
  // const hasPayment = voucher.paymentStatus === 'Pending';

  return (
    <>
      <Dialog>
        <DialogTrigger asChild>
          {/* <Button>{hasPayment ? 'Pay' : voucher.paymentStatus}</Button> */}
          <Button variant={'outline'}>
            <IconCash size={18} className="mr-2" />
            {'Payment Receipt'}
          </Button>
        </DialogTrigger>

        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-center underline decoration-1 decoration-gray-500 ">
              <IconReceiptRupee size={24} className="mr-2" />
              Freight Receipt
            </DialogTitle>
          </DialogHeader>
          <FreightReceipt freight={voucher} />
        </DialogContent>
      </Dialog>
    </>
  )
}
