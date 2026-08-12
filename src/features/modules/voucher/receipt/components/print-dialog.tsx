import { IconPrinter } from '@tabler/icons-react'
import type { ReceiptSchema } from '../data/schema'
import { Button } from '@/components/ui/button'
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Dialog } from '@radix-ui/react-dialog'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'
import { useRef, useState } from 'react'

import {
  FreightPrintContent,
  DeliveryNotePrintContent,
} from '../../shared/print-content'

type Props = {
  data: ReceiptSchema
}

const PrintDialog = (props: Props) => {
  const printRef = useRef<HTMLDivElement>(null)
  const [open, onOpenChange] = useState(false)

  const handleOnClick = () => {
    // onOpenChange(false);
    if (printRef.current) {
      const printContent = printRef.current.innerHTML
      // const originalContent = document.body.innerHTML;

      document.body.innerHTML = printContent
      // new window for printing

      window.print()
      // document.body.innerHTML = originalContent;

      window.location.reload()
    }
  }
  return (
    <Dialog
      open={open}
      onOpenChange={(state) => {
        onOpenChange(state)
      }}
    >
      <DialogTrigger asChild>
        <IconPrinter
          size={30}
          title="Print Freight"
          className="cursor-pointer"
        />
      </DialogTrigger>
      <DialogContent className="sm:max-w-5xl">
        <DialogHeader className="text-left border-b-2 pb-2">
          <VisuallyHidden>
            <DialogTitle></DialogTitle>
          </VisuallyHidden>
          <DialogDescription>
            <div onClick={() => onOpenChange(false)}>
              <IconPrinter size={18} className="inline-block mr-2" /> Print{' '}
              {props.data.voucherType?.name}
            </div>
          </DialogDescription>
        </DialogHeader>
        <div
          ref={printRef}
          className="mx-auto max-h-[750px] w-[900px] 
                h-full grid  grid-rows-[auto_1fr_150px]
                 text-xl font-monospace  "
        >
          <ContentSwitcher data={props.data} />
        </div>
        <DialogFooter>
          <Button
            onClick={handleOnClick}
            className="h-8 focus:bg-black focus:text-white"
          >
            Print
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
export default PrintDialog

const ContentSwitcher = ({ data }: { data: ReceiptSchema }) => {
  if (
    data.voucherType?.name.toLowerCase() === 'sales' ||
    data.voucherType?.name.toLowerCase() === 'freight'
  ) {
    return FreightPrintContent(data)
  } else if (data.voucherType?.name.toLowerCase() === 'delivery note') {
    return DeliveryNotePrintContent(data)
  }
}

export { ContentSwitcher }
