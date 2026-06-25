import { Form } from "@/components/ui/form"
import { useFocusArea } from "@/core/hooks/useFocusArea"
import { useRestrictFocusToRef } from "@/core/hooks/useRestrictFocusToRef"
import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect, useRef } from "react"
import { useForm, type Resolver } from "react-hook-form"
import receiptNoteDefaultValues from "../data/data"
import { formSchema, type ReceiptNoteForm } from "../data/schema"
import PosBody from "./components/pos-body"
import PosFooter from "./components/pos-footer"
import PosHeader from "./components/pos-header"
import type { ReceiptNoteProps } from "./contracts"
import { usePos } from "../../contexts/pos-context"


const Pos = ({ currentRow }: ReceiptNoteProps) => {
    const areaRef = useRef<HTMLDivElement>(null);
    const { setMovementType } = usePos()
    useFocusArea(areaRef as React.RefObject<HTMLElement>);
    useRestrictFocusToRef(areaRef as React.RefObject<HTMLElement>);
    const isEdit = !!currentRow
    const data = { ...currentRow } 
    const mainForm = useForm<ReceiptNoteForm>({
        resolver: zodResolver(formSchema) as Resolver<ReceiptNoteForm>,
        defaultValues: isEdit ?
            { ...data, isEdit: true, } :
            { ...receiptNoteDefaultValues, isEdit: false },
    })
    useEffect(() => {
        const movementTypeValue = isEdit ? (data?.stockJournal?.stockJournalEntries?.[0]?.movementType || "in") : "in"
        setMovementType?.(movementTypeValue)
    }, [isEdit, data, setMovementType])
    // console.log("WATCH voucherEntries: ", mainForm.getValues())
    return (
        <>

            <div ref={areaRef} className="voucher-entry w-full grid grid-rows-[1fr_100px] 
         h-[calc(100dvh-170px)]  ">
                <Form {...mainForm}>
                    <div className="max-h-full grid grid-rows-[200px_1fr] overflow-hidden">

                        <PosHeader mainForm={mainForm} />
                        <PosBody mainForm={mainForm} />
                    </div>
                    <PosFooter mainForm={mainForm} />
                </Form>
            </div>
        </>
    )
}

export default Pos