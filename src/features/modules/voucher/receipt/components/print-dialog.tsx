import { IconPrinter } from "@tabler/icons-react"
import type { ReceiptSchema } from "../data/schema"
import { Button } from "@/components/ui/button";
import { DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Dialog } from "@radix-ui/react-dialog"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { useRef, useState } from "react";

import { numberToWords } from "@/utils/helper";
import { date_format } from "@/utils/removeEmptyStrings";







type Props = {
    data: ReceiptSchema

}

const PrintDialog = (props: Props) => {
    const printRef = useRef<HTMLDivElement>(null);
    const [open, onOpenChange] = useState(false);


    const handleOnClick = () => {
        // onOpenChange(false);
        if (printRef.current) {
            const printContent = printRef.current.innerHTML;
            // const originalContent = document.body.innerHTML;

            document.body.innerHTML = printContent;
            // new window for printing

            window.print();
            // document.body.innerHTML = originalContent;

            window.location.reload();
        }


    }
    return (
        <Dialog open={open}
            onOpenChange={(state) => { onOpenChange(state) }} >
            <DialogTrigger asChild>
                <IconPrinter size={30} title='Print Freight' className="cursor-pointer" />
            </DialogTrigger>
            <DialogContent className='sm:max-w-5xl'>
                <DialogHeader className='text-left border-b-2 pb-2'>
                    <VisuallyHidden>
                        <DialogTitle></DialogTitle>
                    </VisuallyHidden>
                    <DialogDescription>
                        <div onClick={() => onOpenChange(false)}>
                            <IconPrinter size={18} className="inline-block mr-2" /> Print {props.data.voucherType?.name}
                        </div>
                    </DialogDescription>
                </DialogHeader>
                <div ref={printRef} className='mx-auto max-h-[750px] w-[900px] 
                h-full grid  grid-rows-[auto_1fr_150px]
                 text-xl font-monospace  ' >

                    <ContentSwitcher data={props.data} />



                </div>
                <DialogFooter>
                    <Button onClick={handleOnClick} className="h-8 focus:bg-black focus:text-white" >

                        Print
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog >
    )
}
export default PrintDialog


const ContentSwitcher = ({ data }: { data: ReceiptSchema }) => {
    if (data.voucherType?.name.toLowerCase() === 'sales' || data.voucherType?.name.toLowerCase() === 'freight') {
        return FreightPrintDialog(data);
    }
    else if (data.voucherType?.name.toLowerCase() === 'delivery note') {
        return DeliveryNotePrintDialog(data);
    }
}

export { ContentSwitcher }


const FreightPrintDialog = (printData: ReceiptSchema) => {

    return (
        <>
            <div className="x-header">


                <div className="text-center text-4xl">{printData?.company?.name}</div>
                <div className="text-center font-semibold underline underline-offset-4 decoration-2 decoration-blue-700">Freight Receipt</div>
                <div className="grid grid-cols-2">
                    <div>
                        <span>Voucher No:</span> <span className="underline decoration-dotted underline-offset-4 "> {printData?.voucherNo}</span>
                    </div>
                    <div className="flex justify-end">
                        Voucher Date: <span className="underline decoration-dotted underline-offset-4 "> {date_format(printData?.voucherDate)}</span>
                    </div>
                </div>
                <div className="grid grid-cols-2 ">
                    <div className="flex gap-2">
                        <span>Dl. No.:</span> <span className="underline decoration-dotted underline-offset-4 "> {printData?.referenceNo}</span>
                    </div>
                    <div className="flex justify-end gap-2">
                        <span>Dl. Date:</span> <span className="underline decoration-dotted underline-offset-4 "> {date_format(printData?.referenceDate!)}</span>
                    </div>
                </div>
            </div>
            <div className="x-body mt-16 grid grid-cols-[1fr_200px] gap-6">
                <div className="grid  gap-4">

                    <div className="grid grid-cols-[auto_1fr] items-start  gap-4">

                        <div>Received with thanks from</div>
                        <div className="border-b-2 border-y-zinc-400 border-dotted text-xl">
                            <span className="px-4"></span>{printData?.partyLedger?.name}</div>

                    </div>
                    <div className="grid grid-cols-1 gap-4 border-dotted">

                        <div className="italic space-y-8 underline decoration-2 decoration-dotted text-justify underline-offset-8">{printData?.remarks}</div>
                    </div>
                    <div>

                        <div className="border-b-2 border-zinc-900 border-dotted italic"><span>Rupees </span> {numberToWords(printData?.amount!)}</div>
                    </div>
                    <div className="text-right">
                        Total:
                    </div>
                </div>
                <div>
                    <div className="grid grid-cols-1 border-gray-900! border-2 text-center">
                        <div className="border-gray-900 border-b-2 text-center">Amount</div>
                        <div className="grid grid-cols-[1fr_60px]">
                            <div className="border-gray-900 border-r-2">Rs.</div>
                            <div className="border-2 text-center">P.</div>
                        </div>
                        <div className="h-26 grid grid-cols-[1fr_60px]   border-gray-900 border-t-2   text-left">
                            <div className="pl-2 border-gray-900  border-r-2"> {printData?.amount?.toFixed(0)}</div>
                            <div className="text-center">
                                {((printData?.amount ?? 0) % 1).toFixed(2).split('.')[1]}
                            </div>

                        </div>
                        <div className="grid grid-cols-[1fr_60px]   border-gray-900 border-t-2   text-right">
                            <div className="text-left pl-2 border-gray-900 border-r-2">
                                {printData?.amount?.toFixed(0)}
                            </div>
                            <div className="text-center ">
                                {((printData?.amount ?? 0) % 1).toFixed(2).split('.')[1]}
                            </div>

                        </div>
                    </div>


                </div>
            </div>
            <div className="x-footer h-12 mt-12 grid grid-cols-2">

                <div className="flex flex-row items-end gap-6">
                    <div className="w-12 h-12 border-2 border-zinc-900"></div>
                    <div className="h-full text-left flex flex-col justify-end">
                        <div className="text-xl">Distributor Signature</div>
                        <div className="h-full text-xs   font-bold">Signature of Drawer</div>
                    </div>
                </div>
                <div className="h-full text-xs text-right font-bold flex justify-end items-end">For {printData?.company?.name}</div>
            </div>
        </>
    )
}

const DeliveryNotePrintDialog = (printData: ReceiptSchema) => {

    return (
        <>
            <div className="x-header">



                <div className="text-center font-semibold underline underline-offset-4 decoration-2 decoration-blue-700">Delivery Note</div>
                <div className="grid grid-cols-2">
                    <div className="flex flex-col justify-start items-start">

                        <div className="underline decoration-dotted underline-offset-4 ">Delivery From:</div>
                        <div> {printData?.company?.name}</div>
                        <div className="">
                            <span>Dl. No:</span> <span className="underline decoration-dotted underline-offset-4 "> {printData?.voucherNo}</span>
                        </div>
                        <div className="">
                            Date: <span className="underline decoration-dotted underline-offset-4 "> {date_format(printData?.voucherDate)}</span>
                        </div>

                    </div>
                    <div className="flex flex-col items-end justify-end">
                        <div className="underline decoration-dotted underline-offset-4 ">Delivery To</div>
                        <div className="text-center">{printData?.party?.name}</div>
                        <div className="text-sm">
                            <div className="text-right">{printData?.party?.line1}</div>
                            <div className="text-right">{printData?.party?.line2}</div>
                            <div className="text-right">{printData?.party?.line3} {printData?.party?.state?.code ?? 'WB'}, {printData?.party?.country?.name ?? 'India'}</div>

                        </div>
                        <div>
                            <span>Transport Name:</span> <span className="underline decoration-dotted underline-offset-4 "> {printData?.voucherDispatchDetail?.carrierName}</span>
                        </div>
                        <div className="">
                            Truck No: <span className="underline decoration-dotted underline-offset-4 "> {printData?.voucherDispatchDetail?.motorVehicleNo}</span>
                        </div>
                    </div>
                </div>

            </div>
            <div className="x-body mt-2 ">
                <div className="grid grid-cols-[1fr_150px_150px_150px] gap-2 border-b-2 border-t-2 border-gray-900  text-center font-bold">

                    <div className="text-left">Particulars</div>
                    <div className="text-center">Qty</div>
                    <div className="text-right">Rate</div>
                    <div className="text-right">Amount</div>
                </div>
                {printData.stockJournal?.stockJournalEntries?.map((entry, index) => (
                    <div key={index} className="grid grid-cols-[1fr_150px_150px_150px]   border-gray-900  text-center">
                        <div className="text-left">{entry?.stockItem?.name}</div>
                        <div className="text-center">{entry?.actualQuantity} {entry?.stockItem?.stockUnit?.code}</div>
                        <div className="text-right">{entry?.rate?.toFixed(2)}/ {entry?.stockItem?.stockUnit?.code}</div>
                        <div className="text-right">{entry?.amount?.toFixed(2)}</div>
                        <div className="col-span-4">
                            {entry?.stockJournalGodownEntries?.map((godownEntry, godownIndex) => (
                                <div key={godownIndex} className="grid grid-cols-[1fr_150px_150px_150px] gap-2 text-sm">
                                    <div className="grid grid-cols-[100px_1fr] gap-2">
                                        <div className="text-right">Batch: </div>
                                        <div className="text-left uppercase">{godownEntry?.batchNo}</div>
                                    </div>
                                    <div className="text-center">{godownEntry?.actualQuantity} {entry?.stockItem?.stockUnit?.code}</div>
                                    <div></div>
                                    <div></div>
                                </div>
                            ))}

                        </div>
                    </div>
                ))}
                <div>
                    <div className="grid grid-cols-[1fr_150px_150px_150px] gap-2 border-t-2 border-gray-900  text-center font-bold">
                        <div className="text-left"></div>
                        <div></div>
                        <div className="text-right pr-2">Total: </div>
                        <div className="text-right">{printData.stockJournal?.stockJournalEntries?.reduce((total, entry) => total + (entry?.amount || 0), 0).toFixed(2)}</div>
                    </div>
                </div>
                <div className="border-b-2 border-zinc-900 border-dotted italic"><span>Rupees </span> {numberToWords(printData?.amount!)}</div>


            </div>
            <div className="x-footer h-12 mt-12 grid grid-cols-2">

                <div className="flex flex-row items-end gap-6">
                    <div className="w-12 h-12 border-2 border-zinc-900"></div>
                    <div className="h-full text-left flex flex-col justify-end">
                        <div className=" text-sm   font-bold">Signature of Recipient</div>
                    </div>
                </div>
                <div className="h-full text-xs text-right font-bold flex justify-end items-end">For {printData?.company?.name}</div>
            </div>
        </>
    )
}
