
import { useFormContext } from "react-hook-form"

import { Input } from '@/components/ui/input'
import { type DeliveryNoteForm } from '../data/schema'

import FormInputField from '@/components/form-input-field'
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import type { DeliveryNoteProps } from "../pos/contracts"
import { StockJournalComponent } from "./stock-journal/stock-journal-component"
import PartyLedgerForm from "./sub-component/party/party-ledger-form"
import PurchaseLedgerForm from "./sub-component/transaction/transaction-ledger-form"





const FormAction = ({ currentRow }: DeliveryNoteProps) => {
    // const isEdit = !!currentRow
    // const navigate = useNavigate()

    // const methods = useFormContext<DeliveryNoteForm>()

    console.log(currentRow)


    return (

        <div className="grid grid-rows-[230px_1fr_100px]">
            <VoucherHeader />
            <BodyComponent />

            <FooterComponent />
        </div>
    )
}
export default FormAction




const formatDateForInput = (date: Date) => {
    const d = new Date(date)
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, "0") // months 0-11
    const day = String(d.getDate()).padStart(2, "0")
    return `${year}-${month}-${day}`
}
const VoucherHeader = () => {
    // const form = useFormContextDeliveryNote()
    const methods = useFormContext<DeliveryNoteForm>()
    const { watch } = useFormContext<DeliveryNoteForm>()
    const voucherDate = watch("voucherDate")
    const inputValue = voucherDate
        ? formatDateForInput(new Date(voucherDate))
        : formatDateForInput(new Date()) // today in local timezone
    const dayName = voucherDate
        ? new Date(voucherDate).toLocaleDateString("en-US", { weekday: "long" })
        : ""


    return (
        <div className="grid grid-rows-1 mt-2 ">
            <div className="grid grid-cols-[350px_1fr_200px] border-amber-300 border-0">

                <div className="space-y-0">
                    <div className="grid grid-cols-[120px_200px] gap-2">
                        <div className="bg-red-400 text-gray-100 px-2">Delivery Note</div>
                        <div>No: {methods.getValues('voucherNo') ?? 'new'}  </div>
                    </div>
                    <div className="grid grid-cols-[250px_300px] gap-6 pt-2">
                        <div className="grid grid-cols-[40px_200px]">
                            <FormInputField form={methods} gapClass={"grid grid-cols-[90px_150px] gap-4"} type="text" name="referenceNo" label="Reference No." />
                        </div>
                        <div className="grid grid-cols-[110px_150px]">
                            <Label>Reference Date:</Label>

                            <Input
                                type="date"
                                {...methods.register("referenceDate", {
                                    setValueAs: (value) => (value ? new Date(value) : null), // store as Date
                                })}
                                value={inputValue}
                                onChange={(e) => {
                                    if (e.target.value) {
                                        methods.setValue("referenceDate", new Date(e.target.value))
                                    }
                                }}
                            />
                        </div>
                    </div>

                </div>
                <div></div>
                <div className="grid grid-rows-2 justify-end ">


                    <Input
                        type="date"
                        {...methods.register("voucherDate", {
                            setValueAs: (value) => (value ? new Date(value) : null), // store as Date
                        })}
                        value={inputValue}
                        onChange={(e) => {
                            if (e.target.value) {
                                methods.setValue("voucherDate", new Date(e.target.value))
                            }
                        }}
                    />
                    <div className="text-right text-sm font-bold">{dayName}</div>

                </div>
            </div>
            <div className="grid grid-cols-2 gap-2 pb-2">
                <div className="grid grid-rows-2 gap-2 items-center">
                    <PartyLedgerForm />
                    <PurchaseLedgerForm form={methods} />

                </div>
                <div className="sm:hidden grid grid-cols-2 gap-2 items-center">
                    <div className="text-right">Cost Center: </div><Input type="text" />
                </div>
            </div>
        </div>
    )
}

const BodyComponent = () => {


    return (
        <div className="bg-violet-400/20 h-[25rem]">
            {/* <StockJournalEntries /> */}
            <StockJournalComponent />
            {/* <pre>

                {JSON.stringify(register)}
            </pre> */}
        </div>
    )
}



const FooterComponent = () => {
    return (
        <div className="bg-red-300/20 grid grid-cols-[1fr_1fr]">
            <div className="grid ">
                <div>
                    <div className="text-sm">Narration:</div>
                    <div contentEditable className="narration caret-accent caret-underscore caret-unde justify-self-end bg-black text-gray-100 w-full h-full text-sm  font-semibold  "></div>
                </div>
                <div className="narration"></div>
            </div>
            <div className="grid grid-rows-2 justify-end">

                <div className="text-right">
                    Total: 50000
                </div>
                <div className="text-right">
                    <Button type="submit">Save....</Button>
                </div>
            </div>

        </div>

    )
}